/**
 * bulusuhub.com subscriber backend (Google Apps Script + Google Sheet)
 *
 * What it does
 *  - doPost:  receives an email from the website's subscribe form and stores it in the
 *             "Subscribers" sheet (no duplicates; re-subscribing reactivates).
 *  - doGet:   handles one-click unsubscribe links sent in every email.
 *  - sendNextPost: emails the next unsent row of the "Outbox" sheet to all active subscribers.
 *             Run it by hand, or add a daily time trigger.
 *
 * Setup: see SETUP.md. Run setup() once from the editor before deploying.
 */

var SETTINGS = {
  FROM_NAME: "Chaiitanya Bulusu",
  REPLY_TO: "bulusu@bulusuhub.com",
  SITE_URL: "https://bulusuhub.com",
  // Required by US anti-spam law (CAN-SPAM) in every commercial email: a valid postal address.
  // A PO box or a registered business address is fine.
  POSTAL_ADDRESS: "REPLACE WITH YOUR POSTAL ADDRESS OR PO BOX"
};

var SUBS = "Subscribers";
var OUTBOX = "Outbox";
var IDEAS = "Ideas";

/** Run once from the editor. Creates the sheets and a private unsubscribe secret. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName(SUBS) || ss.insertSheet(SUBS);
  if (s.getLastRow() === 0) {
    s.appendRow(["Email", "Status", "Subscribed at", "Source", "Page", "Unsubscribed at"]);
    s.setFrozenRows(1);
    s.getRange("A1:F1").setFontWeight("bold");
  }
  var o = ss.getSheetByName(OUTBOX) || ss.insertSheet(OUTBOX);
  if (o.getLastRow() === 0) {
    o.appendRow(["Title", "URL", "Summary", "Sent at", "Recipients"]);
    o.setFrozenRows(1);
    o.getRange("A1:E1").setFontWeight("bold");
  }
  var i = ss.getSheetByName(IDEAS) || ss.insertSheet(IDEAS);
  if (i.getLastRow() === 0) {
    i.appendRow(["Received at", "Name", "Role", "Idea", "Status (type: approved)"]);
    i.setFrozenRows(1);
    i.getRange("A1:E1").setFontWeight("bold");
    i.setColumnWidth(4, 480);
  }
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty("SECRET")) props.setProperty("SECRET", Utilities.getUuid() + Utilities.getUuid());
  Logger.log("Setup complete.");
}

/** Website form posts here. */
function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.type === "idea") return saveIdea(p);
  var email = String(p.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return json({ ok: false, error: "invalid" });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUBS);
    var row = findRow(sheet, email);
    var now = new Date();
    if (row) {
      if (sheet.getRange(row, 2).getValue() !== "active") {
        sheet.getRange(row, 2, 1, 5).setValues([["active", now, clip(p.source), clip(p.page), ""]]);
      }
      return json({ ok: true, status: "exists" });
    }
    sheet.appendRow([email, "active", now, clip(p.source), clip(p.page), ""]);
    return json({ ok: true, status: "added" });
  } finally {
    lock.releaseLock();
  }
}

/** Unsubscribe links land here: ?action=unsubscribe&email=...&t=... */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === "ideas") return json({ ideas: approvedIdeas() });
  if (p.action === "unsubscribe" && p.email && p.t === token(p.email)) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUBS);
    var row = findRow(sheet, String(p.email).toLowerCase());
    if (row) sheet.getRange(row, 2, 1, 5).setValues([["unsubscribed",
      sheet.getRange(row, 3).getValue(), sheet.getRange(row, 4).getValue(), sheet.getRange(row, 5).getValue(), new Date()]]);
    return page("You are unsubscribed", "You will not receive further emails. You can subscribe again anytime at " + SETTINGS.SITE_URL + ".");
  }
  return page("bulusuhub.com", "Nothing to see here. Visit " + SETTINGS.SITE_URL + ".");
}

/**
 * Sends the next unsent Outbox row to every active subscriber.
 * Add a row to Outbox (Title, URL, Summary), then run this, or let a daily trigger run it.
 */
