(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var DATA = window.SITE_DATA || { posts: [], articles: [] };

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function fmtDate(d) {
    if (!d) return "";
    var p = String(d).split("-");
    if (p.length === 3) return MONTHS[+p[1] - 1] + " " + (+p[2]) + ", " + p[0];
    if (p.length === 2) return MONTHS[+p[1] - 1] + " " + p[0];
    return p[0];
  }
  function byDateDesc(a, b) { return String(b.date).localeCompare(String(a.date)); }
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { return null; }
  }
  var posts = (DATA.posts || []).slice().sort(byDateDesc);
  var articles = (DATA.articles || []).slice().sort(byDateDesc);

  // ---------- home: daily posts ----------
  var postsEl = document.getElementById("posts");
  if (postsEl) {
    var limit = 7, showingAll = false, postFilter = "All";
    function renderPosts() {
      var list = posts.filter(function (p) { return postFilter === "All" || p.track === postFilter; });
      var shown = showingAll ? list : list.slice(0, limit);
      postsEl.innerHTML = shown.length ? shown.map(function (p) {
        return '<li class="item"><div class="meta"><span>' + esc(fmtDate(p.date)) + '</span>' +
          (p.track ? '<span class="track">' + esc(p.track) + '</span>' : '') + '</div>' +
          '<h3><a href="post.html?p=' + encodeURIComponent(p.id) + '">' + esc(p.title) + '</a></h3>' +
          (p.summary ? '<p>' + esc(p.summary) + '</p>' : '') + '</li>';
      }).join("") : '<li class="empty">No posts in this track yet.</li>';
      var more = document.getElementById("posts-more");
      if (more) more.style.display = (!showingAll && list.length > limit) ? "" : "none";
    }
    var moreBtn = document.getElementById("posts-more");
    if (moreBtn) moreBtn.addEventListener("click", function () { showingAll = true; renderPosts(); });
    wireFilters("post-filters", function (v) { postFilter = v; renderPosts(); });
    renderPosts();
  }

  // ---------- home: published articles ----------
  var artEl = document.getElementById("articles");
  if (artEl) {
    var artFilter = "All";
    function renderArticles() {
      var list = articles.filter(function (a) { return artFilter === "All" || a.track === artFilter; });
      artEl.innerHTML = list.length ? list.map(function (a) {
        var live = a.url && a.status !== "Forthcoming";
        var title = live
          ? '<a href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(a.title) + ' <span class="arrow">&#8599;</span></a>'
          : esc(a.title);
        return '<li class="item"><div class="meta"><span>' + esc(a.outlet) + '</span><span>' + esc(fmtDate(a.date)) + '</span>' +
          (a.track ? '<span class="track">' + esc(a.track) + '</span>' : '') +
          (!live ? '<span class="badge">' + esc(a.status || "Forthcoming") + '</span>' : '') + '</div>' +
          '<h3>' + title + '</h3></li>';
      }).join("") : '<li class="empty">No articles in this track yet.</li>';
    }
    wireFilters("article-filters", function (v) { artFilter = v; renderArticles(); });
    renderArticles();
  }

  function wireFilters(id, onChange) {
    var box = document.getElementById(id);
    if (!box) return;
    box.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      Array.prototype.forEach.call(box.querySelectorAll(".chip"), function (c) { c.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      onChange(b.getAttribute("data-v"));
    });
  }

  // ---------- post page ----------
  var postEl = document.getElementById("post");
  if (postEl) {
    var id = new URLSearchParams(location.search).get("p");
    var idx = -1;
    posts.forEach(function (p, i) { if (p.id === id) idx = i; });
    if (idx < 0) {
      postEl.innerHTML = '<h1>Post not found</h1><p><a href="index.html">Back to all writing</a></p>';
    } else {
      var p = posts[idx];
      document.title = p.title + " | " + (CFG.AUTHOR || "");
      var md = document.querySelector('meta[name="description"]');
      if (md && p.summary) md.setAttribute("content", p.summary);
      var html = String(p.body || "").trim().split(/\n\s*\n/).map(function (block) {
        block = block.trim();
        if (block.indexOf("## ") === 0) return "<h2>" + esc(block.slice(3)) + "</h2>";
        return "<p>" + esc(block).replace(/\n/g, "<br>") + "</p>";
      }).join("");
      postEl.innerHTML = '<div class="meta"><span>' + esc(fmtDate(p.date)) + '</span>' +
        (p.track ? '<span class="track">' + esc(p.track) + '</span>' : '') + '</div>' +
        '<h1>' + esc(p.title) + '</h1><div class="body">' + html + '</div>';
      var newer = posts[idx - 1], older = posts[idx + 1];
      var nav = document.getElementById("post-nav");
      if (nav) nav.innerHTML =
        (older ? '<a href="post.html?p=' + encodeURIComponent(older.id) + '">&larr; ' + esc(older.title) + '</a>' : '<span></span>') +
        (newer ? '<a href="post.html?p=' + encodeURIComponent(newer.id) + '" style="text-align:right">' + esc(newer.title) + ' &rarr;</a>' : '<span></span>');
    }
  }

  // ---------- subscribe ----------
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  Array.prototype.forEach.call(document.querySelectorAll("form.sub-form"), function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type=email]');
      var hp = form.querySelector('input[name=company]');
      var note = form.parentNode.querySelector(".sub-note");
      var btn = form.querySelector("button");
      var email = (input.value || "").trim().toLowerCase();
      function say(msg, cls) { if (note) { note.textContent = msg; note.className = "sub-note " + (cls || ""); } }
      if (!EMAIL_RE.test(email)) return say("Please enter a valid email address.", "err");
      if (hp && hp.value) return say("Thanks, you are subscribed.", "ok"); // bot trap
      if (!CFG.SUBSCRIBE_ENDPOINT) return say("Subscriptions are not connected yet. Please email " + (CFG.EMAIL || "me") + ".", "err");
      btn.disabled = true; say("Subscribing...");
      var body = new URLSearchParams({ email: email, source: form.getAttribute("data-source") || "site", page: location.pathname });
      fetch(CFG.SUBSCRIBE_ENDPOINT, { method: "POST", mode: "no-cors", body: body })
        .then(function () {
          say("You are subscribed. New posts will arrive in your inbox.", "ok");
          input.value = "";
          store("cb_subscribed", "1");
          if (form.closest(".modal")) setTimeout(closeModal, 1800);
        })
        .catch(function () { say("Something went wrong. Please try again in a moment.", "err"); })
        .then(function () { btn.disabled = false; });
    });
  });

  // ---------- popup ----------
  var modal = document.getElementById("subscribe-modal");
  function openModal() { if (!modal) return; modal.classList.add("open"); var i = modal.querySelector("input[type=email]"); if (i) setTimeout(function () { i.focus(); }, 50); }
  function closeModal() { if (!modal) return; modal.classList.remove("open"); store("cb_popup_closed", String(Date.now())); }
  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest(".close")) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-open-subscribe]"), function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); openModal(); });
    });
    var closedAt = +(store("cb_popup_closed") || 0);
    var quiet = (CFG.POPUP_REPEAT_DAYS || 7) * 864e5;
    var eligible = !store("cb_subscribed") && (Date.now() - closedAt > quiet);
    if (eligible) {
      var fired = false;
      function auto() { if (fired) return; fired = true; window.removeEventListener("scroll", onScroll); openModal(); }
      function onScroll() {
        var h = document.documentElement;
        var pct = (h.scrollTop + window.innerHeight) / h.scrollHeight * 100;
        if (pct >= (CFG.POPUP_SCROLL_PERCENT || 50)) auto();
      }
      setTimeout(auto, (CFG.POPUP_DELAY_SECONDS || 25) * 1000);
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }

  // ---------- footer ----------
  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
