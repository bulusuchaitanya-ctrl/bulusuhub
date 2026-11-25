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

  // ---------- home: published articles + interviews ----------
  function renderLinkList(elId, filterId, items) {
    var el = document.getElementById(elId);
    if (!el) return;
    var f = "All";
    function draw() {
      var list = items.filter(function (a) { return f === "All" || a.track === f; });
      el.innerHTML = list.length ? list.map(function (a) {
        var live = a.url && a.status !== "Forthcoming";
        var title = live
          ? '<a href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(a.title) + ' <span class="arrow">&#8599;</span></a>'
          : esc(a.title);
        return '<li class="item"><div class="meta"><span>' + esc(a.outlet) + '</span>' +
          (a.date ? '<span>' + esc(fmtDate(a.date)) + '</span>' : '') +
          (a.track ? '<span class="track">' + esc(a.track) + '</span>' : '') +
          (!live ? '<span class="badge">' + esc(a.status || "Forthcoming") + '</span>' : '') + '</div>' +
          '<h3>' + title + '</h3></li>';
      }).join("") : '<li class="empty">Nothing in this track yet.</li>';
    }
    wireFilters(filterId, function (v) { f = v; draw(); });
    draw();
  }
  renderLinkList("articles", "article-filters", articles);
  renderLinkList("interviews", null, (DATA.interviews || []).slice().sort(byDateDesc));

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

  // ---------- home: latest + counts ----------
  var hn = document.getElementById("home-notes");
  if (hn) hn.innerHTML = posts.slice(0, 3).map(function (p) {
    return '<li class="item"><div class="meta"><span>' + esc(fmtDate(p.date)) + '</span>' + (p.track ? '<span class="track">' + esc(p.track) + '</span>' : '') +
      '</div><h3><a href="post.html?p=' + encodeURIComponent(p.id) + '">' + esc(p.title) + '</a></h3></li>';
  }).join("") || '<li class="empty">First note coming soon.</li>';
  var ha = document.getElementById("home-articles");
  if (ha) ha.innerHTML = articles.filter(function (a) { return a.url && a.status !== "Forthcoming"; }).slice(0, 4).map(function (a) {
    return '<li class="item"><div class="meta"><span>' + esc(a.outlet) + '</span><span>' + esc(fmtDate(a.date)) + '</span></div>' +
      '<h3><a href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(a.title) + ' <span class="arrow">&#8599;</span></a></h3></li>';
  }).join("");
  var sp = document.getElementById("stat-pieces");
  if (sp) sp.textContent = articles.filter(function (a) { return a.url && a.status !== "Forthcoming"; }).length + (DATA.interviews || []).filter(function (a) { return a.url; }).length;

  // ---------- home: speaking photos ----------
  var gal = document.getElementById("speaking-gallery");
  var photos = window.SPEAKING_PHOTOS || [];
  if (gal && photos.length) {
    gal.innerHTML = photos.map(function (ph) {
      return '<figure><img src="' + esc(ph.src) + '" alt="' + esc(ph.caption || "Speaking") + '" loading="lazy">' +
        (ph.caption ? '<figcaption>' + esc(ph.caption) + '</figcaption>' : '') + '</figure>';
    }).join("");
    gal.hidden = false;
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
        '<h1>' + esc(p.title) + '</h1>' +
        '<div class="byline"><img src="assets/cb.jpg" alt=""><span><strong>' + esc(CFG.AUTHOR || "") + '</strong></span></div>' +
        '<div class="body">' + html + '</div>';
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
    var eligible = !store("cb_subscribed") && (Date.now() - closedAt > quiet) && !document.getElementById("idea-form");
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


  // ---------- discussions (Giscus / GitHub Discussions) ----------
  var G = CFG.GISCUS || {};
  var giscusReady = !!(G.repo && G.repoId && G.categoryId);
  function giscusTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function mountGiscus(el, term) {
    if (!el) return;
    if (!giscusReady) {
      el.innerHTML = '<div class="placeholder"><strong>Discussions open soon.</strong> Until then, share your thoughts through the idea form or by email at ' +
        esc(CFG.EMAIL || "") + '.</div>';
      return;
    }
    var frame = el.querySelector("iframe.giscus-frame");
    if (frame) {
      frame.contentWindow.postMessage({ giscus: { setConfig: { term: term } } }, "https://giscus.app");
      return;
    }
    el.innerHTML = "";
    var sc = document.createElement("script");
    sc.src = "https://giscus.app/client.js";
    var attrs = {
      "data-repo": G.repo, "data-repo-id": G.repoId, "data-category": G.category || "General",
      "data-category-id": G.categoryId, "data-mapping": "specific", "data-term": term, "data-strict": "1",
      "data-reactions-enabled": "1", "data-emit-metadata": "0", "data-input-position": "top",
      "data-theme": giscusTheme(), "data-lang": "en", "data-loading": "lazy"
    };
    Object.keys(attrs).forEach(function (k) { sc.setAttribute(k, attrs[k]); });
    sc.crossOrigin = "anonymous"; sc.async = true;
    el.appendChild(sc);
  }
  function syncGiscusTheme() {
    Array.prototype.forEach.call(document.querySelectorAll("iframe.giscus-frame"), function (f) {
      f.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, "https://giscus.app");
    });
  }

  // comments under a daily note
  var postComments = document.getElementById("post-comments");
  if (postComments) {
    var pid = new URLSearchParams(location.search).get("p");
    if (pid && posts.some(function (x) { return x.id === pid; })) mountGiscus(postComments, "note: " + pid);
    else postComments.parentNode.style.display = "none";
  }

  // community rooms
  var tabs = document.getElementById("room-tabs");
  if (tabs) {
    var topics = window.COMMUNITY_TOPICS || [];
    var disc = document.getElementById("discussion");
    var promptEl = document.getElementById("room-prompt");
    function openRoom(i) {
      var t = topics[i]; if (!t) return;
      Array.prototype.forEach.call(tabs.children, function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); });
      promptEl.innerHTML = '<strong>' + esc(t.title) + '.</strong> ' + esc(t.prompt);
      mountGiscus(disc, "room: " + t.id);
      try { history.replaceState(null, "", "#room-" + t.id); } catch (e) {}
    }
    tabs.innerHTML = topics.map(function (t, i) {
      return '<button class="room" role="tab" type="button" data-i="' + i + '">' + esc(t.title) + '</button>';
    }).join("");
    tabs.addEventListener("click", function (e) { var b = e.target.closest(".room"); if (b) openRoom(+b.getAttribute("data-i")); });
    var start = 0, m = location.hash.match(/^#room-(.+)$/);
    if (m) topics.forEach(function (t, i) { if (t.id === m[1]) start = i; });
    openRoom(start);
  }

  // idea form (no login; stored in the Google Sheet, shown after approval)
  var ideaForm = document.getElementById("idea-form");
  if (ideaForm) {
    var ideaNote = document.getElementById("idea-note");
    ideaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = ideaForm.elements;
      var idea = (f.idea.value || "").trim();
      function say(msg, cls) { ideaNote.textContent = msg; ideaNote.className = "sub-note " + (cls || ""); }
      if (idea.length < 10) return say("Please write at least a sentence.", "err");
      if (f.company.value) return say("Thanks, your idea is in.", "ok");
      if (!CFG.SUBSCRIBE_ENDPOINT) return say("The idea form is not connected yet. Please email " + (CFG.EMAIL || "me") + ".", "err");
      var btn = ideaForm.querySelector("button"); btn.disabled = true; say("Sending...");
      fetch(CFG.SUBSCRIBE_ENDPOINT, { method: "POST", mode: "no-cors", body: new URLSearchParams({
        type: "idea", name: (f.name.value || "").trim(), role: (f.role.value || "").trim(), idea: idea }) })
        .then(function () { say("Thank you. Your idea is in and will appear on the wall after a quick review.", "ok"); ideaForm.reset(); })
        .catch(function () { say("Something went wrong. Please try again.", "err"); })
        .then(function () { btn.disabled = false; });
    });
  }

  // idea wall (approved ideas only)
  var wall = document.getElementById("idea-wall");
  if (wall) {
    function drawWall(items) {
      wall.innerHTML = items.length ? items.map(function (x) {
        var who = (x.name || "Anonymous") + (x.role ? ", " + x.role : "");
        return '<figure class="idea"><blockquote>' + esc(x.idea) + '</blockquote><figcaption>' + esc(who) +
          (x.date ? ' <span>' + esc(fmtDate(x.date)) + '</span>' : '') + '</figcaption></figure>';
      }).join("") : '<p class="empty">No ideas on the wall yet. Be the first to spark one above.</p>';
    }
    if (!CFG.SUBSCRIBE_ENDPOINT) drawWall([]);
    else fetch(CFG.SUBSCRIBE_ENDPOINT + "?action=ideas")
      .then(function (r) { return r.json(); })
      .then(function (d) { drawWall((d && d.ideas) || []); })
      .catch(function () { drawWall([]); });
  }

  // ---------- light / dark toggle ----------
  var tbtn = document.getElementById("theme-toggle");
  if (tbtn) tbtn.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store("cb_theme", next);
    syncGiscusTheme();
  });

  // ---------- footer ----------
  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