function sendNextPost() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var outbox = ss.getSheetByName(OUTBOX);
  var rows = outbox.getDataRange().getValues();
  var r = -1;
  for (var i = 1; i < rows.length; i++) { if (rows[i][0] && !rows[i][3]) { r = i; break; } }
  if (r < 0) { Logger.log("Nothing to send."); return; }
  var title = rows[r][0], url = rows[r][1], summary = rows[r][2];

  var subs = ss.getSheetByName(SUBS).getDataRange().getValues().slice(1)
    .filter(function (x) { return x[1] === "active"; }).map(function (x) { return x[0]; });
  var quota = MailApp.getRemainingDailyQuota();
  if (subs.length > quota) {
    throw new Error("Daily email quota is " + quota + " but there are " + subs.length +
      " active subscribers. Nothing was sent. Move the list to a newsletter service (see SETUP.md).");
  }

  var execUrl = ScriptApp.getService().getUrl();
  subs.forEach(function (email) {
    var unsub = execUrl + "?action=unsubscribe&email=" + encodeURIComponent(email) + "&t=" + token(email);
    var html =
      '<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#15181d;line-height:1.6">' +
      '<p style="font:600 12px Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#b4431a">Daily note</p>' +
      '<h1 style="font-size:24px;line-height:1.25;margin:8px 0 14px">' + escapeHtml(title) + '</h1>' +
      '<p style="font-size:17px;color:#3a3f47">' + escapeHtml(summary) + '</p>' +
      '<p><a href="' + url + '" style="display:inline-block;background:#15181d;color:#fff;text-decoration:none;font:600 14px Arial,sans-serif;padding:11px 16px;border-radius:6px">Read the note</a></p>' +
      '<hr style="border:0;border-top:1px solid #e6e4de;margin:28px 0 14px">' +
      '<p style="font:12px Arial,sans-serif;color:#9aa0a9">You are receiving this because you subscribed at bulusuhub.com.<br>' +
      escapeHtml(SETTINGS.POSTAL_ADDRESS) + '<br><a href="' + unsub + '" style="color:#9aa0a9">Unsubscribe</a></p></div>';
    var text = title + "\n\n" + summary + "\n\nRead: " + url + "\n\n--\n" + SETTINGS.POSTAL_ADDRESS + "\nUnsubscribe: " + unsub;
    MailApp.sendEmail({ to: email, subject: title, body: text, htmlBody: html, name: SETTINGS.FROM_NAME, replyTo: SETTINGS.REPLY_TO });
  });

  outbox.getRange(r + 1, 4, 1, 2).setValues([[new Date(), subs.length]]);
  Logger.log("Sent '" + title + "' to " + subs.length + " subscribers.");
}

// ---------- ideas (community page) ----------
/** Stores an idea as "pending". Change the Status cell to "approved" to show it on the idea wall. */
function saveIdea(p) {
  var idea = String(p.idea || "").trim().slice(0, 1000);
  if (idea.length < 10) return json({ ok: false, error: "too short" });
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(IDEAS)
      .appendRow([new Date(), clip(p.name), String(p.role || "").slice(0, 100), idea, "pending"]);
  } finally { lock.releaseLock(); }
  return json({ ok: true });
}

/** Approved ideas, newest first. Only name, role, idea and date are made public. */
function approvedIdeas() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(IDEAS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues()
    .filter(function (r) { return String(r[4]).trim().toLowerCase() === "approved" && r[3]; })
    .map(function (r) {
      return { date: Utilities.formatDate(new Date(r[0]), "UTC", "yyyy-MM-dd"), name: String(r[1]), role: String(r[2]), idea: String(r[3]) };
    })
    .reverse()
    .slice(0, 60);
}

// ---------- helpers ----------
function findRow(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var vals = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]).toLowerCase() === email) return i + 2;
  return 0;
}
function token(email) {
  var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  var sig = Utilities.computeHmacSha256Signature(String(email).toLowerCase(), secret);
  return Utilities.base64EncodeWebSafe(sig).slice(0, 22);
}
function clip(s) { return String(s || "").slice(0, 120); }
function escapeHtml(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function page(h, msg) {
  return HtmlService.createHtmlOutput('<div style="font-family:Georgia,serif;max-width:520px;margin:80px auto;padding:0 24px;color:#15181d"><h1 style="font-size:28px">' +
    escapeHtml(h) + '</h1><p style="color:#5f6672;font-size:18px">' + escapeHtml(msg) + '</p></div>').setTitle(h);
}
