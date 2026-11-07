/* 传奇发布网 · 静态站交互（站内搜索、回到顶部） */
(function () {
  "use strict";

  /* ---------------- 回到顶部 ---------------- */
  var btn = document.getElementById("toTop");
  if (btn) {
    var onScroll = function () {
      if (window.pageYOffset > 480) { btn.classList.add("show"); }
      else { btn.classList.remove("show"); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- 站内搜索 ---------------- */
  var box = document.getElementById("results");
  if (!box) { return; }

  var DATA = window.SITE_INDEX || [];
  var input = document.getElementById("q");
  var q = "";

  try {
    q = new URLSearchParams(window.location.search).get("q") || "";
  } catch (e) {
    var m = window.location.search.match(/[?&]q=([^&]+)/);
    q = m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }
  q = q.trim();
  if (input) { input.value = q; }

  function plain(s) {
    return (s || "").toLowerCase();
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function mark(text, kw) {
    var safe = esc(text);
    if (!kw) { return safe; }
    var k = esc(kw).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return safe.replace(new RegExp("(" + k + ")", "gi"), "<em>$1</em>");
    } catch (e) {
      return safe;
    }
  }

  function render(keyword) {
    var k = plain(keyword);
    if (!k) {
      box.innerHTML = '<p class="rs-sum">共收录 ' + DATA.length +
        ' 篇文章。输入关键词开始搜索，或点上面的热门词直接跳转。</p>' +
        '<div class="tagcloud big">' + listHot() + "</div>";
      return;
    }
    var terms = k.split(/\s+/).filter(Boolean);
    var hit = DATA.filter(function (it) {
      var hay = plain(it.t + " " + it.d + " " + it.k + " " + it.c);
      return terms.every(function (t) { return hay.indexOf(t) > -1; });
    });

    var html = '<p class="rs-sum">关键词「' + esc(keyword) + "」共找到 <b>" + hit.length + "</b> 篇</p>";
    if (!hit.length) {
      html += '<div class="no-hit">没有匹配的文章。可以试试更短的词，比如「合击」「打宝」「1.76」；' +
        '或者直接去 <a href="kaifu.html">今日开服表</a> 按版本找区。</div>' +
        '<div class="tagcloud big" style="margin-top:16px">' + listHot() + "</div>";
    } else {
      hit.forEach(function (it) {
        html += '<a class="rs-item" href="' + esc(it.u) + '">' +
          "<b>" + mark(it.t, keyword) + "</b>" +
          "<i>" + mark(it.d, keyword) + "</i>" +
          "<span>" + esc(it.c) + "</span></a>";
      });
    }
    box.innerHTML = html;
  }

  var HOT = ["1.76复古", "合击", "单职业", "打宝", "沙巴克", "选服", "微变", "道士", "元宝"];
  function listHot() {
    return HOT.map(function (t) {
      return '<a href="search.html?q=' + encodeURIComponent(t) + '">' + t + "</a>";
    }).join("");
  }

  render(q);

  if (input) {
    var timer = null;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      var v = input.value.trim();
      timer = setTimeout(function () { render(v); }, 220);
    });
    input.form && input.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      render(v);
      try {
        window.history.replaceState(null, "", v ? "?q=" + encodeURIComponent(v) : "search.html");
      } catch (err) { /* file:// 下忽略 */ }
    });
  }
})();
