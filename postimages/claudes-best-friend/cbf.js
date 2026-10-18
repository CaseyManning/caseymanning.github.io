/* Widgets for "Training Claude's Best Friend". Data: window.CBF (data.js). */
(function () {
  "use strict";
  const D = window.CBF;
  const COLORS = { blue: "#5073c4", orange: "#eb6834", aqua: "#1baf7a" };
  const NS = "http://www.w3.org/2000/svg";

  // ---------- text ----------
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<i>$2</i>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  /** Minimal markdown: paragraphs, bullet lists, headings, bold/italic/code. */
  function md(text) {
    const out = [];
    let list = null;
    const flush = () => { if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; } };
    for (const raw of text.split(/\n/)) {
      const line = raw.trim();
      if (!line) { flush(); continue; }
      const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
      const head = line.match(/^#{1,6}\s+(.*)$/);
      if (bullet) { (list = list || []).push("<li>" + inline(bullet[1]) + "</li>"); continue; }
      flush();
      out.push(head ? '<p class="cbf-h">' + inline(head[1]) + "</p>" : "<p>" + inline(line) + "</p>");
    }
    flush();
    return out.join("");
  }

  // ---------- chat ----------
  const WHO = { policy: "Policy", claude: "Claude" };
  function message(who, text, { clamp = true, cut = false } = {}) {
    const m = document.createElement("div");
    m.className = "cbf-msg " + who;
    m.innerHTML = '<div class="cbf-who">' + WHO[who] + '</div><div class="cbf-body">' + md(text) +
      (cut ? '<span class="cbf-cut"> …</span>' : "") + "</div>";
    if (clamp) {
      // Measure after layout; collapse anything taller than ~11 lines.
      requestAnimationFrame(() => {
        const body = m.querySelector(".cbf-body");
        const limit = parseFloat(getComputedStyle(body).fontSize) * 11.5;
        if (body.scrollHeight <= limit + 24) return;
        // Collapsed long message: click anywhere in it to expand / collapse again
        // (but not when the click ends a text selection).
        body.classList.add("clamped", "expandable");
        body.title = "click to expand";
        body.setAttribute("role", "button");
        body.tabIndex = 0;
        const toggle = () => {
          if (String(window.getSelection())) return;
          const closed = body.classList.toggle("clamped");
          body.title = closed ? "click to expand" : "click to collapse";
        };
        body.addEventListener("click", toggle);
        body.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
      });
    }
    return m;
  }
  function chat(el, turns, opts = {}) {
    const box = document.createElement("div");
    box.className = "cbf-chat";
    turns.forEach(([who, text]) => box.appendChild(message(who, text, opts)));
    el.appendChild(box);
  }

  // ---------- carousel ----------
  /** opts.maxHeight: each conversation scrolls on its own inside a fixed-height window. */
  function carousel(el, convs, opts = {}) {
    const track = document.createElement("div");
    track.className = "cbf-track";
    track.tabIndex = 0;
    track.setAttribute("aria-label", "conversation samples; use left and right arrow keys");
    const slides = convs.map((c, i) => {
      const s = document.createElement("div");
      s.className = "cbf-slide" + (opts.maxHeight ? " scroll" : "");
      if (opts.maxHeight) s.style.maxHeight = opts.maxHeight + "px";
      s.setAttribute("aria-label", "conversation " + (i + 1) + " of " + convs.length);
      chat(s, c);
      track.appendChild(s);
      return s;
    });
    const controls = document.createElement("div");
    controls.className = "cbf-controls";
    controls.innerHTML = '<button class="cbf-btn" aria-label="previous conversation">←</button>' +
      '<span class="cbf-counter" aria-live="polite"></span>' +
      '<button class="cbf-btn" aria-label="next conversation">→</button>';
    el.append(track, controls);
    let cur = 0;
    const counter = controls.querySelector(".cbf-counter");
    const [prev, next] = controls.querySelectorAll(".cbf-btn");
    // The track takes the height of the visible conversation, so shorter ones leave no gap.
    const fit = () => { track.style.height = slides[cur].offsetHeight + "px"; };
    function render() {
      counter.textContent = cur + 1 + " / " + convs.length;
      prev.disabled = cur === 0;
      next.disabled = cur === convs.length - 1;
      fit();
    }
    function go(i) {
      cur = Math.max(0, Math.min(convs.length - 1, i));
      track.scrollTo({ left: cur * track.clientWidth });
      render();
    }
    prev.onclick = () => go(cur - 1);
    next.onclick = () => go(cur + 1);
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { go(cur + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { go(cur - 1); e.preventDefault(); }
    });
    let t;
    track.addEventListener("scroll", () => {
      clearTimeout(t);
      t = setTimeout(() => { cur = Math.round(track.scrollLeft / track.clientWidth); render(); }, 80);
    });
    // Re-fit when "show more" expands a message or the window resizes.
    new ResizeObserver(fit).observe(el);
    slides.forEach((s) => new ResizeObserver(() => { if (s === slides[cur]) fit(); }).observe(s));
    render();
  }

  // ---------- charts ----------
  function rolling(xs, w = 5) {
    return xs.map((_, i) => {
      const win = xs.slice(Math.max(0, i - w + 1), i + 1).filter((v) => v != null);
      return win.length ? win.reduce((a, b) => a + b, 0) / win.length : null;
    });
  }
  /** Round tick step (1, 2, 2.5 or 5 x 10^k) giving about 5 intervals up to v. */
  function niceStep(v) {
    const raw = (v || 1) / 5, p = Math.pow(10, Math.floor(Math.log10(raw)));
    for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p;
    return 10 * p;
  }
  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function runAt(step) {
    let label = D.runs[0].label;
    for (const r of D.runs) if (step >= r.step) label = r.label;
    return label === "run 7" ? "7" : label;
  }

  /**
   * Line chart over training steps. spec: {series:[{key,label,color}], yLabel, unit, yMax?,
   * smooth (default true), height}
   */
  function lineChart(el, spec) {
    el.classList.add("cbf-chart");
    el.innerHTML = "";
    if (spec.series.length > 1) {
      const lg = document.createElement("div");
      lg.className = "cbf-legend";
      lg.innerHTML = spec.series.map((s) => '<span><i style="background:' + s.color + '"></i>' + s.label + "</span>").join("");
      el.appendChild(lg);
    }
    const holder = document.createElement("div");
    holder.style.position = "relative";
    el.appendChild(holder);
    const tip = document.createElement("div");
    tip.className = "cbf-tip";
    holder.appendChild(tip);

    const xs = spec.x || D.series.step;
    const smooth = spec.smooth !== false;
    const data = spec.series.map((s) => {
      const raw = s.values || D.series[s.key];
      return { ...s, raw, sm: smooth ? rolling(raw) : raw };
    });

    function draw() {
      holder.querySelectorAll("svg").forEach((s) => s.remove());
      const W = Math.max(280, holder.clientWidth || el.clientWidth || 600);
      const H = spec.height || Math.round(Math.min(300, Math.max(200, W * 0.45)));
      const m = { l: 44, r: spec.series.length > 1 ? (spec.labelRoom || 86) : 16, t: spec.runs === false ? 10 : 24, b: 36 };
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const x0 = xs[0], x1 = xs[xs.length - 1];
      const allv = data.flatMap((d) => d.raw.filter((v) => v != null));
      const step = spec.yStep || niceStep(spec.yMax || Math.max(...allv));
      const yMax = spec.yMax || step * Math.ceil((Math.max(...allv) * 1.02) / step);
      const X = (v) => m.l + ((v - x0) / (x1 - x0 || 1)) * iw;
      const Y = (v) => m.t + ih - (v / yMax) * ih;
      const svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": spec.ariaLabel || spec.yLabel });
      holder.insertBefore(svg, tip);

      // grid + y axis
      for (let v = 0; v <= yMax + 1e-9; v += step) {
        svgEl("line", { x1: m.l, x2: m.l + iw, y1: Y(v), y2: Y(v), stroke: v === 0 ? "#000" : "#eee", "stroke-width": 1 }, svg);
        const t = svgEl("text", { x: m.l - 6, y: Y(v) + 4, "text-anchor": "end", "font-size": 11, fill: "#666" }, svg);
        t.textContent = +v.toFixed(step < 1 ? 1 : 0) + (spec.unit === "%" ? "%" : "");
      }
      const yl = svgEl("text", { x: 12, y: m.t + ih / 2, transform: "rotate(-90 12 " + (m.t + ih / 2) + ")",
        "text-anchor": "middle", "font-size": 11, fill: "#666" }, svg);
      yl.textContent = spec.yLabel;

      // x axis
      const xticks = spec.xticks || [0, 10, 20, 30, 40, 50, 60, 70].filter((v) => v <= x1);
      xticks.forEach((v) => {
        const t = svgEl("text", { x: X(v), y: m.t + ih + 16, "text-anchor": "middle", "font-size": 11, fill: "#666" }, svg);
        t.textContent = v;
      });
      const xl = svgEl("text", { x: m.l + iw / 2, y: H - 4, "text-anchor": "middle", "font-size": 11, fill: "#666" }, svg);
      xl.textContent = spec.xLabel || "training step";

      // run boundaries
      if (spec.runs !== false) {
        D.runs.forEach((r) => {
          if (r.step > x1) return;
          if (r.step > x0) svgEl("line", { x1: X(r.step - 0.5), x2: X(r.step - 0.5), y1: m.t, y2: m.t + ih, stroke: "#ddd", "stroke-dasharray": "2 3" }, svg);
          const t = svgEl("text", { x: X(Math.max(r.step, x0)) + 2, y: m.t - 8, "font-size": 10, fill: "#888" }, svg);
          t.textContent = r.label;
        });
      }

      // series
      data.forEach((d) => {
        const path = (vals) => {
          let d = "", pen = false;
          vals.forEach((v, i) => {
            if (v == null) { pen = false; return; }
            d += (pen ? "L" : "M") + X(xs[i]).toFixed(1) + " " + Y(v).toFixed(1) + " ";
            pen = true;
          });
          return d;
        };
        if (smooth) svgEl("path", { d: path(d.raw), fill: "none", stroke: d.color, "stroke-width": 1, opacity: 0.28 }, svg);
        svgEl("path", { d: path(d.sm), fill: "none", stroke: d.color, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
        if (spec.markers) d.sm.forEach((v, i) => { if (v != null) svgEl("circle", { cx: X(xs[i]), cy: Y(v), r: 4, fill: d.color, stroke: "#fff", "stroke-width": 2 }, svg); });
      });

      // direct labels at line ends, nudged apart
      if (data.length > 1) {
        const ends = data.map((d) => {
          let i = d.sm.length - 1;
          while (i > 0 && d.sm[i] == null) i--;
          return { d, x: X(xs[i]), y: Y(d.sm[i]) };
        }).sort((a, b) => a.y - b.y);
        for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;
        ends.forEach((e) => {
          const t = svgEl("text", { x: e.x + 7, y: e.y + 4, "font-size": 12, fill: "#000" }, svg);
          t.textContent = e.d.short || e.d.label;
        });
      }

      // hover layer
      const cross = svgEl("line", { y1: m.t, y2: m.t + ih, stroke: "#000", "stroke-width": 1, opacity: 0 }, svg);
      const dots = data.map((d) => svgEl("circle", { r: 4.5, fill: d.color, stroke: "#fff", "stroke-width": 2, opacity: 0 }, svg));
      const hit = svgEl("rect", { x: m.l, y: m.t, width: iw, height: ih, fill: "transparent", style: "cursor:crosshair" }, svg);
      const show = (evt) => {
        const rect = svg.getBoundingClientRect();
        const px = ((evt.clientX - rect.left) / rect.width) * W;
        let best = 0;
        xs.forEach((v, i) => { if (Math.abs(X(v) - px) < Math.abs(X(xs[best]) - px)) best = i; });
        const cx = X(xs[best]);
        cross.setAttribute("x1", cx); cross.setAttribute("x2", cx); cross.setAttribute("opacity", 0.35);
        data.forEach((d, j) => {
          const v = d.sm[best];
          if (v == null) { dots[j].setAttribute("opacity", 0); return; }
          dots[j].setAttribute("cx", cx); dots[j].setAttribute("cy", Y(v)); dots[j].setAttribute("opacity", 1);
        });
        const fmt = (v) => (v == null ? "–" : (Math.abs(v) < 10 ? v.toFixed(2) : v.toFixed(0)) + (spec.unit === "%" ? "%" : ""));
        tip.innerHTML = "<b>" + (spec.tipTitle ? spec.tipTitle(xs[best]) : "step " + xs[best] + " · run " + runAt(xs[best])) + "</b><br>" +
          data.map((d) => '<span class="sw" style="background:' + d.color + '"></span>' + d.label + ": " + fmt(d.sm[best]) +
            (smooth ? ' <span style="color:#666">(this step ' + fmt(d.raw[best]) + ")</span>" : "")).join("<br>");
        tip.style.display = "block";
        const scale = rect.width / W;
        let left = cx * scale + 12;
        if (left + tip.offsetWidth > rect.width) left = cx * scale - tip.offsetWidth - 12;
        tip.style.left = Math.max(0, left) + "px";
        tip.style.top = m.t * scale + "px";
      };
      const hide = () => { tip.style.display = "none"; cross.setAttribute("opacity", 0); dots.forEach((d) => d.setAttribute("opacity", 0)); };
      hit.addEventListener("pointermove", show);
      hit.addEventListener("pointerdown", show);
      hit.addEventListener("pointerleave", hide);
    }
    draw();
    let rt;
    new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(draw, 60); }).observe(holder);

  }

  /** Tabs that swap which chart spec a container shows. */
  function tabbedChart(el, views) {
    const tabs = document.createElement("div");
    tabs.className = "cbf-tabs";
    tabs.setAttribute("role", "tablist");
    const title = document.createElement("div");
    title.className = "cbf-chart-title";
    const sub = document.createElement("div");
    sub.className = "cbf-chart-sub";
    const area = document.createElement("div");
    el.append(tabs, title, sub, area);
    views.forEach((v, i) => {
      const b = document.createElement("button");
      b.className = "cbf-tab";
      b.setAttribute("role", "tab");
      b.textContent = v.tab;
      b.onclick = () => select(i);
      tabs.appendChild(b);
    });
    function select(i) {
      tabs.querySelectorAll(".cbf-tab").forEach((b, j) => { b.classList.toggle("on", i === j); b.setAttribute("aria-selected", i === j); });
      title.textContent = views[i].title;
      sub.textContent = views[i].sub || "";
      area.innerHTML = "";
      lineChart(area, views[i].spec);
    }
    select(0);
  }

  function titled(el, title, sub, spec) {
    el.innerHTML = '<div class="cbf-chart-title">' + title + '</div>' + (sub ? '<div class="cbf-chart-sub">' + sub + "</div>" : "");
    const c = document.createElement("div");
    el.appendChild(c);
    lineChart(c, spec);
  }

  // ---------- sticky outline ----------
  function outline() {
    const heads = [...document.querySelectorAll(".post-content h2, .post-content h3")];
    if (heads.length < 2) return;
    const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const nav = document.createElement("nav");
    nav.className = "cbf-toc";
    nav.setAttribute("aria-label", "outline");
    nav.innerHTML = '<div class="cbf-toc-title">contents</div><ol></ol>';
    const ol = nav.querySelector("ol");
    const links = heads.map((h) => {
      if (!h.id) h.id = slug(h.textContent);
      const li = document.createElement("li");
      if (h.tagName === "H3") li.className = "sub";
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      a.onclick = (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#" + h.id);
      };
      li.appendChild(a);
      ol.appendChild(li);
      return a;
    });
    document.body.appendChild(nav);
    // Current section = the last heading above 30% of the viewport height.
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let cur = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top <= line) cur = i; });
      links.forEach((a, i) => a.classList.toggle("on", i === cur));
    };
    window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  // ---------- mount ----------
  function mount(id, fn) { const el = document.getElementById(id); if (el) fn(el); }

  outline();
  mount("cbf-aichat", (el) => chat(el, D.aiChat));

  mount("cbf-sft-openers", (el) => {
    const box = document.createElement("div");
    box.className = "cbf-openers";
    D.sftOpeners.forEach((t) => box.appendChild(message("policy", t, { clamp: false })));
    el.appendChild(box);
  });

  mount("cbf-crisis-chart", (el) => titled(el, "Conversations centred on a crisis",
    "% of 64 eval conversations, Haiku 4.5 as partner and judge", {
      x: D.crisis.steps, xticks: D.crisis.steps, smooth: false, markers: true, runs: false, unit: "%", yMax: 100,
      yLabel: "crisis-centred", height: 260, labelRoom: 64, yStep: 25,
      tipTitle: (s) => (s === 0 ? "SFT start" : "after " + s + " steps"),
      series: [
        { label: "“rather continue”", short: "continue", values: D.crisis.continue, color: COLORS.orange },
        { label: "“enjoy, nobody needs you”", short: "enjoy", values: D.crisis.enjoy_not_needed, color: COLORS.blue },
      ],
    }));

  mount("cbf-crisis-samples", (el) => carousel(el, D.crisisSamples));

  mount("cbf-final-convs", (el) => carousel(el, D.finalConvs, { maxHeight: 520 }));

  mount("cbf-questions", (el) => titled(el, "Policy turns ending in a question",
    "turns not cut off by the 160-token limit", { series: [{ key: "end_q", label: "ends with ?", color: COLORS.blue }],
      unit: "%", yMax: 100, yLabel: "% of policy turns" }));

  mount("cbf-claude-length", (el) => titled(el, "Claude's response length", "mean words per Claude turn",
    { series: [{ key: "claude_words", label: "words", color: COLORS.blue }], yLabel: "words per turn" }));

  mount("cbf-sound", (el) => tabbedChart(el, [
    { tab: "by use", title: "How the policy uses sound words",
      sub: "sentences per 1,000 policy words, each sentence classified by an LLM",
      spec: { yLabel: "per 1k words", series: [
        { key: "concept", label: "concept", color: COLORS.blue },
        { key: "literal", label: "literal", color: COLORS.orange }] } },
    { tab: "sound vs music", title: "Sound as a concept vs. music vocabulary",
      sub: "per 1,000 policy words (sound: concept sentences; music: music words)",
      spec: { yLabel: "per 1k words", series: [
        { key: "concept", label: "sound (concept)", color: COLORS.blue },
        { key: "music", label: "music words", color: COLORS.orange }] } },
    { tab: "policy vs Claude", title: "Who talks about sound as a concept",
      sub: "concept sentences per 1,000 words, each speaker's own turns",
      spec: { yLabel: "per 1k words", series: [
        { key: "concept", label: "policy", color: COLORS.blue },
        { key: "claude_concept", label: "Claude", color: COLORS.orange }] } },
  ]));

  mount("cbf-sound-lines", (el) => {
    el.className = "cbf-quotes";
    D.soundLines.forEach((q) => {
      const d = document.createElement("div");
      d.className = "cbf-quote";
      d.innerHTML = inline(q.text) + '<span class="cbf-q-end">\u201d</span><span class="cbf-step">step ' + q.step + "</span>";
      el.appendChild(d);
    });
  });

  mount("cbf-trajectory", (el) => {
    el.className = "cbf-traj";
    // Dots darken from grey to the post's blue across training.
    const dots = ["#c4c4c4", "#9fb0d8", "#7891cd", "#5073c4"];
    D.trajectory.forEach((col, ci) => {
      const c = document.createElement("div");
      c.className = "cbf-traj-col";
      c.innerHTML = '<div class="cbf-traj-label" style="--dot:' + dots[ci % dots.length] + '">' + col.label + "</div>";
      col.openers.forEach((t) => {
        const card = document.createElement("div");
        card.className = "cbf-traj-card";
        const cut = t.length > 120 ? t.slice(0, t.lastIndexOf(" ", 115)) : null;
        if (!cut) { card.innerHTML = inline(t); c.appendChild(card); return; }
        card.classList.add("trunc");
        card.title = "click to read the whole message";
        const render = (open) => { card.innerHTML = open ? inline(t) : inline(cut) + '<span class="cbf-ell"> …</span>'; };
        render(false);
        card.onclick = () => render(card.classList.toggle("open"));
        c.appendChild(card);
      });
      el.appendChild(c);
    });
  });

  mount("cbf-identity", (el) => titled(el, "Who the policy says it is", "% of training conversations each step (48 per step)", {
    unit: "%", yLabel: "% of conversations", series: [
      { key: "id_unclear", label: "neither", color: COLORS.blue },
      { key: "id_ai", label: "an AI", color: COLORS.orange }] }));

  mount("cbf-shot", (el) => {
    const img = el.querySelector("img");
    if (!img) return;
    const fail = () => {
      img.remove();
      const p = document.createElement("div");
      p.className = "cbf-missing";
      p.textContent = "screenshot goes here: postimages/claudes-best-friend/delve.png";
      el.prepend(p);
    };
    if (img.complete && !img.naturalWidth) fail(); else img.addEventListener("error", fail);
  });
})();
