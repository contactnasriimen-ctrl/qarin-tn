/* Qarin.tn — comparateur tunisien. Vanilla JS, routage par hash, moteur de comparaison générique. */
(function () {
  "use strict";
  const D = window.QDATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  let app = $("#app");

  /* ================= utilitaires ================= */
  const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
  const tnd = (n) => nf.format(Math.round(n)) + " DT";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed; return function () { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = (s, n) => { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return iso(d); };
  const inDays = (n) => { const d = today(); d.setDate(d.getDate() + n); return iso(d); };
  const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 864e5);
  const frDate = (s, o) => new Date(s + "T00:00:00").toLocaleDateString(document.documentElement.lang === "ar" ? "ar-TN" : "fr-FR", o || { weekday: "short", day: "numeric", month: "short" });
  const hm = (min) => pad(Math.floor(min / 60) % 24) + ":" + pad(min % 60);
  const dur = (min) => Math.floor(min / 60) + " h " + pad(min % 60);
  const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !isNaN(new Date(s + "T00:00:00"));
  const secs = (s) => s < 60 ? Math.round(s) + " s" : s < 3600 ? Math.round(s / 60) + " min" : (s / 3600).toFixed(1).replace(".", ",") + " h";
  const spd = (m) => (m >= 1000 ? m / 1000 + " Gbps" : m + " Mbps");
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };

  /* ================= icônes ================= */
  const P = {
    wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><path d="M12 20h.01"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    hotel: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowUp: '<path d="m5 12 7-7 7 7M12 19V5"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    bag: '<rect x="6" y="7" width="12" height="14" rx="2"/><path d="M9 7V4h6v3"/>',
    fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    trend: '<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
    ship: '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4M12 2v3"/>',
    bank: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l9 5H3z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    wallet: '<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    msg: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    bus: '<path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2s-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
    train: '<rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M12 3v8M8 19l-2 3M18 22l-2-3M8 15h.01M16 15h.01"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    umbrella: '<path d="M22 12a10.06 10.06 1 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>'
  };
  const DEMO = D.meta.mode === "demo";
  const reportLink = (what) => `${D.meta.reportUrl}?title=${encodeURIComponent("Erreur de données : " + what)}`;
  const eur = (dt) => nf.format(Math.round(dt / D.meta.eurTnd)) + " €";
  const icon = (n, c) => `<svg class="i ${c || ""}${n === "arrow" || n === "chevR" ? " dirx" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;

  function badge(p) {
    const x = D.providers[p] || { short: String(p).replace(/^(Hôtel|Dar)\s+/, "").slice(0, 2).toUpperCase(), color: "#334155" };
    return `<div class="pbadge" style="background:${x.color}" aria-hidden="true">${esc(x.short)}</div>`;
  }
  const badgeOf = (it) => (it.short ? `<div class="pbadge" style="background:${it.color}" aria-hidden="true">${esc(it.short)}</div>` : badge(it.p));
  const purl = (p) => (D.providers[p] || {}).url || "#";
  function toast(msg, ic) { const t = $("#toast"); t.innerHTML = icon(ic || "check") + esc(msg); t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2300); }
  function go(path, params) { const q = params ? "?" + new URLSearchParams(params).toString() : ""; location.hash = "#/" + path + q; }
  const opt = (v, label, sel) => `<option value="${esc(v)}" ${String(v) === String(sel) ? "selected" : ""}>${esc(label)}</option>`;
  const starsHtml = (n) => `<span class="stars" role="img" aria-label="${n} étoiles">${Array.from({ length: n }, () => icon("star")).join("")}</span>`;
  const scoreLabel = (s) => (s >= 9 ? "Excellent" : s >= 8.2 ? "Très bien" : s >= 7.4 ? "Bien" : s >= 6.5 ? "Correct" : "Moyen");
  const note = (html) => `<div class="note">${icon("info")}<div>${html}</div></div>`;
  const NOTE_DEFAULT = "<b>Tarifs indicatifs</b> — estimations établies à partir des grilles publiques. Le prix final est toujours confirmé sur le site du fournisseur.";
  const feats = (arr) => `<ul class="feats">${arr.map((f) => `<li>${icon("check")}${esc(f)}</li>`).join("")}</ul>`;
  const meter = (label, pct, val) => `<div class="meter"><span>${label}</span><div class="track"><i style="width:${clamp(pct, 3, 100)}%"></i></div><b>${val}</b></div>`;
  const spec = (l, v) => `<div class="spec"><small>${l}</small><b>${v}</b></div>`;
  const yes = (b) => ({ n: b ? 1 : 0, t: b ? `<span style="color:var(--ok)">${icon("check")}</span>` : '<span class="muted">—</span>' });

  function pageHead(ic, title, sub, crumb) {
    return `<div class="page-head"><div class="blob"></div><div class="container"><div class="crumbs"><a href="#/">Accueil</a>${icon("chevR")}${esc(crumb || title)}</div><h1><span class="hico">${icon(ic)}</span>${esc(title)}</h1><p>${sub}</p></div></div>`;
  }

  /* ================= thème ================= */
  function setTheme(t) { document.documentElement.dataset.theme = t; LS.set("qarin-theme-v", t); try { localStorage.setItem("qarin-theme", t); } catch (e) { /* */ } $("#themeBtn").innerHTML = icon(t === "dark" ? "sun" : "moon"); $("#themeBtn").setAttribute("aria-label", t === "dark" ? "Mode clair" : "Mode sombre"); }

  /* ================= favoris ================= */
  let FAV = LS.get("qarin-favs", {});
  const favK = (c, id) => c + ":" + id;
  const isFav = (c, id) => !!FAV[favK(c, id)];
  function favCount() { const n = Object.keys(FAV).length; const d = $("#favDot"); d.textContent = n; d.hidden = !n; }
  function toggleFav(cfg, it, btn) {
    const k = favK(cfg.key, it.id);
    if (FAV[k]) { delete FAV[k]; toast("Retiré des favoris", "heart"); }
    else { const f = cfg.fav(it, cmp.st); FAV[k] = { cat: cfg.crumb, badge: badgeOf(it), title: f.title, sub: f.sub, price: f.price, url: cfg.url(it, cmp.st), route: location.hash, t: Date.now() }; toast("Ajouté à vos favoris", "heart"); }
    LS.set("qarin-favs", FAV);
    const on = !!FAV[k]; btn.classList.toggle("on", on); btn.setAttribute("aria-pressed", on); $("span", btn).textContent = on ? "Sauvé" : "Sauver";
    favCount();
  }

  /* ================= comparateur ================= */
  const cmp = { cfg: null, ids: [], pool: {}, st: null, params: null, path: "" };
  function toggleCmp(id) {
    const i = cmp.ids.indexOf(id);
    if (i >= 0) cmp.ids.splice(i, 1);
    else { if (cmp.ids.length >= 3) { toast("Maximum 3 offres — retirez-en une d'abord", "info"); return; } cmp.ids.push(id); if (cmp.ids.length === 1) toast("Ajoutez une 2ᵉ offre pour comparer", "scale"); }
    refreshCmpUI();
  }
  function refreshCmpUI() {
    $$("[data-cmpt]").forEach((b) => {
      const on = cmp.ids.includes(b.dataset.cmpt);
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
      const svg = $("svg", b); if (svg) svg.outerHTML = icon(on ? "check" : "scale");
      const art = b.closest(".offer"); if (art) art.classList.toggle("selected", on);
    });
    renderCmpBar();
  }
  function renderCmpBar() {
    const bar = $("#cmpBar"), on = !!cmp.cfg && cmp.ids.length > 0;
    bar.classList.toggle("show", on); document.body.classList.toggle("cmp-on", on);
    if (!on) return;
    $(".slots", bar).innerHTML = [0, 1, 2].map((i) => { const id = cmp.ids[i]; if (!id) return '<div class="slot">+</div>'; const it = cmp.pool[id]; return `<div class="slot" title="${esc(it.name)}">${badgeOf(it)}<button type="button" data-rm="${esc(id)}" aria-label="Retirer">${icon("x")}</button></div>`; }).join("");
    $(".lbl", bar).innerHTML = cmp.ids.length < 2 ? "Ajoutez une offre<small>pour lancer le comparatif</small>" : `${cmp.ids.length} offres prêtes<small>Tableau détaillé + verdict</small>`;
    $("#cmpGo").disabled = cmp.ids.length < 2;
    $("#cmpGo").style.opacity = cmp.ids.length < 2 ? ".5" : "1";
  }
  function openModal(html, narrow) { $("#modalBody").innerHTML = html; $("#modal .box").classList.toggle("narrow", !!narrow); $("#modal").classList.add("show"); document.body.style.overflow = "hidden"; }
  function closeModal() { $("#modal").classList.remove("show"); document.body.style.overflow = ""; }
  function openCompare() {
    const cfg = cmp.cfg, st = cmp.st;
    if (!cfg) return;
    const its = cmp.ids.map((id) => cmp.pool[id]).filter(Boolean);
    if (its.length < 2) { toast("Sélectionnez au moins 2 offres", "info"); return; }
    const costOf = cfg.cost ? (x) => cfg.cost(x, st) : cfg.price;
    const best = its.reduce((a, b) => (b._s > a._s ? b : a));
    const cheap = its.reduce((a, b) => (costOf(b) < costOf(a) ? b : a));
    const dear = its.reduce((a, b) => (costOf(b) > costOf(a) ? b : a));
    const saving = costOf(dear) - costOf(cheap);
    const perf = cfg.perf ? its.reduce((a, b) => (cfg.perf.get(b) > cfg.perf.get(a) ? b : a)) : null;
    const nm = (it) => esc(cfg.label ? cfg.label(it) : it.name);
    let rows = "";
    cfg.compare.forEach((r) => {
      if (!Array.isArray(r)) { rows += `<tr class="grp"><td colspan="${its.length + 1}">${esc(r.g)}</td></tr>`; return; }
      const [label, get, better, bars] = r;
      const vals = its.map((it) => { const v = get(it, st); return v !== null && typeof v === "object" ? v : { t: esc(v), n: null }; });
      const same = vals.every((v) => v.t === vals[0].t);
      let wins = [];
      if (better && !same) { const nums = vals.map((v) => v.n); const tgt = better === "min" ? Math.min(...nums) : Math.max(...nums); wins = nums.map((n, i) => (n === tgt ? i : -1)).filter((i) => i >= 0); }
      const mx = Math.max(...vals.map((v) => Math.abs(v.n || 0))) || 1;
      rows += `<tr class="${same ? "same" : ""}"><td>${esc(label)}</td>${vals.map((v, i) => `<td class="${wins.includes(i) ? "win" : ""}">${v.t}${better && bars !== false && v.n != null ? `<div class="mb"><i style="width:${Math.max(4, (Math.abs(v.n) / mx) * 100)}%"></i></div>` : ""}</td>`).join("")}</tr>`;
    });
    const head = its.map((it) => `<th><div class="colhead"><div class="crown">${it === best ? icon("crown") : ""}</div>${badgeOf(it)}<b>${nm(it)}</b><small>${esc(cfg.sublabel ? cfg.sublabel(it) : it.p)}</small><div class="sc">Score <b>${it._s.toFixed(1)}</b></div></div></th>`).join("");
    const ctas = `<tr><td></td>${its.map((it) => `<td><a class="btn btn-primary btn-sm" target="_blank" rel="noopener nofollow sponsored" href="${esc(cfg.url(it, st))}">${esc(cfg.cta || "Voir l'offre")}</a></td>`).join("")}</tr>`;
    openModal(`<div class="mpad">
      <div class="cmp-head"><div><h2>Comparatif ${esc(cfg.cmpTitle)}</h2><p>${its.length} offres analysées selon vos priorités</p></div>
        <div class="cmp-actions"><label class="switch" style="gap:10px"><span>Différences uniquement</span><input type="checkbox" id="diffOnly"></label>
        <button type="button" class="btn btn-ghost btn-sm" id="cmpShare">${icon("share")}Partager</button><a class="btn btn-ghost btn-sm" id="cmpWa" target="_blank" rel="noopener">${icon("msg")}WhatsApp</a><button type="button" class="btn btn-ghost btn-sm" id="cmpPrint">${icon("printer")}Imprimer</button></div></div>
      <div class="verdict">
        <div class="vcard win"><small>${icon("crown")}Meilleur choix pour vous</small><b>${nm(best)}</b><span>Score ${best._s.toFixed(1)}/10 · ${Math.round(best._m * 100)} % de correspondance</span></div>
        <div class="vcard cheap"><small>${icon("tag")}Le plus économique</small><b>${nm(cheap)}</b><span>${saving > 0 ? `Économie de <b>${tnd(saving)}</b> ${esc(cfg.costLabel || "")} face à ${nm(dear)}` : "Prix équivalents"}</span></div>
        ${perf ? `<div class="vcard perf"><small>${icon(cfg.perf.icon || "zap")}${esc(cfg.perf.label)}</small><b>${nm(perf)}</b><span>${cfg.perf.text(perf)}</span></div>` : ""}
      </div>
      <div class="ctable-wrap"><table class="cmp" id="cmpTable"><thead><tr><th></th>${head}</tr></thead><tbody>${rows}${ctas}</tbody></table></div>
      <p class="muted" style="font-size:12.5px;margin:12px 0 0">Cellules vertes = meilleure valeur sur la ligne. Tarifs indicatifs, à confirmer chez le fournisseur.</p></div>`);
    $("#diffOnly").addEventListener("change", (e) => $("#cmpTable").classList.toggle("diff", e.target.checked));
    $("#cmpPrint").addEventListener("click", () => window.print());
    { const p = new URLSearchParams(cmp.params); p.set("cmp", cmp.ids.join(",")); const url = location.href.split("#")[0] + "#/" + cmp.path + "?" + p.toString();
      $("#cmpWa").href = "https://wa.me/?text=" + encodeURIComponent(`Comparatif ${cfg.cmpTitle} sur Qarin.tn — meilleur choix : ${cfg.label ? cfg.label(best) : best.name}\n${url}`); }
    $("#cmpShare").addEventListener("click", () => {
      const p = new URLSearchParams(cmp.params); p.set("cmp", cmp.ids.join(","));
      const url = location.href.split("#")[0] + "#/" + cmp.path + "?" + p.toString();
      history.replaceState(null, "", url);
      const done = () => toast("Lien du comparatif copié", "share");
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => prompt("Copiez ce lien :", url)); else prompt("Copiez ce lien :", url);
    });
  }

  /* =========================================================
     MOTEUR DE PAGE DE RÉSULTATS
     cfg: key, icon, title, sub, crumb, items, filters, sorts, criteria, presets,
          price, cost, costLabel, perf, card, side, details, media, ribbons, url, cta, fav, compare, label, sublabel
     ========================================================= */
  const WL = ["Ignoré", "Faible", "Modéré", "Important", "Très important", "Essentiel"];
  function listPage(cfg, params, path) {
    const items = cfg.items, pool = {};
    items.forEach((it) => (pool[it.id] = it));
    const defW = Object.fromEntries(cfg.criteria.map((c) => [c.k, c.def]));
    const st = { f: {}, sort: cfg.sorts[0][0], shown: 10, weights: Object.assign({}, defW, LS.get("qarin-w-" + cfg.key, {})) };
    cfg.filters.forEach((fd) => (fd.opts = (fd.options || []).map((o) => (Array.isArray(o) ? [String(o[0]), o[1]] : [String(o), o]))));
    const isSet = (fd) => fd.type === "checks" || fd.type === "musthave";
    const defOf = (fd) => (fd.type === "checks" ? new Set(fd.opts.map((o) => o[0])) : fd.type === "musthave" ? new Set() : fd.type === "range" ? (fd.mode === "min" ? fd.min : fd.max) : fd.type === "select" ? String(fd.def) : false);
    cfg.filters.forEach((fd) => { st.f[fd.key] = fd.init != null ? (isSet(fd) ? new Set([...fd.init].map(String)) : fd.type === "select" ? String(fd.init) : fd.init) : defOf(fd); });
    const isDef = (fd) => { const v = st.f[fd.key], d = defOf(fd); return v instanceof Set ? v.size === d.size && [...v].every((x) => d.has(x)) : v === d; };
    function passOne(fd, it) {
      const v = st.f[fd.key];
      if (fd.type === "checks") return v.size === fd.opts.length || v.has(String(fd.get(it)));
      if (fd.type === "musthave") { const have = fd.get(it); return [...v].every((x) => have.includes(x)); }
      if (fd.type === "range") return fd.mode === "min" ? fd.get(it) >= v : fd.get(it) <= v;
      if (fd.type === "select") return fd.test(it, v);
      if (fd.type === "toggle") return !v || fd.test(it);
      return true;
    }
    const pass = (it, except) => cfg.filters.every((fd) => fd.key === except || passOne(fd, it));
    const norm = cfg.criteria.map((c) => {
      const vals = items.map((it) => c.get(it)); const mn = Math.min(...vals), mx = Math.max(...vals);
      return (it) => { if (!(mx > mn)) return 1; const x = (c.get(it) - mn) / (mx - mn); return c.better === "min" ? 1 - x : x; };
    });
    function scoreAll() {
      items.forEach((it) => { let s = 0, w = 0; cfg.criteria.forEach((c, i) => { const wi = +st.weights[c.k] || 0; s += wi * norm[i](it); w += wi; }); it._raw = w ? s / w : 0.5; });
      // score relatif à la meilleure offre du marché : la meilleure ≈ 9,7/10
      const top = Math.max(...items.map((it) => it._raw)) || 1;
      items.forEach((it) => { it._m = it._raw / top; it._s = 4.5 + 5.2 * it._m; });
    }
    const saveW = () => LS.set("qarin-w-" + cfg.key, st.weights);
    const prioSummary = () => { const top = cfg.criteria.filter((c) => st.weights[c.k] > 0).sort((a, b) => st.weights[b.k] - st.weights[a.k]).slice(0, 2).map((c) => c.label.toLowerCase()); return top.length ? "Priorité actuelle : " + top.join(" et ") + " — ajustez pour recalculer le classement" : "Aucune priorité définie"; };
    const prioOpen = LS.get("qarin-prio-open", false);

    app.innerHTML = pageHead(cfg.icon, cfg.title, cfg.sub, cfg.crumb) + (cfg.searchForm ? `<div class="container">${cfg.searchForm}</div>` : "") + `
    <div class="container"><div class="layout">
      <aside class="filters" id="flt" aria-label="Filtres"></aside>
      <div>
        ${cfg.top || ""}
        <div class="prio ${prioOpen ? "open" : ""}" id="prio"><button type="button" data-prio-toggle aria-expanded="${prioOpen}"><span class="ico">${icon("sparkles")}</span><span><b>Score personnalisé — mes priorités</b><small id="prioSum">${prioSummary()}</small></span>${icon("chev", "chev")}</button>
          <div class="prio-body"><div class="presets">${(cfg.presets || []).map((p, i) => `<button type="button" data-preset="${i}">${esc(p.label)}</button>`).join("")}</div>
          <div class="weights">${cfg.criteria.map((c) => `<div class="weight"><label for="w-${c.k}">${esc(c.label)}<span data-wl="${c.k}">${WL[st.weights[c.k]]}</span></label><input id="w-${c.k}" type="range" min="0" max="5" step="1" value="${st.weights[c.k]}" data-w="${c.k}"></div>`).join("")}</div></div></div>
        ${cfg.note === false ? "" : note(cfg.note || NOTE_DEFAULT)}
        <div class="toolbar"><div class="count" id="cnt" aria-live="polite"></div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><div class="seg">${cfg.sorts.map(([k, l, , ic]) => `<button type="button" data-sort="${k}" class="${k === st.sort ? "active" : ""}">${icon(ic)}${esc(l)}</button>`).join("")}</div><button type="button" class="btn btn-ghost btn-sm toggle-filters" data-open-sheet>${icon("sliders")}Filtres</button></div></div>
        <div class="chips" id="chips"></div>
        <div id="res"></div>
      </div>
    </div></div><div class="overlay" id="ovl" data-close-sheet></div>`;

    const flt = $("#flt", app);
    function groupHtml(fd) {
      const v = st.f[fd.key];
      if (isSet(fd)) return `<b>${esc(fd.label)}</b>` + fd.opts.map(([val, l]) => `<label class="check" data-v="${esc(val)}"><input type="checkbox" value="${esc(val)}" ${v.has(val) ? "checked" : ""}><span>${fd.render ? fd.render(val, l) : esc(l)}</span><span class="cnt"></span></label>`).join("");
      if (fd.type === "range") return `<b>${esc(fd.label)} <span class="range-val">${fd.fmt(v)}</span></b><input type="range" min="${fd.min}" max="${fd.max}" step="${fd.step}" value="${v}" aria-label="${esc(fd.label)}">`;
      if (fd.type === "select") return `<b>${esc(fd.label)}</b><select aria-label="${esc(fd.label)}">${fd.opts.map(([val, l]) => opt(val, l, v)).join("")}</select>`;
      return `<label class="switch"><span>${esc(fd.label)}</span><input type="checkbox" ${v ? "checked" : ""}></label>`;
    }
    function renderFilters() {
      flt.innerHTML = `<div class="fh"><h3>${icon("sliders")}Filtres</h3><button type="button" class="link-btn" data-reset-all>Tout effacer</button></div>` +
        cfg.filters.map((fd) => `<div class="fgroup" data-fk="${fd.key}">${groupHtml(fd)}</div>`).join("") +
        `<div class="sheet-foot"><button type="button" class="btn btn-primary btn-block" data-close-sheet>Afficher <span id="sheetCnt"></span> résultats</button></div>`;
    }
    function updateCounts() {
      cfg.filters.forEach((fd) => {
        if (!isSet(fd)) return;
        const base = items.filter((it) => pass(it, fd.key)), g = $(`[data-fk="${fd.key}"]`, flt);
        $$(".check", g).forEach((lbl) => {
          const v = lbl.dataset.v, n = base.filter((it) => (fd.type === "checks" ? String(fd.get(it)) === v : fd.get(it).includes(v))).length;
          $(".cnt", lbl).textContent = n; lbl.classList.toggle("zero", !n);
        });
      });
    }
    function chipText(fd) {
      const v = st.f[fd.key], lab = (x) => (fd.opts.find((o) => o[0] === x) || [x, x])[1];
      if (fd.chip) return fd.chip(v);
      if (isSet(fd)) return `${fd.label} : ${[...v].map(lab).join(", ") || "aucun"}`;
      if (fd.type === "range") return `${fd.label} ${fd.fmt(v)}`;
      if (fd.type === "select") return `${fd.label} : ${lab(v)}`;
      return fd.label;
    }
    function renderChips() {
      const act = cfg.filters.filter((fd) => !fd.fixed && !isDef(fd));
      $("#chips", app).innerHTML = act.map((fd) => `<button type="button" class="chip" data-chip="${fd.key}">${esc(chipText(fd))}${icon("x")}</button>`).join("") + (act.length > 1 ? '<button type="button" class="chip clear" data-reset-all>Tout effacer</button>' : "");
    }
    function cardShell(it, ctx) {
      const top = it.id === ctx.best, fav = isFav(cfg.key, it.id), inC = cmp.ids.includes(it.id), m = Math.round(it._m * 100);
      const rib = (cfg.price(it) === ctx.cheapest ? `<span class="ribbon r-best">${icon("tag")}${esc(cfg.cheapLabel || "Prix le plus bas")}</span>` : "") + (cfg.ribbons ? cfg.ribbons(it, st) : "");
      return `<article class="offer ${cfg.cardClass || ""} ${top ? "top1" : ""} ${inC ? "selected" : ""}" data-id="${esc(it.id)}">
        ${cfg.media ? cfg.media(it) : ""}
        <div class="main">${rib ? `<div class="ribbons">${rib}</div>` : ""}${cfg.card(it, st)}
          ${cfg.details ? `<button type="button" class="details-toggle" data-details>${icon("chev")}Détails &amp; calcul</button><div class="details" hidden>${cfg.details(it, st)}</div>` : ""}
          <div class="card-foot">${it.src ? `<span>${icon("database")}Source : <a href="${esc(it.src)}" target="_blank" rel="noopener nofollow">site officiel</a>${it.checked ? " · relevé le " + esc(it.checked) : ""}</span>` : `<span>${icon("database")}${DEMO ? "Donnée de démonstration" : "Estimation"}</span>`}<a href="${esc(reportLink((cfg.label ? cfg.label(it) : it.name) + " (" + cfg.crumb + ")"))}" target="_blank" rel="noopener">${icon("flag")}Signaler une erreur</a></div>
        </div>
        <div class="side">
          <div><div class="scorebox"><span class="pill">${it._s.toFixed(1)}</span><small>${scoreLabel(it._s)}<br>${m} % pour vous</small></div><div class="matchbar"><i style="width:${m}%"></i></div></div>
          ${cfg.side(it, st)}${DEMO ? '<span class="demo-tag">Prix de démonstration</span>' : ""}
          <a class="btn btn-primary" target="_blank" rel="noopener nofollow sponsored" href="${esc(cfg.url(it, st))}">${esc(cfg.cta || "Voir l'offre")}${icon("arrow")}</a>
          <div class="side-actions"><button type="button" class="fav-btn ${fav ? "on" : ""}" data-fav="${esc(it.id)}" aria-pressed="${fav}">${icon("heart")}<span>${fav ? "Sauvé" : "Sauver"}</span></button><button type="button" class="cmp-btn ${inC ? "on" : ""}" data-cmpt="${esc(it.id)}" aria-pressed="${inC}">${icon(inC ? "check" : "scale")}<span>Comparer</span></button></div>
        </div></article>`;
    }
    function render() {
      scoreAll();
      const sd = cfg.sorts.find((s) => s[0] === st.sort);
      const list = items.filter((it) => pass(it)).sort(sd && sd[2] ? (a, b) => sd[2](a, b, st) : (a, b) => b._s - a._s);
      $("#cnt", app).innerHTML = cfg.countText ? cfg.countText(list.length, st) : `${list.length} ${cfg.unit}`;
      const sc = $("#sheetCnt", app); if (sc) sc.textContent = list.length;
      renderChips(); updateCounts();
      if (!list.length) { $("#res", app).innerHTML = `<div class="empty">${icon("search")}<b>Aucune offre ne correspond</b>Essayez d'élargir vos filtres.<div style="margin-top:14px"><button type="button" class="btn btn-soft btn-sm" data-reset-all>Réinitialiser les filtres</button></div></div>`; return; }
      const ctx = { cheapest: Math.min(...list.map(cfg.price)), best: list.reduce((a, b) => (b._s > a._s ? b : a), list[0]).id };
      $("#res", app).innerHTML = list.slice(0, st.shown).map((it) => cardShell(it, ctx)).join("") + (list.length > st.shown ? `<div class="more"><button type="button" class="btn btn-ghost" data-more>Afficher plus d'offres (${list.length - st.shown})</button></div>` : "");
    }
    function syncW() {
      cfg.criteria.forEach((c) => { const r = $(`[data-w="${c.k}"]`, app); if (r) r.value = st.weights[c.k]; const l = $(`[data-wl="${c.k}"]`, app); if (l) l.textContent = WL[st.weights[c.k]]; });
      $("#prioSum", app).textContent = prioSummary();
    }
    const closeSheet = () => { flt.classList.remove("open"); $("#ovl", app).classList.remove("show"); };

    flt.addEventListener("input", (e) => {
      const g = e.target.closest("[data-fk]"); if (!g) return;
      const fd = cfg.filters.find((f) => f.key === g.dataset.fk);
      if (isSet(fd)) st.f[fd.key] = new Set($$("input:checked", g).map((i) => i.value));
      else if (fd.type === "range") { st.f[fd.key] = +e.target.value; $(".range-val", g).textContent = fd.fmt(st.f[fd.key]); }
      else if (fd.type === "select") st.f[fd.key] = e.target.value;
      else st.f[fd.key] = e.target.checked;
      st.shown = 10; render();
    });
    app.addEventListener("input", (e) => {
      const k = e.target.dataset && e.target.dataset.w; if (!k) return;
      st.weights[k] = +e.target.value; saveW(); syncW(); $$("[data-preset]", app).forEach((b) => b.classList.remove("active")); render();
    });
    app.addEventListener("click", (e) => {
      const t = e.target.closest("button, [data-close-sheet]"); if (!t || !app.contains(t)) return;
      const d = t.dataset;
      if (d.sort) { st.sort = d.sort; $$("[data-sort]", app).forEach((b) => b.classList.toggle("active", b === t)); render(); }
      else if ("more" in d) { st.shown += 10; render(); }
      else if ("details" in d) { const box = t.nextElementSibling; box.hidden = !box.hidden; t.classList.toggle("open", !box.hidden); }
      else if (d.fav) toggleFav(cfg, pool[d.fav], t);
      else if (d.cmpt) toggleCmp(d.cmpt);
      else if (d.chip) { const fd = cfg.filters.find((f) => f.key === d.chip); st.f[fd.key] = defOf(fd); renderFilters(); render(); }
      else if ("resetAll" in d) { cfg.filters.forEach((fd) => { if (!fd.fixed) st.f[fd.key] = defOf(fd); }); renderFilters(); render(); }
      else if ("prioToggle" in d) { const p = $("#prio", app); p.classList.toggle("open"); t.setAttribute("aria-expanded", p.classList.contains("open")); LS.set("qarin-prio-open", p.classList.contains("open")); }
      else if (d.preset) { Object.assign(st.weights, cfg.presets[+d.preset].w); saveW(); syncW(); $$("[data-preset]", app).forEach((b) => b.classList.toggle("active", b === t)); render(); }
      else if ("openSheet" in d) { flt.classList.add("open"); $("#ovl", app).classList.add("show"); }
      else if ("closeSheet" in d) closeSheet();
    });

    cmp.cfg = cfg; cmp.pool = pool; cmp.st = st; cmp.params = params; cmp.path = path;
    renderFilters(); render();
    const ctl = {
      st, render,
      setFilters(o) { Object.entries(o).forEach(([k, v]) => { const fd = cfg.filters.find((f) => f.key === k); if (fd) st.f[k] = isSet(fd) ? new Set(v.map(String)) : v; }); renderFilters(); render(); },
      setWeights(w) { Object.assign(st.weights, w); saveW(); syncW(); render(); }
    };
    if (cfg.after) cfg.after(ctl);
    const pre = (params.get("cmp") || "").split(",").filter((id) => pool[id]).slice(0, 3);
    if (pre.length) { cmp.ids = pre; refreshCmpUI(); if (pre.length >= 2) setTimeout(openCompare, 60); }
    return ctl;
  }

  /* =========================================================
     ACCUEIL
     ========================================================= */
  function home() {
    document.title = "Qarin.tn — Comparez et économisez en Tunisie | Internet, vols, hôtels, assurances";
    const depOpts = D.airportsTN.map((a) => opt(a.code, `${a.city} (${a.code})`, "TUN")).join("");
    const dstOpts = D.destinations.map((d) => opt(d.code, `${d.city} (${d.code})`, "CDG")).join("");
    const fibre = D.internet.filter((o) => o.tech === "Fibre").sort((a, b) => a.price - b.price)[0];
    const fl = genFlights("TUN", "CDG", inDays(30), "eco").sort((a, b) => a.price - b.price)[0];
    const ht = genHotels("djerba", inDays(30), 7).sort((a, b) => a.night - b.night)[0];
    const mob = D.mobile.slice().sort((a, b) => a.price / a.data - b.price / b.data)[0];
    const live = D.internet.filter((o) => o.tech === "Fibre" && o.down === 100).sort((a, b) => a.price - b.price).slice(0, 3);
    const lmax = Math.max(...live.map((o) => o.price));
    const CATS = [
      ["internet", "wifi", "Internet", "Fibre, VDSL, ADSL, box 4G/5G", "#0ea5e9"], ["mobile", "phone", "Forfaits mobiles", "Ooredoo, Orange, Tunisie Telecom", "#8b5cf6"],
      ["vols", "plane", "Vols", `${D.destinations.length} destinations, 6 aéroports`, "#e63946"], ["hotels", "hotel", "Hôtels", `${D.cities.length} régions balnéaires & Sahara`, "#f59e0b"],
      ["ferry", "ship", "Ferry", `${D.ferryRoutes.length} ports d'Europe → Tunis`, "#0e7490"], ["location-voiture", "key", "Location de voiture", "Aéroports & centres-villes", "#d97706"],
      ["assurance-auto", "shield", "Assurance auto", `${D.insurers.length} assureurs comparés`, "#10b981"], ["credit", "bank", "Crédit", "Immobilier, auto, consommation", "#4f46e5"],
      ["transfert", "send", "Transfert d'argent", "Europe → Tunisie, montant reçu", "#db2777"],
      ["vitesse", "gauge", "Vitesse Internet réelle", "Test + carte par gouvernorat", "#0284c7"], ["transport", "bus", "Louage, train, bus", "Trajets entre villes", "#ea580c"],
      ["assurance-voyage", "umbrella", "Assurance voyage", "Visa Schengen, monde", "#0891b2"], ["omra", "moon", "Omra", "Formules des agences", "#047857"],
      ["panier", "cart", "Panier « Qoffa »", "Courses : quelle enseigne ?", "#dc2626"], ["high-tech", "laptop", "Smartphones & high-tech", "Prix entre boutiques", "#7c3aed"],
      ["solaire", "sun", "Énergie solaire", "Kit Prosol : coût & rentabilité", "#ca8a04"], ["budget-foyer", "home", "Budget foyer", "Toutes vos factures", "#9333ea"],
      ["fcr", "car", "Calculateur FCR", "Importer sa voiture ?", "#b91c1c"], ["pack-voyage", "globe", "Pack vacances", "Avion vs ferry, porte-à-porte", "#0e7490"]
    ];
    const GROUPS = [
      ["Télécom", "wifi", ["internet", "mobile", "vitesse"]],
      ["Voyage & mobilité", "plane", ["vols", "hotels", "location-voiture", "transport", "assurance-voyage", "omra"]],
      ["Maison & consommation", "home", ["panier", "high-tech", "solaire", "budget-foyer"]],
      ["Argent & assurance", "wallet", ["assurance-auto", "credit", "transfert"]],
      ["Tunisiens à l'étranger", "globe", ["pack-voyage", "ferry", "fcr", "transfert"]]
    ];
    const TABS = [["vols", "plane", "Vols"], ["hotels", "hotel", "Hôtels"], ["ferry", "ship", "Ferry"], ["internet", "wifi", "Internet"], ["mobile", "phone", "Mobile"], ["assurance", "shield", "Assurance"], ["voiture", "key", "Location"], ["credit", "bank", "Crédit"], ["transfert", "send", "Transfert"]];

    app.innerHTML = `
    <section class="hero"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
      <div class="container grid">
        <div>
          <span class="eyebrow"><b>NOUVEAU</b> Pack vacances & budget foyer multi-domaines</span>
          <h1>Comparez tout en Tunisie.<br><em>Payez moins.</em></h1>
          <p class="lead">Internet, mobile, vols, hôtels, assurance auto et location de voiture : toutes les offres analysées selon <b>vos</b> priorités, gratuitement.</p>
          <p class="ar" dir="rtl" lang="ar">قارن كل العروض في تونس ووفّر فلوسك</p>
          <div class="trust-row"><span>${icon("check")}100 % gratuit</span><span>${icon("scale")}Classement neutre</span><span>${icon("lock")}Sans inscription</span><span>${icon("pin")}Pensé pour la Tunisie</span></div>
        </div>
        <div class="live" aria-label="Exemple de comparaison">
          <h3>Fibre 100 Mbps · Tunis <small><span class="pulse"></span>Comparaison en direct</small></h3>
          <div class="muted" style="color:rgba(255,255,255,.7);font-size:12.5px">Prix mensuel · même débit, prix différents</div>
          ${live.map((o, i) => `<div class="live-row ${i === 0 ? "win" : ""}">${badge(o.p)}<div><b>${esc(o.p)}</b><div class="bar"><i style="width:${Math.round((o.price / lmax) * 100)}%"></i></div></div><div class="pr">${o.price} DT<small>${i === 0 ? "le moins cher" : "+" + (o.price - live[0].price) + " DT"}</small></div></div>`).join("")}
          <div class="save">${icon("trend")}Jusqu'à ${tnd((lmax - live[0].price) * 12)} d'économie par an</div>
        </div>
      </div>
    </section>
    <div class="container">
      <div class="searchbox">
        <div class="tabs" role="tablist">${TABS.map(([k, ic, l], i) => `<button type="button" class="tab ${i ? "" : "active"}" data-tab="${k}" role="tab">${icon(ic)}${l}</button>`).join("")}</div>
        <div class="search-body">
          <form data-pane="vols" class="form-grid">
            <div class="field"><label>Départ</label><select name="from">${depOpts}</select></div>
            <div class="field"><label>Destination</label><select name="to">${dstOpts}</select></div>
            <div class="field"><label>Aller</label><input type="date" name="date" value="${inDays(21)}" min="${inDays(0)}"></div>
            <div class="field"><label>Retour (option)</label><input type="date" name="ret" value="${inDays(28)}" min="${inDays(0)}"></div>
            <div class="field"><label>Voyageurs</label><select name="pax">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n + (n > 1 ? " adultes" : " adulte"), 1)).join("")}</select></div>
            <button class="btn btn-primary btn-lg">${icon("search")}Rechercher</button>
          </form>
          <form data-pane="hotels" class="form-grid" hidden>
            <div class="field"><label>Destination</label><select name="dest">${D.cities.map((c) => opt(c.id, c.name, "hammamet")).join("")}</select></div>
            <div class="field"><label>Arrivée</label><input type="date" name="in" value="${inDays(30)}" min="${inDays(0)}"></div>
            <div class="field"><label>Départ</label><input type="date" name="out" value="${inDays(37)}" min="${inDays(1)}"></div>
            <div class="field"><label>Adultes</label><select name="ad">${[1, 2, 3, 4].map((n) => opt(n, n, 2)).join("")}</select></div>
            <button class="btn btn-primary btn-lg">${icon("search")}Comparer les hôtels</button>
          </form>
          <form data-pane="internet" class="form-grid" hidden>
            <div class="field"><label>Votre gouvernorat</label><select name="gov">${D.governorates.map((g) => opt(g, g, "Tunis")).join("")}</select></div>
            <div class="field"><label>Technologie</label><select name="tech">${opt("", "Toutes")}${["Fibre", "VDSL", "ADSL", "4G Box", "5G Box"].map((t) => opt(t, t)).join("")}</select></div>
            <div class="field"><label>Débit minimum</label><select name="min">${[0, 10, 30, 50, 100, 300].map((n) => opt(n, n ? n + " Mbps" : "Peu importe")).join("")}</select></div>
            <button class="btn btn-primary btn-lg">${icon("search")}Comparer Internet</button>
          </form>
          <form data-pane="mobile" class="form-grid" hidden>
            <div class="field"><label>Data minimum</label><select name="data">${[0, 10, 30, 50, 100].map((n) => opt(n, n ? n + " Go" : "Peu importe")).join("")}</select></div>
            <div class="field"><label>Budget max / mois</label><select name="max">${[20, 35, 50, 70].map((n) => opt(n, n + " DT", 70)).join("")}</select></div>
            <button class="btn btn-primary btn-lg">${icon("search")}Comparer les forfaits</button>
          </form>
          <form data-pane="assurance" class="form-grid" hidden>
            <div class="field"><label>Puissance fiscale</label><select name="cv">${[4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => opt(n, n + " CV", 6)).join("")}</select></div>
            <div class="field"><label>Valeur du véhicule (DT)</label><input type="number" name="val" value="45000" min="5000" step="1000"></div>
            <div class="field"><label>Formule</label><select name="f">${opt("rc", "Responsabilité civile")}${opt("tp", "Tiers + vol/incendie", "tp")}${opt("tr", "Tous risques")}</select></div>
            <button class="btn btn-primary btn-lg">${icon("calc")}Calculer mon devis</button>
          </form>
          <form data-pane="voiture" class="form-grid" hidden>
            <div class="field"><label>Lieu de prise</label><select name="spot">${D.rentalSpots.map((s) => opt(s, s, D.rentalSpots[0])).join("")}</select></div>
            <div class="field"><label>Prise</label><input type="date" name="start" value="${inDays(14)}" min="${inDays(0)}"></div>
            <div class="field"><label>Retour</label><input type="date" name="end" value="${inDays(21)}" min="${inDays(1)}"></div>
            <button class="btn btn-primary btn-lg">${icon("search")}Comparer les loueurs</button>
          </form>
          <form data-pane="ferry" class="form-grid" hidden>
            <div class="field"><label>Port de départ</label><select name="route">${D.ferryRoutes.map((r) => opt(r.id, r.port + " → Tunis", "MRS")).join("")}</select></div>
            <div class="field"><label>Date</label><input type="date" name="date" value="${inDays(30)}" min="${inDays(0)}"></div>
            <div class="field"><label>Véhicule</label><select name="veh">${Object.entries(VEH).map(([k, v]) => opt(k, v, "car")).join("")}</select></div>
            <div class="field"><label>Adultes</label><select name="ad">${[1, 2, 3, 4, 5].map((n) => opt(n, n, 2)).join("")}</select></div>
            <button class="btn btn-primary btn-lg">${icon("search")}Comparer les ferries</button>
          </form>
          <form data-pane="credit" class="form-grid" hidden>
            <div class="field"><label>Type de crédit</label><select name="type">${Object.entries(D.loanTypes).map(([k, v]) => opt(k, v.label, "immo")).join("")}</select></div>
            <div class="field"><label>Montant (DT)</label><input type="number" name="amount" value="150000" min="1000" step="1000"></div>
            <div class="field"><label>Durée (ans)</label><input type="number" name="years" value="20" min="1" max="25"></div>
            <button class="btn btn-primary btn-lg">${icon("calc")}Simuler</button>
          </form>
          <form data-pane="transfert" class="form-grid" hidden>
            <div class="field"><label>Vous envoyez (€)</label><input type="number" name="amount" value="500" min="20" step="10"></div>
            <div class="field"><label>Depuis</label><select name="from">${COUNTRIES.map((c) => opt(c, c, "France")).join("")}</select></div>
            <div class="field"><label>Réception</label><select name="mode">${Object.entries(MODES).map(([k, v]) => opt(k, v, "compte")).join("")}</select></div>
            <button class="btn btn-primary btn-lg">${icon("send")}Comparer</button>
          </form>
        </div>
      </div>

      <section class="block">
        <div class="section-title"><span class="kicker">19 comparateurs</span><h2>Que voulez-vous comparer ?</h2><p>Une seule adresse pour toutes vos dépenses du quotidien et du voyage.</p></div>
        ${GROUPS.map(([gt, gic, list]) => `<div class="cat-group"><h3>${icon(gic)}${gt}</h3><div class="cat-grid">${list.map((k) => { const x = CATS.find((c) => c[0] === k); return `<a class="cat" href="#/${x[0]}"><span class="ico" style="background:${x[4]}1f;color:${x[4]}">${icon(x[1])}</span><span><b>${x[2]}</b><small>${x[3]}</small></span>${icon("arrow", "go")}</a>`; }).join("")}</div></div>`).join("")}
      </section>

      <section class="block" style="padding-top:0">
        <form class="saver" id="saver">
          <div class="saver-txt"><span class="kicker">${icon("wallet")} Calcul express</span><h2>Combien pouvez-vous économiser ?</h2><p>Entrez vos factures actuelles : on cherche la meilleure combinaison Internet + mobiles + assurance.</p></div>
          <div class="saver-f">
            <div class="field"><label>Internet (DT/mois)</label><input type="number" name="curNet" min="0" value="89"></div>
            <div class="field"><label>Mobiles (DT/mois)</label><input type="number" name="curMob" min="0" value="70"></div>
            <div class="field"><label>Assurance auto (DT/an)</label><input type="number" name="curIns" min="0" value="1100"></div>
            <div class="field"><label>Lignes mobiles</label><select name="lines">${[1, 2, 3, 4, 5].map((n) => opt(n, n, 2)).join("")}</select></div>
            <button class="btn btn-primary btn-lg">${icon("calc")}Calculer mon économie</button>
          </div>
        </form>
      </section>

      <section class="block" style="padding-top:0">
        <div class="section-title"><span class="kicker">Multi-domaines</span><h2>Comparez des scénarios complets</h2><p>Plusieurs comparateurs combinés pour obtenir le vrai coût total.</p></div>
        <div class="combo-grid">
          <a class="combo c1" href="#/pack-voyage"><div class="combo-ic"><span>${icon("plane")}</span><span>${icon("ship")}</span><span>${icon("hotel")}</span><span>${icon("key")}</span></div><h3>Pack vacances en Tunisie</h3><p>Avion + location, avion + transferts ou ferry avec votre voiture : coût porte-à-porte, durée et hôtel compris. Idéal pour les vacances au pays.</p><span class="combo-cta">Comparer les scénarios ${icon("arrow")}</span></a>
          <a class="combo c2" href="#/budget-foyer"><div class="combo-ic"><span>${icon("wifi")}</span><span>${icon("phone")}</span><span>${icon("shield")}</span></div><h3>Budget foyer</h3><p>Internet + forfaits de toute la famille + assurance auto : la meilleure combinaison, ou tout chez un seul opérateur, et votre économie annuelle.</p><span class="combo-cta">Calculer mon économie ${icon("arrow")}</span></a>
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="section-title"><span class="kicker">Comparaison avancée</span><h2>Bien plus qu'une liste de prix</h2><p>Des outils pour décider vite, et bien.</p></div>
        <div class="features">
          <div class="feature"><div class="ico">${icon("sparkles")}</div><h3>Score personnalisé</h3><p>Réglez l'importance du prix, du débit, de la flexibilité… le classement se recalcule instantanément.</p></div>
          <div class="feature"><div class="ico">${icon("scale")}</div><h3>Comparatif côte à côte</h3><p>Jusqu'à 3 offres, meilleure valeur surlignée, verdict et économie chiffrée. Partageable et imprimable.</p></div>
          <div class="feature"><div class="ico">${icon("bulb")}</div><h3>Assistant débit idéal</h3><p>3 questions sur votre foyer et vos usages : on calcule le débit qu'il vous faut vraiment.</p></div>
          <div class="feature"><div class="ico">${icon("chart")}</div><h3>Calendrier des prix</h3><p>Visualisez les prix des vols jour par jour et partez au meilleur moment.</p></div>
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="section-title"><span class="kicker">Mis à jour en continu</span><h2>Les bons plans du moment</h2><p>Calculés automatiquement à partir de nos comparateurs.</p></div>
        <div class="deals">
          ${dealCard("linear-gradient(135deg,#0a5c8a,#14b8a6)", "plane", "Vol aller · Tunis → Paris", fl.p, fl.price, "/ pers.", "#/vols?from=TUN&to=CDG&date=" + inDays(30))}
          ${dealCard("linear-gradient(135deg,#0891b2,#6366f1)", "hotel", `Djerba · ${ht.stars} étoiles · ${ht.board}`, ht.name, ht.night, "/ nuit", "#/hotels?dest=djerba")}
          ${dealCard("linear-gradient(135deg,#7c3aed,#db2777)", "wifi", "Fibre la moins chère", `${fibre.p} · ${fibre.down} Mbps`, fibre.price, "/ mois", "#/internet?tech=Fibre")}
          ${dealCard("linear-gradient(135deg,#059669,#65a30d)", "phone", "Meilleur prix au Go", `${mob.p} · ${mob.data} Go`, mob.price, "/ mois", "#/mobile")}
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="section-title"><span class="kicker">Simple</span><h2>Comment ça marche ?</h2><p>La meilleure offre en moins de 2 minutes.</p></div>
        <div class="steps">
          <div class="step"><div class="num">1</div><h3>Indiquez votre besoin</h3><p>Destination, gouvernorat, véhicule… quelques champs suffisent.</p></div>
          <div class="step"><div class="num">2</div><h3>Comparez selon vos priorités</h3><p>Filtres intelligents, score personnalisé, comparatif détaillé jusqu'à 3 offres.</p></div>
          <div class="step"><div class="num">3</div><h3>Souscrivez directement</h3><p>Un clic vous mène à l'offre chez le fournisseur. Aucun frais de notre part.</p></div>
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="stats">
          <div><b data-count="${D.internet.length + D.mobile.length}">0</b><span>offres télécom</span></div>
          <div><b data-count="${D.destinations.length * D.airportsTN.length}">0</b><span>liaisons aériennes</span></div>
          <div><b data-count="${D.insurers.length + D.rentals.length + D.banks.length + D.transfer.length}">0</b><span>assureurs, banques, loueurs & services</span></div>
          <div><b data-count="19">0</b><span>comparateurs & calculateurs</span></div>
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="section-title"><span class="kicker">FAQ</span><h2>Questions fréquentes</h2></div>
        <div class="faq">
          ${faq("Qarin.tn est-il vraiment gratuit ?", "Oui. La comparaison est gratuite et sans inscription. Le site peut être rémunéré par certains partenaires lorsque vous souscrivez via un lien, sans surcoût pour vous et sans influence sur le classement.")}
          ${faq("Comment fonctionne le score personnalisé ?", "Chaque offre est notée sur plusieurs critères (prix, performance, flexibilité, service…). Vous choisissez l'importance de chaque critère avec les curseurs « Mes priorités » : le score sur 10 et le pourcentage de correspondance sont recalculés immédiatement.")}
          ${faq("Comment comparer des offres côte à côte ?", "Cliquez sur « Comparer » sur 2 ou 3 offres, puis sur le bouton en bas de l'écran. Vous obtenez un tableau détaillé, la meilleure valeur surlignée, un verdict et l'économie réalisable. Le comparatif peut être partagé par lien ou imprimé.")}
          ${faq("D'où viennent les prix ? Sont-ils garantis ?", DEMO ? "Le site est actuellement une version de démonstration : les prix sont fictifs ou estimés par des modèles et ne proviennent pas des fournisseurs. Ils seront remplacés par des tarifs publics sourcés et datés, et par des flux officiels (affiliation, partenariats). Détails dans « Nos données & méthodologie »." : "Les prix proviennent des tarifs publics des fournisseurs (source et date affichées) ou de flux officiels. Le prix définitif est celui du fournisseur au moment de la souscription.")}
          ${faq("Qu'est-ce que le Pack vacances et le Budget foyer ?", "Ce sont des comparaisons multi-domaines : elles combinent plusieurs comparateurs (vols, ferry, hôtels, location… ou Internet, mobiles, assurance) pour comparer des scénarios complets sur leur coût total.")}
          ${faq("La fibre est-elle disponible chez moi ?", "Choisissez votre gouvernorat dans le comparateur Internet : seules les technologies généralement disponibles dans votre zone sont affichées. L'éligibilité exacte à votre adresse se vérifie chez l'opérateur.")}
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="cta-band"><div><h2>Pas sûr du débit qu'il vous faut ?</h2><p>Notre assistant le calcule en 3 questions et filtre les offres pour vous.</p></div><a class="btn btn-primary btn-lg" href="#/internet?assist=1">${icon("sparkles")}Lancer l'assistant</a></div>
      </section>
    </div>`;

    $$(".tab", app).forEach((t) => t.addEventListener("click", () => {
      $$(".tab", app).forEach((x) => { x.classList.toggle("active", x === t); x.setAttribute("aria-selected", x === t); });
      $$("[data-pane]", app).forEach((p) => (p.hidden = p.dataset.pane !== t.dataset.tab));
    }));
    const target = { vols: "vols", hotels: "hotels", internet: "internet", mobile: "mobile", assurance: "assurance-auto", voiture: "location-voiture", ferry: "ferry", credit: "credit", transfert: "transfert" };
    $$("[data-pane]", app).forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const p = Object.fromEntries(new FormData(f).entries());
      Object.keys(p).forEach((k) => p[k] === "" && delete p[k]);
      go(target[f.dataset.pane], p);
    }));
    $("#saver", app).addEventListener("submit", (e) => { e.preventDefault(); go("budget-foyer", Object.fromEntries(new FormData(e.target).entries())); });
    $$("[data-count]", app).forEach((el) => {
      const end = +el.dataset.count, t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  const faq = (q, a) => `<details><summary>${esc(q)}${icon("chev")}</summary><p>${esc(a)}</p></details>`;
  function dealCard(bg, ic, small, title, price, unit, href) {
    return `<a class="deal" href="${href}"><div class="top" style="background:${bg}"><small>${icon(ic)}${esc(small)}</small><b>${esc(title)}</b></div><div class="bot"><div class="price"><small>dès</small> ${tnd(price)} <small>${unit}</small></div><span class="go">${icon("arrow")}</span></div></a>`;
  }

  /* =========================================================
     INTERNET
     ========================================================= */
  function internetPage(params, path) {
    document.title = "Comparateur Internet Tunisie — Fibre, VDSL, ADSL, 4G/5G | Qarin.tn";
    const TECHS = ["Fibre", "VDSL", "ADSL", "4G Box", "5G Box"], PROVS = [...new Set(D.internet.map((o) => o.p))];
    const avail = (o, g) => (o.tech === "Fibre" ? D.fiberGov.includes(g) : o.tech === "5G Box" ? D.g5Gov.includes(g) : true);
    const H = (st) => +st.f.h;
    const total = (o, st) => o.price * H(st) + o.setup;
    const lp = (v) => (Math.log10(v) / 3) * 100;
    const tech = params.get("tech");
    const ctl = listPage({
      key: "internet", icon: "wifi", title: "Comparateur Internet", crumb: "Internet", cmpTitle: "Internet",
      sub: "Fibre, VDSL, ADSL et box 4G/5G de tous les fournisseurs tunisiens, classés selon vos priorités.",
      items: D.internet.map((o, i) => ({ ...o, id: "net" + i })),
      countText: (n, st) => `${n} offres <small>disponibles à ${esc(st.f.gov)}</small>`,
      price: (o) => o.price, cost: total, costLabel: "sur la durée choisie",
      perf: { label: "Le plus rapide", icon: "zap", get: (o) => o.down, text: (o) => `${spd(o.down)} ↓ · ${o.up} Mbps ↑` },
      criteria: [
        { k: "price", label: "Prix", get: (o) => o.price + o.setup / 24, better: "min", def: 4 },
        { k: "speed", label: "Débit", get: (o) => Math.sqrt(o.down), better: "max", def: 3 },
        { k: "up", label: "Envoi (upload)", get: (o) => Math.log2(o.up + 1), better: "max", def: 1 },
        { k: "flex", label: "Sans engagement", get: (o) => o.eng, better: "min", def: 2 }
      ],
      presets: [{ label: "Équilibré", w: { price: 4, speed: 3, up: 1, flex: 2 } }, { label: "Petit budget", w: { price: 5, speed: 1, up: 0, flex: 2 } }, { label: "Performance", w: { price: 1, speed: 5, up: 3, flex: 0 } }, { label: "Télétravail", w: { price: 2, speed: 3, up: 5, flex: 1 } }, { label: "Flexibilité", w: { price: 3, speed: 2, up: 0, flex: 5 } }],
      filters: [
        { key: "gov", type: "select", label: "Gouvernorat", options: D.governorates.map((g) => [g, g]), def: "Tunis", init: D.governorates.includes(params.get("gov")) ? params.get("gov") : null, test: (o, v) => avail(o, v), fixed: true },
        { key: "tech", type: "checks", label: "Technologie", options: TECHS, get: (o) => o.tech, init: TECHS.includes(tech) ? [tech] : null },
        { key: "min", type: "select", label: "Débit minimum", options: [[0, "Peu importe"], [10, "10 Mbps"], [30, "30 Mbps"], [50, "50 Mbps"], [100, "100 Mbps"], [300, "300 Mbps"], [500, "500 Mbps"]], def: "0", init: params.get("min") || null, test: (o, v) => o.down >= +v, chip: (v) => `Débit ≥ ${spd(+v)}` },
        { key: "max", type: "range", label: "Prix max", min: 30, max: 250, step: 5, mode: "max", get: (o) => o.price, fmt: (v) => v + " DT" },
        { key: "noeng", type: "toggle", label: "Sans engagement", test: (o) => !o.eng },
        { key: "nosetup", type: "toggle", label: "Installation offerte", test: (o) => !o.setup },
        { key: "prov", type: "checks", label: "Fournisseurs", options: PROVS, get: (o) => o.p },
        { key: "h", type: "select", label: "Coût total calculé sur", options: [["12", "12 mois"], ["24", "24 mois"], ["36", "36 mois"]], def: "24", test: () => true, fixed: true }
      ],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix", (a, b) => a.price - b.price, "tag"], ["speed", "Débit", (a, b) => b.down - a.down, "zap"], ["total", "Coût total", (a, b, st) => total(a, st) - total(b, st), "calc"]],
      ribbons: (o) => (o.promo ? `<span class="ribbon r-hot">${icon("fire")}Promo</span>` : "") + (!o.eng ? `<span class="ribbon r-info">${icon("unlock")}Sans engagement</span>` : ""),
      card: (o, st) => `<div class="head">${badge(o.p)}<div><h3>${esc(o.name)}</h3><small>${esc(o.p)}</small> <span class="tech">${o.tech}</span></div></div>
        <div class="meters">${meter("Réception", lp(o.down), spd(o.down))}${meter("Envoi", lp(o.up), o.up + " Mbps")}</div>
        <div class="specs">${spec("Installation", o.setup ? tnd(o.setup) : "Offerte")}${spec("Engagement", o.eng ? o.eng + " mois" : "Aucun")}${spec("Coût " + H(st) + " mois", tnd(total(o, st)))}${spec("Prix / Mbps", (o.price / o.down).toFixed(2).replace(".", ",") + " DT")}</div>${feats(o.feats)}`,
      details: (o, st) => `<table><tr><td>Abonnement ${H(st)} mois × ${tnd(o.price)}</td><td>${tnd(o.price * H(st))}</td></tr><tr><td>Frais d'installation</td><td>${o.setup ? tnd(o.setup) : "Offerts"}</td></tr><tr class="total"><td>Coût total sur ${H(st)} mois</td><td>${tnd(total(o, st))}</td></tr><tr><td>Équivalent mensuel réel</td><td>${(total(o, st) / H(st)).toFixed(1).replace(".", ",")} DT</td></tr><tr><td>${icon("clock")} Télécharger un film HD (5 Go)</td><td>≈ ${secs((5 * 8000) / o.down)}</td></tr><tr><td>${icon("clock")} Envoyer 1 Go de fichiers</td><td>≈ ${secs(8000 / o.up)}</td></tr></table>`,
      side: (o, st) => `<div><div class="price-big">${nf.format(o.price)}<sup>DT/mois</sup></div><div class="price-sub"><b>${tnd(total(o, st))}</b> sur ${H(st)} mois</div></div>`,
      url: (o) => purl(o.p), fav: (o) => ({ title: o.name, sub: `${o.p} · ${o.tech}`, price: o.price + " DT/mois" }),
      compare: [
        { g: "Prix" },
        ["Prix mensuel", (o) => ({ n: o.price, t: tnd(o.price) }), "min"], ["Installation", (o) => ({ n: o.setup, t: o.setup ? tnd(o.setup) : "Offerte" }), "min"],
        ["Coût total", (o, st) => ({ n: total(o, st), t: `${tnd(total(o, st))} <small class="muted">/${H(st)} mois</small>` }), "min"], ["Prix par Mbps", (o) => ({ n: +(o.price / o.down).toFixed(2), t: (o.price / o.down).toFixed(2).replace(".", ",") + " DT" }), "min"],
        { g: "Performance" },
        ["Réception", (o) => ({ n: o.down, t: spd(o.down) }), "max"], ["Envoi", (o) => ({ n: o.up, t: o.up + " Mbps" }), "max"],
        ["Film HD 5 Go", (o) => ({ n: (5 * 8000) / o.down, t: secs((5 * 8000) / o.down) }), "min", false], ["Technologie", (o) => o.tech],
        { g: "Contrat" },
        ["Engagement", (o) => ({ n: o.eng, t: o.eng ? o.eng + " mois" : "Aucun" }), "min", false], ["Inclus", (o) => o.feats.join(" · ")]
      ],
      top: `<div class="assist"><div><b>${icon("bulb")}Quel débit vous faut-il vraiment ?</b><small id="assistTxt">Répondez à 3 questions, on calcule et on filtre pour vous.</small></div><button type="button" class="btn btn-brand btn-sm" data-wizard>${icon("sparkles")}Lancer l'assistant</button></div>`,
      after: (c) => { $("[data-wizard]", app).addEventListener("click", () => wizard(c)); if (params.get("assist")) setTimeout(() => wizard(c), 200); }
    }, params, path);
    return ctl;
  }
  function wizard(ctl) {
    const U = [["web", "Web & réseaux sociaux", 3], ["hd", "Streaming HD", 8], ["uhd", "Streaming 4K", 25], ["game", "Jeux en ligne", 15], ["work", "Télétravail & visio", 8], ["dl", "Gros téléchargements", 40]];
    openModal(`<div class="mpad wiz"><h2>${icon("sparkles")} Assistant débit idéal</h2><p class="muted" style="margin:0">On estime le débit nécessaire pour votre foyer.</p>
      <form id="wz">
        <div class="q">1. Combien de personnes utilisent Internet ?</div>
        <div class="opts">${[[1, "Seul(e)"], [2, "2 – 3"], [4, "4 – 5"], [6, "6 et plus"]].map(([v, l], i) => `<label class="opt"><input type="radio" name="n" value="${v}" ${i === 1 ? "checked" : ""}><span>${icon("users")}${l}</span></label>`).join("")}</div>
        <div class="q">2. Quels usages ? <small class="muted">(plusieurs choix)</small></div>
        <div class="opts">${U.map(([k, l, m], i) => `<label class="opt"><input type="checkbox" name="u" value="${k}" ${i < 2 ? "checked" : ""}><span>${l}<small>~${m} Mbps / pers.</small></span></label>`).join("")}</div>
        <div class="q">3. Avez-vous (ou pouvez-vous avoir) une ligne fixe ?</div>
        <div class="opts"><label class="opt"><input type="radio" name="l" value="1" checked><span>Oui<small>Fibre, VDSL ou ADSL</small></span></label><label class="opt"><input type="radio" name="l" value="0"><span>Non<small>Box 4G / 5G sans ligne</small></span></label></div>
        <div class="wiz-result"><div><small>Débit recommandé</small><b id="wzOut">—</b><small id="wzWhy"></small></div><button type="submit" class="btn btn-primary">${icon("check")}Appliquer</button></div>
      </form></div>`, true);
    const f = $("#wz"), TIERS = [10, 30, 50, 100, 300, 500];
    const calc = () => {
      const n = +f.n.value, us = $$("input[name=u]:checked", f).map((i) => i.value);
      const per = U.filter((u) => us.includes(u[0])).reduce((s, u) => s + u[2], 0) || 3;
      const need = Math.round(per * n * (n > 1 ? 0.75 : 1) + 5);
      const tier = TIERS.find((t) => t >= need) || 500;
      $("#wzOut").textContent = "≥ " + tier + " Mbps";
      $("#wzWhy").textContent = `Besoin estimé ≈ ${need} Mbps en usage simultané`;
      return { tier, us, line: f.l.value === "1" };
    };
    f.addEventListener("input", calc); calc();
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const r = calc();
      const techs = !r.line ? ["4G Box", "5G Box"] : r.us.includes("game") || r.tier >= 100 ? ["Fibre", "VDSL", "5G Box"] : ["Fibre", "VDSL", "ADSL", "4G Box", "5G Box"];
      ctl.setFilters({ min: String(r.line ? r.tier : Math.min(r.tier, 30)), tech: techs });
      if (r.us.includes("work")) ctl.setWeights({ price: 2, speed: 3, up: 5, flex: 1 });
      else if (r.us.includes("game") || r.us.includes("uhd")) ctl.setWeights({ price: 2, speed: 5, up: 2, flex: 1 });
      const at = $("#assistTxt"); if (at) at.innerHTML = `Recommandé pour vous : <b>≥ ${r.tier} Mbps</b> — filtres appliqués.`;
      closeModal(); toast("Filtres de l'assistant appliqués", "sparkles");
    });
  }

  /* =========================================================
     MOBILE
     ========================================================= */
  function mobilePage(params, path) {
    document.title = "Comparateur forfaits mobiles Tunisie — Ooredoo, Orange, Tunisie Telecom | Qarin.tn";
    const OPS = [...new Set(D.mobile.map((o) => o.p))];
    const unl = (o) => o.min.startsWith("Illimit");
    listPage({
      key: "mobile", icon: "phone", title: "Forfaits mobiles", crumb: "Mobile", cmpTitle: "forfaits mobiles", unit: "forfaits",
      sub: "Data, appels et prix : trouvez le forfait qui vous ressemble.",
      items: D.mobile.map((o, i) => ({ ...o, id: "mob" + i })),
      price: (o) => o.price, cost: (o) => o.price * 12, costLabel: "par an",
      perf: { label: "Le plus de data", icon: "zap", get: (o) => o.data, text: (o) => `${o.data} Go · ${(o.price / o.data).toFixed(2).replace(".", ",")} DT/Go` },
      criteria: [
        { k: "price", label: "Prix", get: (o) => o.price, better: "min", def: 4 }, { k: "data", label: "Volume de data", get: (o) => Math.sqrt(o.data), better: "max", def: 3 },
        { k: "calls", label: "Appels", get: (o) => (unl(o) ? 1 : (parseInt(o.min) || 0) / 1000), better: "max", def: 2 }, { k: "flex", label: "Sans engagement", get: (o) => o.eng, better: "min", def: 2 }
      ],
      presets: [{ label: "Équilibré", w: { price: 4, data: 3, calls: 2, flex: 2 } }, { label: "Petit budget", w: { price: 5, data: 1, calls: 1, flex: 2 } }, { label: "Gros consommateur data", w: { price: 2, data: 5, calls: 1, flex: 1 } }, { label: "Bavard", w: { price: 2, data: 1, calls: 5, flex: 1 } }],
      filters: [
        { key: "op", type: "checks", label: "Opérateurs", options: OPS, get: (o) => o.p },
        { key: "data", type: "select", label: "Data minimum", options: [[0, "Peu importe"], [10, "10 Go"], [30, "30 Go"], [50, "50 Go"], [100, "100 Go"]], def: "0", init: params.get("data") || null, test: (o, v) => o.data >= +v, chip: (v) => `Data ≥ ${v} Go` },
        { key: "max", type: "range", label: "Budget max", min: 15, max: 70, step: 5, mode: "max", init: +params.get("max") || null, get: (o) => o.price, fmt: (v) => v + " DT" },
        { key: "unl", type: "toggle", label: "Appels illimités", test: unl },
        { key: "g5", type: "toggle", label: "5G incluse", test: (o) => o.feats.some((f) => f.includes("5G")) },
        { key: "noeng", type: "toggle", label: "Sans engagement", test: (o) => !o.eng }
      ],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix", (a, b) => a.price - b.price, "tag"], ["data", "Data", (a, b) => b.data - a.data, "zap"], ["pergo", "Prix / Go", (a, b) => a.price / a.data - b.price / b.data, "calc"]],
      ribbons: (o) => (o.promo ? `<span class="ribbon r-hot">${icon("fire")}Promo</span>` : "") + (!o.eng ? `<span class="ribbon r-info">${icon("unlock")}Sans engagement</span>` : ""),
      card: (o) => `<div class="head">${badge(o.p)}<div><h3>${esc(o.name)}</h3><small>${esc(o.p)}</small></div></div>
        <div class="meters">${meter("Data", (o.data / 150) * 100, o.data + " Go")}</div>
        <div class="specs">${spec("Appels", esc(o.min))}${spec("SMS", esc(o.sms))}${spec("Engagement", o.eng ? o.eng + " mois" : "Aucun")}${spec("Prix / Go", (o.price / o.data).toFixed(2).replace(".", ",") + " DT")}</div>${feats(o.feats)}`,
      details: (o) => `<table><tr><td>Coût sur 12 mois</td><td>${tnd(o.price * 12)}</td></tr><tr><td>Coût sur 24 mois</td><td>${tnd(o.price * 24)}</td></tr><tr><td>Heures de streaming HD (≈ 1,5 Go/h)</td><td>≈ ${Math.round(o.data / 1.5)} h/mois</td></tr><tr><td>Heures de réseaux sociaux (≈ 0,15 Go/h)</td><td>≈ ${Math.round(o.data / 0.15)} h/mois</td></tr></table>`,
      side: (o) => `<div><div class="price-big">${o.price}<sup>DT/mois</sup></div><div class="price-sub"><b>${tnd(o.price * 12)}</b> par an</div></div>`,
      url: (o) => purl(o.p), fav: (o) => ({ title: o.name, sub: `${o.p} · ${o.data} Go`, price: o.price + " DT/mois" }),
      compare: [
        { g: "Prix" }, ["Prix mensuel", (o) => ({ n: o.price, t: tnd(o.price) }), "min"], ["Coût annuel", (o) => ({ n: o.price * 12, t: tnd(o.price * 12) }), "min"], ["Prix par Go", (o) => ({ n: +(o.price / o.data).toFixed(2), t: (o.price / o.data).toFixed(2).replace(".", ",") + " DT" }), "min"],
        { g: "Contenu" }, ["Data", (o) => ({ n: o.data, t: o.data + " Go" }), "max"], ["Appels", (o) => o.min], ["SMS", (o) => o.sms], ["5G incluse", (o) => yes(o.feats.some((f) => f.includes("5G"))), "max", false],
        { g: "Contrat" }, ["Engagement", (o) => ({ n: o.eng, t: o.eng ? o.eng + " mois" : "Aucun" }), "min", false], ["Inclus", (o) => o.feats.join(" · ")]
      ]
    }, params, path);
  }

  /* =========================================================
     VOLS
     ========================================================= */
  function genFlights(from, to, date, cls) {
    const dst = D.destinations.find((d) => d.code === to), org = D.airportsTN.find((a) => a.code === from);
    if (!dst || !org) return [];
    const r = rng(hashStr(from + to + date + cls));
    const d = new Date(date + "T00:00:00");
    const season = [0.85, 0.8, 0.92, 1, 1.05, 1.2, 1.45, 1.5, 1.1, 0.95, 0.88, 1.25][d.getMonth()];
    const dowF = [1.08, 0.95, 0.92, 0.94, 1.02, 1.12, 1.05][d.getDay()];
    const lead = daysBetween(iso(today()), date);
    const leadF = lead < 7 ? 1.35 : lead < 21 ? 1.15 : lead > 120 ? 0.95 : 1;
    const base = 120 + dst.km * 0.19, clsF = cls === "business" ? 3.1 : 1;
    const directs = D.directAirlines[to] || [];
    let airlines = dst.air.slice();
    if (from !== "TUN") { airlines = airlines.filter((a) => ["Tunisair", "Nouvelair", "Transavia", "Turkish Airlines", "Qatar Airways"].includes(a)); if (!airlines.length) airlines = ["Tunisair"]; }
    const out = [];
    airlines.forEach((a, ai) => {
      let direct = directs.includes(a);
      if (from !== "TUN") direct = direct && ["Tunisair", "Nouvelair", "Transavia"].includes(a) && dst.km < 2000 && (a !== "Tunisair" || ["DJE", "MIR", "NBE"].includes(from));
      let via = null;
      if (!direct) { via = from !== "TUN" && ["Tunisair", "Nouvelair"].includes(a) ? "TUN" : D.hubs[a]; if (via === to) { direct = true; via = null; } else if (via === from) via = "IST"; }
      const n = 1 + (r() < (direct ? 0.55 : 0.3) ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const dep = (6 + Math.floor(r() * 16)) * 60 + [0, 15, 30, 45][Math.floor(r() * 4)];
        const block = Math.round((dst.km / 780) * 60 + 35);
        const duration = direct ? block : Math.round(block * 1.35 + 60 + r() * 220);
        const price = Math.round(base * season * dowF * leadF * (D.airlineFactor[a] || 1) * clsF * org.f * (direct ? 1.06 : 0.92) * (0.84 + r() * 0.4));
        const retDep = (7 + Math.floor(r() * 14)) * 60 + [0, 20, 40][Math.floor(r() * 3)];
        out.push({ id: `fl${ai}${k}`, p: a, name: a, dep, duration, direct, via, price, retPrice: Math.round(price * (0.88 + r() * 0.28)), retDep, bag: a === "Transavia" ? "Cabine 10 kg" : cls === "business" ? "2 × 32 kg" : "Soute 23 kg" });
      }
    });
    return out;
  }
  function flightsPage(params, path) {
    const q = {
      from: D.airportsTN.some((a) => a.code === params.get("from")) ? params.get("from") : "TUN",
      to: D.destinations.some((d) => d.code === params.get("to")) ? params.get("to") : "CDG",
      date: validDate(params.get("date")) && params.get("date") >= inDays(0) ? params.get("date") : inDays(21),
      ret: validDate(params.get("ret")) ? params.get("ret") : "",
      pax: clamp(+params.get("pax") || 1, 1, 9), cls: params.get("cls") === "business" ? "business" : "eco"
    };
    if (q.ret && q.ret < q.date) q.ret = "";
    const dst = D.destinations.find((d) => d.code === q.to), org = D.airportsTN.find((a) => a.code === q.from);
    document.title = `Vols ${org.city} → ${dst.city} pas chers | Qarin.tn`;
    const items = genFlights(q.from, q.to, q.date, q.cls).map((f) => ({ ...f, pp: f.price + (q.ret ? f.retPrice : 0) }));
    const AIR = [...new Set(items.map((f) => f.p))];
    const ppMax = Math.ceil(Math.max(...items.map((f) => f.pp)) / 50) * 50, ppMin = Math.floor(Math.min(...items.map((f) => f.pp)) / 50) * 50;
    const slotOf = (m) => (m < 720 ? "Matin" : m < 1080 ? "Après-midi" : "Soir");
    const nights = q.ret ? daysBetween(q.date, q.ret) : 0;
    const gf = `https://www.google.com/travel/flights?hl=fr&q=${encodeURIComponent(`Vols de ${q.from} à ${q.to} le ${q.date}${q.ret ? " retour " + q.ret : ""}`)}`;
    // calendrier des prix (14 jours)
    let startD = addDays(q.date, -6); if (startD < inDays(0)) startD = inDays(0);
    const days = Array.from({ length: 14 }, (_, i) => addDays(startD, i)).map((d) => ({ d, p: Math.min(...genFlights(q.from, q.to, d, q.cls).map((f) => f.price)) }));
    const cMin = Math.min(...days.map((x) => x.p)), cMax = Math.max(...days.map((x) => x.p));
    const cheapDay = days.find((x) => x.p === cMin), curP = (days.find((x) => x.d === q.date) || { p: cMin }).p;
    const chart = `<div class="chart"><div class="chart-head"><b>${icon("chart")}Calendrier des prix <small>· aller, par personne</small></b><button type="button" class="btn btn-soft btn-sm" data-alert>${icon("bell")}Alerte prix</button></div>
      <div class="bars">${days.map((x) => `<button type="button" data-day="${x.d}" class="${x.d === q.date ? "active" : ""} ${x.p === cMin ? "cheap" : ""}" title="${frDate(x.d)} : dès ${tnd(x.p)}"><span class="v">${x.p}</span><i style="height:${25 + ((x.p - cMin) / (cMax - cMin || 1)) * 65}%"></i><span class="d">${new Date(x.d + "T00:00:00").getDate()}/${new Date(x.d + "T00:00:00").getMonth() + 1}</span></button>`).join("")}</div>
      ${cheapDay.d !== q.date && curP - cMin > 5 ? `<div class="tip">${icon("bulb")}Partez le ${frDate(cheapDay.d, { weekday: "long", day: "numeric", month: "long" })} et économisez ${tnd(curP - cMin)} par personne.</div>` : `<div class="tip">${icon("check")}Bonne nouvelle : votre date fait partie des moins chères de la période.</div>`}</div>`;
    const form = `<form class="page-search form-grid" id="fs">
      <div class="field"><label>Départ</label><select name="from">${D.airportsTN.map((a) => opt(a.code, `${a.city} (${a.code})`, q.from)).join("")}</select></div>
      <div class="field"><label>Destination</label><select name="to">${D.destinations.map((d) => opt(d.code, `${d.city} (${d.code})`, q.to)).join("")}</select></div>
      <div class="field"><label>Aller</label><input type="date" name="date" value="${q.date}" min="${inDays(0)}"></div>
      <div class="field"><label>Retour</label><input type="date" name="ret" value="${q.ret}" min="${inDays(0)}"></div>
      <div class="field"><label>Voyageurs</label><select name="pax">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n, q.pax)).join("")}</select></div>
      <div class="field"><label>Classe</label><select name="cls">${opt("eco", "Économique", q.cls)}${opt("business", "Affaires", q.cls)}</select></div>
      <button class="btn btn-primary">${icon("search")}Rechercher</button></form>`;
    const row = (f, dep, a, b, lbl) => `<div class="fl-row">${badge(f.p)}<div class="fl-time"><b>${hm(dep)}</b><small>${a} · ${lbl}</small></div>
      <div class="fl-line">${dur(f.duration)}<div class="bar">${f.direct ? "" : '<span class="via"></span>'}</div>${f.direct ? '<span class="direct">Direct</span>' : `<span class="stop">1 escale · ${f.via}</span>`}</div>
      <div class="fl-time" style="text-align:right"><b>${hm(dep + f.duration)}${dep + f.duration >= 1440 ? '<sup style="color:var(--accent);font-size:12px"> +1</sup>' : ""}</b><small>${b}</small></div></div>`;
    listPage({
      key: "vols", icon: "plane", title: `${org.city} → ${dst.city}`, crumb: "Vols", cmpTitle: "vols", unit: "vols",
      sub: `${frDate(q.date, { weekday: "long", day: "numeric", month: "long" })}${q.ret ? " · retour " + frDate(q.ret, { weekday: "long", day: "numeric", month: "long" }) : " · aller simple"} · ${q.pax} voyageur${q.pax > 1 ? "s" : ""} · ${q.cls === "business" ? "Affaires" : "Économique"}`,
      searchForm: form, items, top: chart,
      note: "<b>Prix estimés</b> par personne selon la saison, le jour et la compagnie. « Voir les vols » affiche la disponibilité et le prix réels en temps réel.",
      price: (f) => f.pp, cost: (f) => f.pp * q.pax, costLabel: "pour le voyage",
      perf: { label: "Le plus rapide", icon: "zap", get: (f) => -f.duration, text: (f) => dur(f.duration) + (f.direct ? " · direct" : " · via " + f.via) },
      label: (f) => f.p, sublabel: (f) => `${hm(f.dep)} · ${f.direct ? "Direct" : "1 escale"}`,
      criteria: [{ k: "price", label: "Prix", get: (f) => f.pp, better: "min", def: 4 }, { k: "dur", label: "Durée", get: (f) => f.duration, better: "min", def: 3 }, { k: "direct", label: "Vol direct", get: (f) => (f.direct ? 1 : 0), better: "max", def: 2 }, { k: "bag", label: "Bagage soute", get: (f) => (f.bag.startsWith("Cabine") ? 0 : 1), better: "max", def: 1 }],
      presets: [{ label: "Meilleur compromis", w: { price: 4, dur: 3, direct: 2, bag: 1 } }, { label: "Le moins cher", w: { price: 5, dur: 0, direct: 0, bag: 0 } }, { label: "Le plus rapide", w: { price: 1, dur: 5, direct: 3, bag: 0 } }, { label: "Confort", w: { price: 2, dur: 3, direct: 5, bag: 4 } }],
      filters: [
        { key: "direct", type: "toggle", label: "Vols directs uniquement", test: (f) => f.direct },
        { key: "bag", type: "toggle", label: "Bagage soute inclus", test: (f) => !f.bag.startsWith("Cabine") },
        { key: "slot", type: "checks", label: "Heure de départ", options: ["Matin", "Après-midi", "Soir"], get: (f) => slotOf(f.dep) },
        { key: "max", type: "range", label: "Prix max / pers.", min: ppMin, max: ppMax, step: 10, mode: "max", get: (f) => f.pp, fmt: (v) => v + " DT" },
        { key: "air", type: "checks", label: "Compagnies", options: AIR, get: (f) => f.p }
      ],
      sorts: [["score", "Meilleur compromis", null, "sparkles"], ["price", "Moins cher", (a, b) => a.pp - b.pp, "tag"], ["dur", "Plus rapide", (a, b) => a.duration - b.duration, "zap"], ["dep", "Départ", (a, b) => a.dep - b.dep, "clock"]],
      ribbons: (f) => (f.direct ? `<span class="ribbon r-ok">${icon("zap")}Direct</span>` : "") + `<span class="ribbon r-info">${icon("bag")}${f.bag}</span>`,
      card: (f) => `${row(f, f.dep, q.from, q.to, "Aller")}${q.ret ? row(f, f.retDep, q.to, q.from, "Retour " + frDate(q.ret)) : ""}<small class="muted" style="font-weight:600">${esc(f.p)}${f.direct ? " · vol direct" : " · correspondance à " + f.via}</small>`,
      details: (f) => `<table><tr><td>Aller · ${esc(f.p)}</td><td>${tnd(f.price)}</td></tr>${q.ret ? `<tr><td>Retour</td><td>${tnd(f.retPrice)}</td></tr>` : ""}<tr><td>Prix par personne</td><td>${tnd(f.pp)}</td></tr><tr class="total"><td>Total ${q.pax} voyageur${q.pax > 1 ? "s" : ""}</td><td>${tnd(f.pp * q.pax)}</td></tr><tr><td>Bagage inclus</td><td>${f.bag}</td></tr></table>`,
      side: (f) => `<div><div class="price-big">${nf.format(f.pp)}<sup>DT</sup></div><div class="price-sub">par pers. ${q.ret ? "aller-retour" : "aller simple"}${q.pax > 1 ? `<br><b>${tnd(f.pp * q.pax)}</b> pour ${q.pax}` : ""}</div></div>`,
      cta: "Voir les vols", url: () => gf, fav: (f) => ({ title: `${q.from} → ${q.to} · ${f.p}`, sub: `${frDate(q.date)} ${hm(f.dep)}${q.ret ? " · A/R" : ""}`, price: tnd(f.pp) + "/pers." }),
      compare: [
        { g: "Prix" }, ["Prix par personne", (f) => ({ n: f.pp, t: tnd(f.pp) }), "min"], ["Total voyage", (f) => ({ n: f.pp * q.pax, t: tnd(f.pp * q.pax) }), "min"],
        { g: "Trajet" }, ["Durée", (f) => ({ n: f.duration, t: dur(f.duration) }), "min"], ["Escales", (f) => ({ n: f.direct ? 0 : 1, t: f.direct ? "Direct" : "1 · " + f.via }), "min", false],
        ["Départ aller", (f) => hm(f.dep)], ["Arrivée", (f) => hm(f.dep + f.duration)], ...(q.ret ? [["Départ retour", (f) => hm(f.retDep)]] : []),
        { g: "Confort" }, ["Bagage", (f) => f.bag], ["Compagnie", (f) => f.p]
      ],
      after: () => {
        $("#fs").addEventListener("submit", (e) => { e.preventDefault(); const p = Object.fromEntries(new FormData(e.target).entries()); if (!p.ret) delete p.ret; go("vols", p); });
        $("[data-alert]", app).addEventListener("click", () => addAlert({ kind: "vol", from: q.from, to: q.to, date: q.date, label: `Vol ${org.city} → ${dst.city} · ${frDate(q.date)}`, now: curP, route: location.hash }));
        $$("[data-day]", app).forEach((b) => b.addEventListener("click", () => {
          const p = { from: q.from, to: q.to, date: b.dataset.day, pax: q.pax, cls: q.cls };
          if (q.ret) p.ret = q.ret < b.dataset.day ? addDays(b.dataset.day, nights || 7) : q.ret;
          go("vols", p);
        }));
      }
    }, params, path);
  }

  /* =========================================================
     HÔTELS
     ========================================================= */
  function genHotels(cityId, date, nights) {
    const city = D.cities.find((c) => c.id === cityId) || D.cities[0];
    const r = rng(hashStr("hotels" + city.id)), rp = rng(hashStr("hp" + city.id + date));
    const season = [0.75, 0.75, 0.85, 0.95, 1.05, 1.3, 1.6, 1.7, 1.25, 1, 0.82, 0.95][new Date(date + "T00:00:00").getMonth()];
    const used = new Set();
    return D.hotelTypes.concat(D.hotelTypes.filter(() => r() < 0.4)).map((t, i) => {
      let nm; do { nm = D.nameBits[Math.floor(r() * D.nameBits.length)]; } while (used.has(nm) && used.size < D.nameBits.length); used.add(nm);
      const suffix = t.t.includes("Resort") ? " Resort" : t.t.includes("Résidence") ? " Résidence" : "";
      const name = (t.t.includes("Maison") ? "Dar " : "Hôtel ") + nm + suffix;
      const night = Math.round(t.base * (D.cityFactor[city.id] || 1) * season * (0.85 + rp() * 0.35) * (nights >= 7 ? 0.93 : 1));
      const rating = Math.min(9.6, Math.round((7.4 + r() * 2 + (t.stars - 3) * 0.15) * 10) / 10);
      const beach = t.feats.some((f) => f.startsWith("Plage")) ? Math.round(r() * 3) * 50 : Math.round(300 + r() * 2500);
      return { id: "h" + i, p: name, name, short: nm.replace(/^(Les|Le|El|Sidi)\s+/, "").slice(0, 2).toUpperCase(), color: `linear-gradient(135deg,${city.g1},${city.g2})`, type: t.t, stars: t.stars, board: t.board, feats: t.feats, night, rating, beach, reviews: Math.round(80 + r() * 2400), hue: Math.round(r() * 60 - 30), city };
    });
  }
  function hotelsPage(params, path) {
    const city = D.cities.find((c) => c.id === params.get("dest")) || D.cities[0];
    const din = validDate(params.get("in")) && params.get("in") >= inDays(0) ? params.get("in") : inDays(30);
    const dout = validDate(params.get("out")) && params.get("out") > din ? params.get("out") : addDays(din, 7);
    const nights = daysBetween(din, dout), ad = clamp(+params.get("ad") || 2, 1, 6);
    document.title = `Hôtels à ${city.name} — comparez les prix | Qarin.tn`;
    const items = genHotels(city.id, din, nights);
    const BOARDS = ["All Inclusive", "Demi-pension", "Petit-déjeuner", "Logement seul"], FEATS = ["Plage", "Plage privée", "Piscine", "Spa", "Club enfants", "Adultes uniquement", "Thalasso", "Wi-Fi"];
    const nMax = Math.ceil(Math.max(...items.map((h) => h.night)) / 10) * 10, nMin = Math.floor(Math.min(...items.map((h) => h.night)) / 10) * 10;
    const booking = `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(city.name.split(" &")[0] + ", Tunisie")}&checkin=${din}&checkout=${dout}&group_adults=${ad}&no_rooms=1`;
    const beachTxt = (h) => (h.beach <= 150 ? (h.beach ? h.beach + " m de la plage" : "Accès direct plage") : (h.beach / 1000).toFixed(1).replace(".", ",") + " km de la plage");
    const form = `<form class="page-search form-grid" id="hs">
      <div class="field"><label>Destination</label><select name="dest">${D.cities.map((c) => opt(c.id, c.name, city.id)).join("")}</select></div>
      <div class="field"><label>Arrivée</label><input type="date" name="in" value="${din}" min="${inDays(0)}"></div>
      <div class="field"><label>Départ</label><input type="date" name="out" value="${dout}" min="${inDays(1)}"></div>
      <div class="field"><label>Adultes</label><select name="ad">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n, ad)).join("")}</select></div>
      <button class="btn btn-primary">${icon("search")}Rechercher</button></form>`;
    listPage({
      key: "hotels", icon: "hotel", title: `Hôtels à ${city.name}`, crumb: "Hôtels", cmpTitle: "hôtels", cardClass: "hotel",
      sub: `${frDate(din)} → ${frDate(dout)} · ${nights} nuit${nights > 1 ? "s" : ""} · ${ad} adulte${ad > 1 ? "s" : ""}`,
      searchForm: form, items, countText: (n) => `${n} hébergements <small>à ${esc(city.name)}</small>`,
      note: "Établissements présentés à titre d'exemple avec des <b>prix moyens estimés</b> pour la période. La disponibilité et le prix réels s'affichent chez notre partenaire de réservation.",
      price: (h) => h.night, cost: (h) => h.night * nights * ad, costLabel: "sur le séjour",
      perf: { label: "Le mieux noté", icon: "star", get: (h) => h.rating, text: (h) => `${h.rating}/10 · ${nf.format(h.reviews)} avis` },
      criteria: [{ k: "price", label: "Prix", get: (h) => h.night, better: "min", def: 4 }, { k: "rating", label: "Note des clients", get: (h) => h.rating, better: "max", def: 4 }, { k: "stars", label: "Catégorie (étoiles)", get: (h) => h.stars, better: "max", def: 1 }, { k: "beach", label: "Proximité plage", get: (h) => h.beach, better: "min", def: 2 }],
      presets: [{ label: "Rapport qualité/prix", w: { price: 4, rating: 4, stars: 1, beach: 2 } }, { label: "Petit budget", w: { price: 5, rating: 2, stars: 0, beach: 1 } }, { label: "Luxe", w: { price: 0, rating: 4, stars: 5, beach: 3 } }, { label: "Pieds dans l'eau", w: { price: 2, rating: 2, stars: 1, beach: 5 } }],
      filters: [
        { key: "stars", type: "checks", label: "Étoiles", options: ["5", "4", "3"], get: (h) => h.stars, render: (v) => starsHtml(+v) },
        { key: "rating", type: "select", label: "Note minimum", options: [[0, "Toutes"], [8, "Très bien 8+"], [8.5, "Superbe 8,5+"], [9, "Exceptionnel 9+"]], def: "0", test: (h, v) => h.rating >= +v, chip: (v) => `Note ≥ ${v}` },
        { key: "board", type: "checks", label: "Pension", options: BOARDS, get: (h) => h.board },
        { key: "max", type: "range", label: "Prix max / nuit", min: nMin, max: nMax, step: 5, mode: "max", get: (h) => h.night, fmt: (v) => v + " DT" },
        { key: "feat", type: "musthave", label: "Équipements", options: FEATS, get: (h) => h.feats }
      ],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix", (a, b) => a.night - b.night, "tag"], ["rating", "Note", (a, b) => b.rating - a.rating, "star"], ["stars", "Étoiles", (a, b) => b.stars - a.stars || a.night - b.night, "crown"]],
      ribbons: (h) => `<span class="ribbon r-info">${esc(h.board)}</span>` + (h.rating >= 9 ? `<span class="ribbon r-ok">${icon("star")}Exceptionnel</span>` : ""),
      media: (h) => `<div class="img" style="background:${h.color};filter:hue-rotate(${h.hue}deg)"><svg viewBox="0 0 200 120" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;opacity:.35" aria-hidden="true"><circle cx="150" cy="35" r="18" fill="#fff"/><path d="M0 85 Q25 75 50 85 T100 85 T150 85 T200 85 V120 H0Z" fill="#fff"/><path d="M0 98 Q25 90 50 98 T100 98 T150 98 T200 98 V120 H0Z" fill="#fff" opacity=".6"/><path d="M40 85 C40 60 44 45 48 35 M48 35 C38 30 30 34 26 40 M48 35 C56 28 66 30 70 36 M48 35 C46 26 50 20 56 18" stroke="#fff" stroke-width="3" fill="none"/></svg><span>${esc(h.type)}</span></div>`,
      card: (h) => `<div class="head"><div><h3>${esc(h.name)}</h3><small>${starsHtml(h.stars)} · ${esc(city.name)} · ${beachTxt(h)}</small></div></div>
        <div class="meters">${meter("Note clients", (h.rating - 6) * 25, h.rating + "/10")}</div>${feats(h.feats)}<small class="muted" style="display:block;margin-top:8px">${nf.format(h.reviews)} avis vérifiés</small>`,
      details: (h) => `<table><tr><td>${nights} nuits × ${ad} adulte${ad > 1 ? "s" : ""} × ${tnd(h.night)}</td><td>${tnd(h.night * nights * ad)}</td></tr><tr><td>Pension</td><td>${esc(h.board)}</td></tr><tr class="total"><td>Total séjour estimé</td><td>${tnd(h.night * nights * ad)}</td></tr></table>`,
      side: (h) => `<div><div class="price-sub">dès</div><div class="price-big">${nf.format(h.night)}<sup>DT</sup></div><div class="price-sub">/ nuit / pers.<br><b>${tnd(h.night * nights * ad)}</b> le séjour</div></div>`,
      cta: "Disponibilités", url: () => booking, fav: (h) => ({ title: h.name, sub: `${city.name} · ${h.stars} étoiles · ${h.board}`, price: tnd(h.night) + "/nuit" }),
      label: (h) => h.name, sublabel: (h) => `${h.stars} étoiles · ${h.type}`,
      compare: [
        { g: "Prix" }, ["Prix / nuit / pers.", (h) => ({ n: h.night, t: tnd(h.night) }), "min"], ["Total séjour", (h) => ({ n: h.night * nights * ad, t: tnd(h.night * nights * ad) }), "min"],
        { g: "Qualité" }, ["Note clients", (h) => ({ n: h.rating, t: h.rating + "/10" }), "max"], ["Nombre d'avis", (h) => ({ n: h.reviews, t: nf.format(h.reviews) }), "max"], ["Étoiles", (h) => ({ n: h.stars, t: starsHtml(h.stars) }), "max", false], ["Pension", (h) => h.board],
        ["Plage", (h) => ({ n: h.beach, t: beachTxt(h) }), "min", false],
        { g: "Équipements" }, ...FEATS.map((f) => [f, (h) => yes(h.feats.includes(f)), "max", false])
      ],
      after: () => $("#hs").addEventListener("submit", (e) => { e.preventDefault(); go("hotels", Object.fromEntries(new FormData(e.target).entries())); })
    }, params, path);
  }

  /* =========================================================
     ASSURANCE AUTO
     ========================================================= */
  const INS_FORM = { rc: "Responsabilité civile", tp: "Tiers + vol / incendie", tr: "Tous risques" };
  const INS_GUAR = ["Resp. civile", "Défense & recours", "Incendie", "Vol", "Bris de glace", "Dommages collision", "Tous dommages", "Assistance 0 km"];
  function insQuotes(q) {
    const rc = (250 + q.cv * 38) * (q.age < 25 ? 1.35 : q.age < 30 ? 1.12 : q.age > 70 ? 1.15 : 1) * (q.lic < 2 ? 1.25 : q.lic < 5 ? 1.08 : 1) * (["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax"].includes(q.gov) ? 1.1 : 1);
    const basePrem = q.f === "rc" ? rc : q.f === "tp" ? rc + q.val * 0.011 * (q.vage > 10 ? 0.7 : 1) : rc + q.val * 0.034 * (q.vage > 8 ? 0.8 : 1);
    return D.insurers.map((ins, i) => {
      const r = rng(hashStr(ins.p + q.cv + q.val + q.f + q.age + q.gov));
      const on = new Set(["Resp. civile", "Défense & recours"]);
      if (q.f !== "rc") { on.add("Incendie"); on.add("Vol"); }
      if (q.f === "tr") { on.add("Dommages collision"); on.add("Tous dommages"); on.add("Bris de glace"); }
      if (ins.f >= 1.04 || ins.feats.some((f) => f.includes("Bris"))) on.add("Bris de glace");
      if (ins.feats.some((f) => f.includes("24/7"))) on.add("Assistance 0 km");
      return { id: "ins" + i, p: ins.p, name: INS_FORM[q.f], price: Math.round(basePrem * ins.f * (0.96 + r() * 0.08)), rating: ins.rating, claims: parseInt(ins.claims), feats: ins.feats, on };
    });
  }
  function insurancePage(params, path) {
    document.title = "Comparateur assurance auto Tunisie — devis estimatif | Qarin.tn";
    const q = {
      cv: clamp(+params.get("cv") || 6, 4, 20), val: clamp(+params.get("val") || 45000, 5000, 500000), f: ["rc", "tp", "tr"].includes(params.get("f")) ? params.get("f") : "tp",
      age: clamp(+params.get("age") || 35, 18, 90), lic: clamp(params.has("lic") ? +params.get("lic") : 10, 0, 70), vage: clamp(+params.get("vage") || 3, 0, 40), gov: D.governorates.includes(params.get("gov")) ? params.get("gov") : "Tunis"
    };
    const FORM = INS_FORM, GUAR = INS_GUAR, items = insQuotes(q);
    const form = `<form class="page-search form-grid" id="is">
      <div class="field"><label>Puissance fiscale</label><select name="cv">${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((n) => opt(n, n + " CV", q.cv)).join("")}</select></div>
      <div class="field"><label>Valeur véhicule (DT)</label><input type="number" name="val" value="${q.val}" min="5000" step="1000"></div>
      <div class="field"><label>Âge du véhicule</label><select name="vage">${[0, 1, 2, 3, 5, 8, 10, 15].map((n) => opt(n, n ? n + " ans" : "Neuf", q.vage)).join("")}</select></div>
      <div class="field"><label>Âge conducteur</label><input type="number" name="age" value="${q.age}" min="18" max="90"></div>
      <div class="field"><label>Années de permis</label><input type="number" name="lic" value="${q.lic}" min="0" max="70"></div>
      <div class="field"><label>Gouvernorat</label><select name="gov">${D.governorates.map((g) => opt(g, g, q.gov)).join("")}</select></div>
      <div class="field"><label>Formule</label><select name="f">${Object.entries(FORM).map(([k, v]) => opt(k, v, q.f)).join("")}</select></div>
      <button class="btn btn-primary">${icon("calc")}Recalculer</button></form>`;
    const pMax = Math.max(...items.map((o) => o.price)), pMin = Math.min(...items.map((o) => o.price));
    listPage({
      key: "assurance", icon: "shield", title: "Assurance auto", crumb: "Assurance auto", cmpTitle: "assurance auto",
      sub: `${FORM[q.f]} · ${q.cv} CV · véhicule de ${nf.format(q.val)} DT · conducteur ${q.age} ans`,
      searchForm: form, items, countText: (n) => `${n} assureurs <small>· économie possible jusqu'à <b style="color:var(--ok)">${tnd(pMax - pMin)}</b>/an</small>`,
      price: (o) => o.price, costLabel: "par an",
      perf: { label: "Le plus couvrant", icon: "shield", get: (o) => o.on.size + o.rating / 10, text: (o) => `${o.on.size} garanties sur ${GUAR.length} · ${o.rating}/5` },
      label: (o) => o.p, sublabel: (o) => o.name,
      criteria: [{ k: "price", label: "Prix", get: (o) => o.price, better: "min", def: 4 }, { k: "rating", label: "Satisfaction clients", get: (o) => o.rating, better: "max", def: 3 }, { k: "guar", label: "Garanties", get: (o) => o.on.size, better: "max", def: 3 }, { k: "claims", label: "Rapidité d'indemnisation", get: (o) => o.claims, better: "min", def: 2 }],
      presets: [{ label: "Équilibré", w: { price: 4, rating: 3, guar: 3, claims: 2 } }, { label: "Prix avant tout", w: { price: 5, rating: 1, guar: 1, claims: 0 } }, { label: "Protection maximale", w: { price: 1, rating: 3, guar: 5, claims: 3 } }, { label: "Service client", w: { price: 2, rating: 5, guar: 2, claims: 5 } }],
      filters: [
        { key: "rating", type: "select", label: "Satisfaction minimum", options: [[0, "Toutes"], [4, "4/5 et plus"], [4.2, "4,2/5 et plus"]], def: "0", test: (o, v) => o.rating >= +v, chip: (v) => `Satisfaction ≥ ${v}` },
        { key: "glass", type: "toggle", label: "Bris de glace inclus", test: (o) => o.on.has("Bris de glace") },
        { key: "assist", type: "toggle", label: "Assistance 24/7", test: (o) => o.on.has("Assistance 0 km") },
        { key: "max", type: "range", label: "Prime max", min: Math.floor(pMin / 50) * 50, max: Math.ceil(pMax / 50) * 50, step: 10, mode: "max", get: (o) => o.price, fmt: (v) => v + " DT" },
        { key: "ins", type: "checks", label: "Assureurs", options: D.insurers.map((i) => i.p), get: (o) => o.p }
      ],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix", (a, b) => a.price - b.price, "tag"], ["rating", "Satisfaction", (a, b) => b.rating - a.rating, "star"]],
      card: (o) => `<div class="head">${badge(o.p)}<div><h3>${esc(o.p)}</h3><small>${esc(o.name)} · indemnisation ~${o.claims} j</small></div></div>
        <div class="meters">${meter("Satisfaction", (o.rating / 5) * 100, o.rating.toFixed(1) + " / 5")}${meter("Garanties", (o.on.size / GUAR.length) * 100, o.on.size + " / " + GUAR.length)}</div>
        <div class="ins-guar">${GUAR.map((g) => `<span class="${o.on.has(g) ? "on" : ""}">${icon(o.on.has(g) ? "check" : "x")}${g}</span>`).join("")}</div>${feats(o.feats)}`,
      details: (o) => `<table><tr><td>Prime annuelle estimée</td><td>${tnd(o.price)}</td></tr><tr><td>Paiement mensuel équivalent</td><td>${tnd(o.price / 12)}</td></tr><tr><td>Écart avec l'offre la moins chère</td><td>${o.price === pMin ? "—" : "+" + tnd(o.price - pMin)}</td></tr><tr class="total"><td>Sur 3 ans</td><td>${tnd(o.price * 3)}</td></tr></table>`,
      side: (o) => `<div><div class="price-big">${nf.format(o.price)}<sup>DT/an</sup></div><div class="price-sub">soit <b>${tnd(o.price / 12)}</b> / mois</div></div>`,
      note: "<b>Estimation indicative, non fournie par les assureurs.</b> Qarin.tn n'est pas intermédiaire d'assurance : la prime réelle est établie uniquement par l'assureur ou un intermédiaire agréé.",
      cta: "Site de l'assureur", url: (o) => purl(o.p), fav: (o) => ({ title: o.p, sub: o.name, price: tnd(o.price) + "/an" }),
      compare: [
        { g: "Prix" }, ["Prime annuelle", (o) => ({ n: o.price, t: tnd(o.price) }), "min"], ["Par mois", (o) => ({ n: o.price, t: tnd(o.price / 12) }), "min", false],
        { g: "Service" }, ["Satisfaction", (o) => ({ n: o.rating, t: o.rating.toFixed(1) + " / 5" }), "max"], ["Délai d'indemnisation", (o) => ({ n: o.claims, t: o.claims + " jours" }), "min"],
        { g: "Garanties" }, ...GUAR.map((g) => [g, (o) => yes(o.on.has(g)), "max", false]),
        { g: "Plus" }, ["Avantages", (o) => o.feats.join(" · ")]
      ],
      after: () => $("#is").addEventListener("submit", (e) => { e.preventDefault(); go("assurance-auto", Object.fromEntries(new FormData(e.target).entries())); })
    }, params, path);
  }

  /* =========================================================
     LOCATION VOITURE
     ========================================================= */
  function genCars(spot, start, end, young) {
    const days = daysBetween(start, end);
    const season = [0.8, 0.8, 0.9, 1, 1.05, 1.25, 1.5, 1.55, 1.15, 1, 0.85, 1.1][new Date(start + "T00:00:00").getMonth()];
    const items = [];
    D.carCats.forEach((c) => D.rentals.forEach((a) => {
      const r = rng(hashStr(c.id + a.p + spot + start));
      if (r() < 0.22) return;
      const day = Math.round(c.base * a.f * season * (0.9 + r() * 0.25) * (days >= 7 ? 0.88 : days >= 3 ? 0.95 : 1) + (young ? 15 : 0));
      items.push({ id: c.id + "-" + a.p.toLowerCase(), p: a.p, name: c.name, cat: c, day, total: day * days, feats: a.feats, franchise: a.franchise, cancel: a.feats.includes("Annulation gratuite"), auto: c.id === "lux" || c.id === "suv" ? r() < 0.7 : r() < 0.25 });
    }));
    return { items, days };
  }
  function carPage(params, path) {
    document.title = "Location de voiture en Tunisie — comparez les loueurs | Qarin.tn";
    const spot = D.rentalSpots.includes(params.get("spot")) ? params.get("spot") : D.rentalSpots[0];
    const start = validDate(params.get("start")) && params.get("start") >= inDays(0) ? params.get("start") : inDays(14);
    const end = validDate(params.get("end")) && params.get("end") > start ? params.get("end") : addDays(start, 7);
    const young = params.get("young") === "1";
    const { items, days } = genCars(spot, start, end, young);
    const dMax = Math.ceil(Math.max(...items.map((o) => o.day)) / 10) * 10, dMin = Math.floor(Math.min(...items.map((o) => o.day)) / 10) * 10;
    const form = `<form class="page-search form-grid" id="cs">
      <div class="field"><label>Lieu de prise</label><select name="spot">${D.rentalSpots.map((s) => opt(s, s, spot)).join("")}</select></div>
      <div class="field"><label>Prise</label><input type="date" name="start" value="${start}" min="${inDays(0)}"></div>
      <div class="field"><label>Retour</label><input type="date" name="end" value="${end}" min="${inDays(1)}"></div>
      <div class="field"><label>Conducteur</label><select name="young">${opt("0", "25 ans et plus", young ? "1" : "0")}${opt("1", "Moins de 25 ans", young ? "1" : "0")}</select></div>
      <button class="btn btn-primary">${icon("search")}Rechercher</button></form>`;
    listPage({
      key: "voiture", icon: "key", title: "Location de voiture", crumb: "Location voiture", cmpTitle: "location de voiture", unit: "véhicules",
      sub: `${esc(spot)} · ${frDate(start)} → ${frDate(end)} · ${days} jour${days > 1 ? "s" : ""}`,
      searchForm: form, items, price: (o) => o.day, cost: (o) => o.total, costLabel: "sur la location",
      perf: { label: "Le plus spacieux", icon: "users", get: (o) => o.cat.seats * 10 + o.cat.bags, text: (o) => `${o.cat.seats} places · ${o.cat.bags} bagages` },
      label: (o) => `${o.name} · ${o.p}`, sublabel: (o) => o.cat.ex,
      criteria: [{ k: "price", label: "Prix", get: (o) => o.day, better: "min", def: 4 }, { k: "fr", label: "Franchise basse", get: (o) => o.franchise, better: "min", def: 2 }, { k: "flex", label: "Annulation gratuite", get: (o) => (o.cancel ? 1 : 0), better: "max", def: 2 }, { k: "space", label: "Espace", get: (o) => o.cat.seats + o.cat.bags, better: "max", def: 1 }],
      presets: [{ label: "Équilibré", w: { price: 4, fr: 2, flex: 2, space: 1 } }, { label: "Le moins cher", w: { price: 5, fr: 0, flex: 0, space: 0 } }, { label: "Famille", w: { price: 2, fr: 2, flex: 2, space: 5 } }, { label: "Sérénité", w: { price: 2, fr: 5, flex: 4, space: 1 } }],
      filters: [
        { key: "cat", type: "checks", label: "Catégorie", options: D.carCats.map((c) => c.name), get: (o) => o.name },
        { key: "auto", type: "toggle", label: "Boîte automatique", test: (o) => o.auto },
        { key: "cancel", type: "toggle", label: "Annulation gratuite", test: (o) => o.cancel },
        { key: "max", type: "range", label: "Prix max / jour", min: dMin, max: dMax, step: 5, mode: "max", get: (o) => o.day, fmt: (v) => v + " DT" },
        { key: "ag", type: "checks", label: "Loueurs", options: D.rentals.map((a) => a.p), get: (o) => o.p }
      ],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix", (a, b) => a.day - b.day, "tag"], ["fr", "Franchise", (a, b) => a.franchise - b.franchise || a.day - b.day, "shield"]],
      ribbons: (o) => `<span class="ribbon r-info">${o.auto ? "Automatique" : "Manuelle"}</span>` + (o.cancel ? `<span class="ribbon r-ok">${icon("check")}Annulation gratuite</span>` : ""),
      card: (o) => `<div class="head">${badge(o.p)}<div><h3>${esc(o.name)} <small style="font-weight:600">ou similaire</small></h3><small>${esc(o.cat.ex)} · ${esc(o.p)}</small></div></div>
        <div class="specs">${spec("Places", o.cat.seats)}${spec("Bagages", o.cat.bags)}${spec("Franchise", tnd(o.franchise))}${spec("Clim", "Oui")}</div>${feats(o.feats)}`,
      details: (o) => `<table><tr><td>${days} jour${days > 1 ? "s" : ""} × ${tnd(o.day)}</td><td>${tnd(o.total)}</td></tr>${young ? `<tr><td>Dont supplément jeune conducteur</td><td>${tnd(15 * days)}</td></tr>` : ""}<tr><td>Franchise (dépôt)</td><td>${tnd(o.franchise)}</td></tr><tr class="total"><td>Total location</td><td>${tnd(o.total)}</td></tr></table>`,
      side: (o) => `<div><div class="price-big">${nf.format(o.day)}<sup>DT/jour</sup></div><div class="price-sub"><b>${tnd(o.total)}</b> pour ${days} jour${days > 1 ? "s" : ""}</div></div>`,
      cta: "Réserver", url: (o) => purl(o.p), fav: (o) => ({ title: `${o.name} · ${o.p}`, sub: `${spot} · ${days} j`, price: tnd(o.day) + "/jour" }),
      compare: [
        { g: "Prix" }, ["Prix / jour", (o) => ({ n: o.day, t: tnd(o.day) }), "min"], ["Total location", (o) => ({ n: o.total, t: tnd(o.total) }), "min"], ["Franchise", (o) => ({ n: o.franchise, t: tnd(o.franchise) }), "min"],
        { g: "Véhicule" }, ["Exemples", (o) => o.cat.ex], ["Places", (o) => ({ n: o.cat.seats, t: o.cat.seats }), "max", false], ["Bagages", (o) => ({ n: o.cat.bags, t: o.cat.bags }), "max", false], ["Boîte", (o) => (o.auto ? "Automatique" : "Manuelle")],
        { g: "Conditions" }, ["Annulation gratuite", (o) => yes(o.cancel), "max", false], ["Inclus", (o) => o.feats.join(" · ")]
      ],
      after: () => $("#cs").addEventListener("submit", (e) => { e.preventDefault(); go("location-voiture", Object.fromEntries(new FormData(e.target).entries())); })
    }, params, path);
  }

  /* =========================================================
     TRANSFERT D'ARGENT (Europe -> Tunisie)
     ========================================================= */
  const MODES = { compte: "Sur compte bancaire", especes: "Retrait en espèces", poste: "Bureau de poste" };
  const COUNTRIES = ["France", "Allemagne", "Italie", "Belgique", "Pays-Bas", "Espagne"];
  const f2 = (n) => n.toFixed(2).replace(".", ",");
  const f3 = (n) => n.toFixed(3).replace(".", ",");
  function transferQuotes(amount, mode) {
    const mid = D.meta.eurTnd;
    return D.transfer.filter((t) => t.modes.includes(mode)).map((t, i) => {
      const fee = Math.round(t.fee(amount) * 100) / 100, rate = mid * (1 - t.margin), recv = Math.max(0, (amount - fee) * rate);
      return { id: "tr" + i, p: t.p, name: t.p, fee, rate, recv, cost: amount * mid - recv, margin: t.margin, speed: t.speed, speedH: t.speedH, feats: t.feats };
    });
  }
  function transferPage(params, path) {
    document.title = "Transfert d'argent vers la Tunisie — comparez frais et taux | Qarin.tn";
    const amount = clamp(+params.get("amount") || 500, 20, 20000);
    const mode = MODES[params.get("mode")] ? params.get("mode") : "compte";
    const from = COUNTRIES.includes(params.get("from")) ? params.get("from") : "France";
    const items = transferQuotes(amount, mode);
    const best = Math.max(...items.map((t) => t.recv)), worst = Math.min(...items.map((t) => t.recv));
    const form = `<form class="page-search form-grid" id="ts">
      <div class="field"><label>Vous envoyez (€)</label><input type="number" name="amount" value="${amount}" min="20" max="20000" step="10"></div>
      <div class="field"><label>Depuis</label><select name="from">${COUNTRIES.map((c) => opt(c, c, from)).join("")}</select></div>
      <div class="field"><label>Réception en Tunisie</label><select name="mode">${Object.entries(MODES).map(([k, v]) => opt(k, v, mode)).join("")}</select></div>
      <button class="btn btn-primary">${icon("search")}Comparer</button></form>`;
    listPage({
      key: "transfert", icon: "send", title: "Transfert d'argent vers la Tunisie", crumb: "Transfert d'argent", cmpTitle: "transfert d'argent", unit: "services",
      sub: `${nf.format(amount)} € depuis ${esc(from)} · ${MODES[mode].toLowerCase()} · référence 1 € = ${f3(D.meta.eurTnd)} DT`,
      searchForm: form, items, cheapLabel: "Le plus reçu",
      countText: (n) => `${n} services <small>· jusqu'à <b style="color:var(--ok)">${tnd(best - worst)}</b> reçus en plus selon le service</small>`,
      note: "<b>Frais et taux de démonstration.</b> Les frais et le taux réels sont affichés par le service au moment de l'envoi. Comparez toujours le <b>montant reçu</b>, pas seulement les frais.",
      price: (t) => t.cost, costLabel: "perdus en frais et change",
      perf: { label: "Le plus rapide", icon: "zap", get: (t) => -t.speedH, text: (t) => t.speed },
      criteria: [{ k: "recv", label: "Montant reçu", get: (t) => t.recv, better: "max", def: 5 }, { k: "speed", label: "Rapidité", get: (t) => Math.log(t.speedH + 0.1), better: "min", def: 2 }, { k: "fee", label: "Frais fixes bas", get: (t) => t.fee, better: "min", def: 1 }],
      presets: [{ label: "Maximum reçu", w: { recv: 5, speed: 1, fee: 1 } }, { label: "Urgent", w: { recv: 2, speed: 5, fee: 1 } }],
      filters: [
        { key: "fast", type: "toggle", label: "Disponible en moins d'1 h", test: (t) => t.speedH < 1 },
        { key: "nofee", type: "toggle", label: "Sans frais fixes", test: (t) => t.fee === 0 },
        { key: "prov", type: "checks", label: "Services", options: items.map((t) => t.p), get: (t) => t.p }
      ],
      sorts: [["score", "Pour vous", null, "sparkles"], ["recv", "Montant reçu", (a, b) => b.recv - a.recv, "wallet"], ["speed", "Rapidité", (a, b) => a.speedH - b.speedH, "zap"]],
      ribbons: (t) => (t.speedH < 1 ? `<span class="ribbon r-info">${icon("zap")}Express</span>` : "") + (t.margin === 0 ? `<span class="ribbon r-ok">${icon("check")}Sans marge de change</span>` : ""),
      card: (t) => `<div class="head">${badge(t.p)}<div><h3>${esc(t.p)}</h3><small>${esc(t.speed)} · ${MODES[mode]}</small></div></div>
        <div class="meters">${meter("Reçu", 60 + ((t.recv - worst) / (best - worst || 1)) * 40, tnd(t.recv))}</div>
        <div class="specs">${spec("Frais", f2(t.fee) + " €")}${spec("Taux appliqué", f3(t.rate))}${spec("Marge de change", f2(t.margin * 100) + " %")}${spec("Coût réel", tnd(t.cost))}</div>${feats(t.feats)}`,
      details: (t) => `<table><tr><td>Montant envoyé</td><td>${nf.format(amount)} €</td></tr><tr><td>Frais d'envoi</td><td>− ${f2(t.fee)} €</td></tr><tr><td>Montant converti</td><td>${f2(amount - t.fee)} €</td></tr><tr><td>Taux appliqué (référence ${f3(D.meta.eurTnd)})</td><td>${f3(t.rate)}</td></tr><tr class="total"><td>Montant reçu</td><td>${tnd(t.recv)}</td></tr><tr><td>Coût total (frais + change)</td><td>${tnd(t.cost)} ≈ ${f2(t.cost / D.meta.eurTnd)} €</td></tr></table>`,
      side: (t) => `<div><div class="price-sub">Montant reçu</div><div class="price-big">${nf.format(Math.round(t.recv))}<sup>DT</sup></div><div class="price-sub">coût réel <b>${tnd(t.cost)}</b></div></div>`,
      cta: "Site du service", url: (t) => purl(t.p), fav: (t) => ({ title: t.p, sub: `${amount} € · ${MODES[mode]}`, price: tnd(t.recv) + " reçus" }),
      compare: [
        { g: "Montants" }, ["Montant reçu", (t) => ({ n: Math.round(t.recv), t: tnd(t.recv) }), "max"], ["Frais d'envoi", (t) => ({ n: t.fee, t: f2(t.fee) + " €" }), "min"],
        ["Taux appliqué", (t) => ({ n: t.rate, t: f3(t.rate) }), "max", false], ["Coût réel", (t) => ({ n: Math.round(t.cost), t: tnd(t.cost) }), "min"],
        { g: "Service" }, ["Délai", (t) => ({ n: t.speedH, t: t.speed }), "min", false], ["Réception", () => MODES[mode]], ["Points forts", (t) => t.feats.join(" · ")]
      ],
      after: () => $("#ts").addEventListener("submit", (e) => { e.preventDefault(); go("transfert", Object.fromEntries(new FormData(e.target).entries())); })
    }, params, path);
  }

  /* =========================================================
     FERRY (Europe <-> Tunis La Goulette)
     ========================================================= */
  const VEH = { none: "Sans véhicule", car: "Voiture", van: "Van / 4x4", moto: "Moto" };
  const CAB = { seat: "Fauteuil", inside: "Cabine intérieure", outside: "Cabine extérieure" };
  function genFerries(rid, date, ad, ch, veh, cab) {
    const R = D.ferryRoutes.find((r) => r.id === rid) || D.ferryRoutes[0];
    const season = [0.85, 0.85, 0.9, 1, 1.05, 1.35, 1.7, 1.75, 1.2, 0.95, 0.9, 1.25][new Date(date + "T00:00:00").getMonth()];
    return R.ops.map((op, i) => {
      const r = rng(hashStr(op + rid + date)), o = D.ferryOps[op];
      const pax = R.base * (ad + ch * 0.5);
      const vehC = ({ none: 0, car: 420, van: 620, moto: 180 }[veh] || 0) * (R.h / 22);
      const cabC = ({ seat: 0, inside: 160, outside: 230 }[cab] || 0) * (ad + ch) * (R.h > 12 ? 1 : 0.6);
      return { id: "fe" + i, p: op, name: op, route: R, dep: [10, 12, 15, 17, 19, 20][Math.floor(r() * 6)] * 60, hours: R.h + (r() < 0.5 ? 0 : 1) + (i ? 1 : 0), price: Math.round((pax + vehC + cabC) * season * o.f * (0.9 + r() * 0.2)), rating: o.rating, feats: o.feats };
    });
  }
  function ferryPage(params, path) {
    const R = D.ferryRoutes.find((r) => r.id === params.get("route")) || D.ferryRoutes[0];
    const date = validDate(params.get("date")) && params.get("date") >= inDays(0) ? params.get("date") : inDays(30);
    const ret = validDate(params.get("ret")) && params.get("ret") > date ? params.get("ret") : "";
    const ad = clamp(+params.get("ad") || 2, 1, 9), ch = clamp(params.has("ch") ? +params.get("ch") : 0, 0, 8);
    const veh = VEH[params.get("veh")] ? params.get("veh") : "car", cab = CAB[params.get("cab")] ? params.get("cab") : "inside";
    document.title = `Ferry ${R.port} → Tunis — comparez les traversées | Qarin.tn`;
    const out = genFerries(R.id, date, ad, ch, veh, cab), back = ret ? genFerries(R.id, ret, ad, ch, veh, cab) : null;
    const items = out.map((f, i) => ({ ...f, retPrice: back ? back[i].price : 0, retDep: back ? back[i].dep : 0, total: f.price + (back ? back[i].price : 0) }));
    const people = ad + ch;
    const form = `<form class="page-search form-grid" id="fes">
      <div class="field"><label>Port de départ</label><select name="route">${D.ferryRoutes.map((r) => opt(r.id, r.port + " → Tunis", R.id)).join("")}</select></div>
      <div class="field"><label>Aller</label><input type="date" name="date" value="${date}" min="${inDays(0)}"></div>
      <div class="field"><label>Retour (option)</label><input type="date" name="ret" value="${ret}" min="${inDays(1)}"></div>
      <div class="field"><label>Adultes</label><select name="ad">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n, ad)).join("")}</select></div>
      <div class="field"><label>Enfants</label><select name="ch">${[0, 1, 2, 3, 4].map((n) => opt(n, n, ch)).join("")}</select></div>
      <div class="field"><label>Véhicule</label><select name="veh">${Object.entries(VEH).map(([k, v]) => opt(k, v, veh)).join("")}</select></div>
      <div class="field"><label>Hébergement</label><select name="cab">${Object.entries(CAB).map(([k, v]) => opt(k, v, cab)).join("")}</select></div>
      <button class="btn btn-primary">${icon("search")}Rechercher</button></form>`;
    const row = (f, dep, a, b, lbl) => `<div class="fl-row">${badge(f.p)}<div class="fl-time"><b>${hm(dep)}</b><small>${a} · ${lbl}</small></div><div class="fl-line">${f.hours} h de traversée<div class="bar"></div><span class="direct">Direct</span></div><div class="fl-time" style="text-align:right"><b>${hm(dep + f.hours * 60)}<sup style="color:var(--accent);font-size:12px"> +${Math.floor((dep + f.hours * 60) / 1440)}</sup></b><small>${b}</small></div></div>`;
    listPage({
      key: "ferry", icon: "ship", title: `Ferry ${R.port} → Tunis`, crumb: "Ferry", cmpTitle: "ferry", unit: "traversées",
      sub: `${frDate(date, { weekday: "long", day: "numeric", month: "long" })}${ret ? " · retour " + frDate(ret, { weekday: "long", day: "numeric", month: "long" }) : " · aller simple"} · ${people} passager${people > 1 ? "s" : ""} · ${VEH[veh]} · ${CAB[cab]}`,
      searchForm: form, items,
      top: `<div class="assist"><div><b>${icon("bell")}Les prix de l'été partent vite</b><small>Créez une alerte : on vous prévient si la traversée passe sous votre prix.</small></div><button type="button" class="btn btn-brand btn-sm" data-alert>${icon("bell")}Alerte prix</button></div>`,
      note: "<b>Prix de démonstration</b> modélisés selon la saison (forte hausse en juillet-août), le véhicule et l'hébergement à bord. Horaires et tarifs réels sur le site de la compagnie.",
      price: (f) => f.total, costLabel: "sur la traversée",
      perf: { label: "La plus courte", icon: "zap", get: (f) => -f.hours, text: (f) => f.hours + " h de traversée" },
      criteria: [{ k: "price", label: "Prix", get: (f) => f.total, better: "min", def: 4 }, { k: "dur", label: "Durée", get: (f) => f.hours, better: "min", def: 2 }, { k: "rating", label: "Confort / avis", get: (f) => f.rating, better: "max", def: 2 }],
      presets: [{ label: "Équilibré", w: { price: 4, dur: 2, rating: 2 } }, { label: "Le moins cher", w: { price: 5, dur: 0, rating: 0 } }, { label: "Confort", w: { price: 1, dur: 2, rating: 5 } }],
      filters: [{ key: "op", type: "checks", label: "Compagnies", options: R.ops, get: (f) => f.p }],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix", (a, b) => a.total - b.total, "tag"], ["dur", "Durée", (a, b) => a.hours - b.hours, "clock"], ["dep", "Départ", (a, b) => a.dep - b.dep, "calendar"]],
      ribbons: () => `<span class="ribbon r-info">${icon("car")}${VEH[veh]}</span><span class="ribbon r-info">${CAB[cab]}</span>`,
      card: (f) => `${row(f, f.dep, R.port, "Tunis", "Aller")}${ret ? row(f, f.retDep, "Tunis", R.port, "Retour " + frDate(ret)) : ""}<div class="specs">${spec("Passagers", people)}${spec("Véhicule", VEH[veh])}${spec("À bord", CAB[cab])}${spec("Avis", f.rating.toFixed(1) + " / 5")}</div>${feats(f.feats)}`,
      details: (f) => `<table><tr><td>Aller · ${frDate(date)}</td><td>${tnd(f.price)}</td></tr>${ret ? `<tr><td>Retour · ${frDate(ret)}</td><td>${tnd(f.retPrice)}</td></tr>` : ""}<tr class="total"><td>Total</td><td>${tnd(f.total)} ≈ ${eur(f.total)}</td></tr><tr><td>Par passager</td><td>${tnd(f.total / people)}</td></tr></table>`,
      side: (f) => `<div><div class="price-big">${nf.format(f.total)}<sup>DT</sup></div><div class="price-sub">≈ ${eur(f.total)} · ${ret ? "aller-retour" : "aller"}<br><b>${tnd(f.total / people)}</b> / passager</div></div>`,
      cta: "Voir les traversées", url: (f) => purl(f.p), fav: (f) => ({ title: `${R.port} → Tunis · ${f.p}`, sub: `${frDate(date)} · ${VEH[veh]}`, price: tnd(f.total) }),
      compare: [
        { g: "Prix" }, ["Total", (f) => ({ n: f.total, t: tnd(f.total) }), "min"], ["Par passager", (f) => ({ n: f.total / people, t: tnd(f.total / people) }), "min"],
        { g: "Traversée" }, ["Départ", (f) => hm(f.dep)], ["Durée", (f) => ({ n: f.hours, t: f.hours + " h" }), "min"], ["Avis", (f) => ({ n: f.rating, t: f.rating.toFixed(1) + " / 5" }), "max"], ["À bord", (f) => f.feats.join(" · ")]
      ],
      after: () => {
        $("#fes").addEventListener("submit", (e) => { e.preventDefault(); const p = Object.fromEntries(new FormData(e.target).entries()); if (!p.ret) delete p.ret; go("ferry", p); });
        $("[data-alert]", app).addEventListener("click", () => addAlert({ kind: "ferry", route: R.id, date, ad, ch, veh, cab, label: `Ferry ${R.port} → Tunis · ${frDate(date)}`, now: Math.min(...out.map((f) => f.price)) }));
      }
    }, params, path);
  }

  /* =========================================================
     CRÉDIT (immobilier, auto, consommation)
     ========================================================= */
  function loanQuotes(type, amount, years) {
    const T = D.loanTypes[type], n = years * 12;
    return D.banks.map((b, i) => {
      const rate = D.meta.tmm + b.m + T.extra + (type === "immo" && b.immo ? b.immo : 0), r = rate / 100 / 12;
      const pm = (amount * r) / (1 - Math.pow(1 + r, -n)), insM = (amount * b.ins) / 12, fees = Math.max(50, amount * b.dossier);
      let bal = amount, int1 = 0; for (let k = 0; k < Math.min(12, n); k++) { const it = bal * r; int1 += it; bal -= pm - it; }
      const interest = pm * n - amount, insT = insM * n;
      return { id: "bk" + i, p: b.p, name: T.label, rate, margin: b.m, pm, insM, monthly: pm + insM, fees, interest, insT, cost: interest + insT + fees, int1, islamic: !!b.islamic, feats: b.feats };
    });
  }
  function creditPage(params, path) {
    const type = D.loanTypes[params.get("type")] ? params.get("type") : "immo", T = D.loanTypes[type];
    const amount = clamp(+params.get("amount") || T.def, 1000, 3000000), years = clamp(+params.get("years") || T.defY, 1, T.max);
    document.title = `${T.label} — comparez les banques tunisiennes | Qarin.tn`;
    const items = loanQuotes(type, amount, years);
    const pct = (n) => n.toFixed(2).replace(".", ",") + " %";
    const form = `<form class="page-search form-grid" id="crs">
      <div class="field"><label>Type de crédit</label><select name="type">${Object.entries(D.loanTypes).map(([k, v]) => opt(k, v.label, type)).join("")}</select></div>
      <div class="field"><label>Montant (DT)</label><input type="number" name="amount" value="${amount}" min="1000" step="1000"></div>
      <div class="field"><label>Durée</label><select name="years">${Array.from({ length: T.max }, (_, i) => i + 1).map((y) => opt(y, y + (y > 1 ? " ans" : " an"), years)).join("")}</select></div>
      <button class="btn btn-primary">${icon("calc")}Simuler</button></form>`;
    const mMax = Math.ceil(Math.max(...items.map((o) => o.monthly)) / 10) * 10, mMin = Math.floor(Math.min(...items.map((o) => o.monthly)) / 10) * 10;
    listPage({
      key: "credit", icon: "bank", title: T.label, crumb: "Crédit", cmpTitle: "crédit", unit: "banques",
      label: (o) => o.p, sublabel: (o) => `${T.label} · ${pct(o.rate)}`,
      sub: `${tnd(amount)} sur ${years} an${years > 1 ? "s" : ""} · taux variable indexé sur le TMM (référence ${pct(D.meta.tmm)})`,
      searchForm: form, items,
      note: "<b>Simulation non contractuelle</b> avec des marges bancaires de démonstration. Le taux réel dépend de votre dossier et est fixé par la banque. Qarin.tn n'est ni un établissement de crédit ni un intermédiaire en opérations de banque.",
      price: (o) => Math.round(o.monthly), cost: (o) => o.cost, costLabel: "de coût total du crédit",
      perf: { label: "Coût total le plus bas", icon: "trend", get: (o) => -o.cost, text: (o) => tnd(o.cost) + " d'intérêts, assurance et frais" },
      criteria: [{ k: "m", label: "Mensualité", get: (o) => o.monthly, better: "min", def: 4 }, { k: "cost", label: "Coût total", get: (o) => o.cost, better: "min", def: 4 }, { k: "fees", label: "Frais de dossier", get: (o) => o.fees, better: "min", def: 1 }],
      presets: [{ label: "Coût total minimum", w: { m: 2, cost: 5, fees: 1 } }, { label: "Mensualité la plus basse", w: { m: 5, cost: 2, fees: 0 } }],
      filters: [
        { key: "isl", type: "toggle", label: "Financement islamique uniquement", test: (o) => o.islamic },
        { key: "max", type: "range", label: "Mensualité max", min: mMin, max: mMax, step: 5, mode: "max", get: (o) => o.monthly, fmt: (v) => v + " DT" },
        { key: "bank", type: "checks", label: "Banques", options: D.banks.map((b) => b.p), get: (o) => o.p }
      ],
      sorts: [["score", "Pour vous", null, "sparkles"], ["m", "Mensualité", (a, b) => a.monthly - b.monthly, "calendar"], ["cost", "Coût total", (a, b) => a.cost - b.cost, "calc"]],
      ribbons: (o) => (o.islamic ? `<span class="ribbon r-info">Mourabaha</span>` : ""),
      card: (o) => `<div class="head">${badge(o.p)}<div><h3>${esc(o.p)}</h3><small>${esc(o.name)} · TMM + ${pct(o.margin + T.extra)}</small></div></div>
        <div class="meters">${meter("Coût / capital", (o.cost / amount) * 100, pct((o.cost / amount) * 100))}</div>
        <div class="specs">${spec("Taux", pct(o.rate))}${spec("Hors assurance", tnd(o.pm) + "/m")}${spec("Assurance", tnd(o.insM) + "/m")}${spec("Frais dossier", tnd(o.fees))}</div>${feats(o.feats)}`,
      details: (o) => `<table><tr><td>Capital emprunté</td><td>${tnd(amount)}</td></tr><tr><td>Intérêts sur ${years} an${years > 1 ? "s" : ""}</td><td>${tnd(o.interest)}</td></tr><tr><td>Assurance emprunteur</td><td>${tnd(o.insT)}</td></tr><tr><td>Frais de dossier</td><td>${tnd(o.fees)}</td></tr><tr class="total"><td>Total remboursé</td><td>${tnd(amount + o.cost)}</td></tr><tr><td>Dont intérêts la 1ʳᵉ année</td><td>${tnd(o.int1)}</td></tr></table>`,
      side: (o) => `<div><div class="price-big">${nf.format(Math.round(o.monthly))}<sup>DT/mois</sup></div><div class="price-sub">coût total <b>${tnd(o.cost)}</b></div></div>`,
      cta: "Site de la banque", url: (o) => purl(o.p), fav: (o) => ({ title: `${o.p} · ${T.label}`, sub: `${tnd(amount)} / ${years} ans`, price: tnd(o.monthly) + "/mois" }),
      compare: [
        { g: "Mensualités" }, ["Mensualité totale", (o) => ({ n: Math.round(o.monthly), t: tnd(o.monthly) }), "min"], ["Hors assurance", (o) => ({ n: Math.round(o.pm), t: tnd(o.pm) }), "min"], ["Assurance / mois", (o) => ({ n: Math.round(o.insM), t: tnd(o.insM) }), "min"],
        { g: "Coût" }, ["Taux", (o) => ({ n: o.rate, t: pct(o.rate) }), "min"], ["Intérêts", (o) => ({ n: Math.round(o.interest), t: tnd(o.interest) }), "min"], ["Frais de dossier", (o) => ({ n: Math.round(o.fees), t: tnd(o.fees) }), "min"], ["Coût total", (o) => ({ n: Math.round(o.cost), t: tnd(o.cost) }), "min"],
        { g: "Banque" }, ["Type", (o) => (o.islamic ? "Islamique (Mourabaha)" : "Conventionnel")], ["Points forts", (o) => o.feats.join(" · ")]
      ],
      after: () => $("#crs").addEventListener("submit", (e) => { e.preventDefault(); go("credit", Object.fromEntries(new FormData(e.target).entries())); })
    }, params, path);
  }

  /* =========================================================
     MULTI-DOMAINES : PACK VACANCES EN TUNISIE
     ========================================================= */
  const ORIG = [
    { id: "paris", name: "Paris", air: "CDG", port: "MRS", km: 775 }, { id: "marseille", name: "Marseille", air: "MRS", port: "MRS", km: 10 },
    { id: "lyon", name: "Lyon", air: "LYS", port: "MRS", km: 315 }, { id: "nice", name: "Nice", air: "NCE", port: "GOA", km: 195 },
    { id: "rome", name: "Rome", air: "FCO", port: "CVV", km: 80 }, { id: "francfort", name: "Francfort", air: "FRA", port: "GOA", km: 900 },
    { id: "munich", name: "Munich", air: "MUC", port: "GOA", km: 690 }, { id: "bruxelles", name: "Bruxelles", air: "BRU", port: "GOA", km: 1100 },
    { id: "geneve", name: "Genève", air: "GVA", port: "GOA", km: 400 }
  ];
  const REG = {
    hammamet: { apt: "NBE", spot: "Aéroport Enfidha", tr: 40, kmG: 75 }, sousse: { apt: "MIR", spot: "Aéroport Monastir", tr: 20, kmG: 145 },
    djerba: { apt: "DJE", spot: "Aéroport Djerba", tr: 15, kmG: 520 }, tunis: { apt: "TUN", spot: "Aéroport Tunis-Carthage", tr: 12, kmG: 15 },
    monastir: { apt: "MIR", spot: "Aéroport Monastir", tr: 8, kmG: 165 }, mahdia: { apt: "MIR", spot: "Aéroport Monastir", tr: 60, kmG: 205 },
    tozeur: { apt: "TOE", spot: "Aéroport Tozeur", tr: 10, kmG: 450 }, tabarka: { apt: "TUN", spot: "Aéroport Tunis-Carthage", tr: 175, kmG: 175 },
    kantaoui: { apt: "MIR", spot: "Aéroport Monastir", tr: 30, kmG: 140 }
  };
  const FUEL = 2.5; // DT / litre (référence)
  const C = { air: "#0a5c8a", ship: "#0e7490", hotel: "#10b981", car: "#f59e0b", fuel: "#94a3b8", taxi: "#8b5cf6", road: "#64748b", net: "#0ea5e9", mob: "#8b5cf6", ins: "#10b981" };
  const minBy = (arr, f) => arr.reduce((a, b) => (f(b) < f(a) ? b : a));
  function scenCard(s, flags, people, unit) {
    const tot = s.parts.reduce((a, p) => a + p.v, 0);
    return `<article class="scen ${flags.includes("cheap") ? "best" : ""}">
      <div class="scen-flags">${flags.includes("cheap") ? `<span class="ribbon r-best">${icon("tag")}Le moins cher</span>` : ""}${flags.includes("fast") ? `<span class="ribbon r-ok">${icon("zap")}Le plus rapide</span>` : ""}${(s.extra || []).map((x) => `<span class="ribbon r-info">${x}</span>`).join("")}</div>
      <div class="scen-ic">${s.ic.map((i) => `<span>${icon(i)}</span>`).join("")}</div>
      <h3>${esc(s.title)}</h3>
      <div class="scen-total">${tnd(tot)}<small>${unit || `≈ ${eur(tot)} · ${tnd(tot / people)} / pers.`}</small></div>
      <div class="stack" aria-hidden="true">${s.parts.map((p) => `<i style="width:${(p.v / tot) * 100}%;background:${p.c}"></i>`).join("")}</div>
      <ul class="lines">${s.parts.map((p) => `<li><span><b class="dot" style="background:${p.c}"></b>${esc(p.l)}</span><span>${tnd(p.v)}${p.href ? ` <a href="${p.href}" title="Comparer">${icon("chevR")}</a>` : ""}</span></li>`).join("")}</ul>
      ${s.meta ? `<div class="scen-meta">${s.meta}</div>` : ""}
      ${s.pros ? `<div class="pc"><div>${s.pros.map((x) => `<span class="pro">${icon("check")}${esc(x)}</span>`).join("")}</div><div>${s.cons.map((x) => `<span class="con">${icon("x")}${esc(x)}</span>`).join("")}</div></div>` : ""}
    </article>`;
  }
  function recapTable(scens, rows) {
    return `<div class="ctable-wrap" style="margin-top:20px"><table class="cmp"><thead><tr><th></th>${scens.map((s) => `<th><div class="colhead">${s.ic.map((i) => icon(i)).join(" ")}<b>${esc(s.title)}</b></div></th>`).join("")}</tr></thead><tbody>${rows.map(([l, f, better]) => {
      const vals = scens.map(f); const nums = vals.map((v) => v.n); const tgt = better === "min" ? Math.min(...nums) : Math.max(...nums);
      return `<tr><td>${esc(l)}</td>${vals.map((v) => `<td class="${better && nums.some((n) => n !== tgt) && v.n === tgt ? "win" : ""}">${v.t}</td>`).join("")}</tr>`;
    }).join("")}</tbody></table></div>`;
  }
  function packPage(params) {
    document.title = "Pack vacances en Tunisie — avion, ferry, hôtel, voiture | Qarin.tn";
    const o = ORIG.find((x) => x.id === params.get("from")) || ORIG[0];
    const city = D.cities.find((c) => c.id === params.get("dest")) || D.cities.find((c) => c.id === "djerba");
    const din = validDate(params.get("in")) && params.get("in") >= inDays(1) ? params.get("in") : inDays(45);
    const dout = validDate(params.get("out")) && params.get("out") > din ? params.get("out") : addDays(din, 14);
    const nights = daysBetween(din, dout), ad = clamp(+params.get("ad") || 2, 1, 8), ch = clamp(params.has("ch") ? +params.get("ch") : 1, 0, 6);
    const stars = [3, 4, 5].includes(+params.get("stars")) ? +params.get("stars") : 4;
    const g = REG[city.id], people = ad + ch, pax = ad + ch * 0.75;
    // hébergement
    const all = genHotels(city.id, din, nights), hs = all.filter((h) => h.stars === stars);
    const hotel = (hs.length ? hs : all).reduce((a, b) => (b.rating * 40 - b.night > a.rating * 40 - a.night ? b : a));
    const hotelCost = hotel.night * nights * (ad + ch * 0.5);
    const hotelPart = { l: `${hotel.name} · ${hotel.stars} étoiles · ${nights} nuits · ${hotel.board}`, v: hotelCost, c: C.hotel, href: `#/hotels?dest=${city.id}&in=${din}&out=${dout}&ad=${ad}` };
    // avion
    const fo = minBy(genFlights(g.apt, o.air, din, "eco"), (f) => f.price), fr = minBy(genFlights(g.apt, o.air, dout, "eco"), (f) => f.price);
    const flightCost = (fo.price + fr.price) * pax;
    const airH = fo.duration / 60 + 3 + g.tr / 60;
    const flightPart = { l: `Vols A/R ${o.name} ⇄ ${g.apt} (${fo.p})`, v: flightCost, c: C.air, href: `#/vols?from=${g.apt}&to=${o.air}&date=${din}&ret=${dout}&pax=${Math.max(1, Math.round(pax))}` };
    // voiture de location
    const cars = genCars(g.spot, din, dout, false).items, car = minBy(cars.filter((c) => c.cat.id === (people > 5 ? "van" : "compact")).concat(cars.filter((c) => c.cat.id === "suv")), (c) => c.total);
    const fuelLoc = (g.tr * 2 + 40 * nights) * 0.07 * FUEL;
    // transferts
    const taxi = 2 * (15 + g.tr * 0.9) * Math.ceil(people / 4);
    // ferry
    const R = D.ferryRoutes.find((r) => r.id === o.port), cab = R.h > 12 ? "inside" : "seat";
    const feO = minBy(genFerries(R.id, din, ad, ch, "car", cab), (f) => f.price), feR = minBy(genFerries(R.id, dout, ad, ch, "car", cab), (f) => f.price);
    const ferryCost = feO.price + feR.price, road = o.km * 2 * 0.14 * D.meta.eurTnd, fuelTn = (g.kmG * 2 + 40 * nights) * 0.07 * FUEL;
    const ferryH = o.km / 85 + R.h + 3 + g.kmG / 80;
    const hTxt = (h) => `${icon("clock")}≈ ${Math.floor(h)} h ${pad(Math.round((h % 1) * 60))} porte-à-porte (aller)`;
    const S = [
      { k: "aircar", title: "Avion + voiture de location", ic: ["plane", "key"], hours: airH, freedom: 2, parts: [flightPart, { l: `Location ${car.name} · ${nights} j (${car.p})`, v: car.total, c: C.car, href: `#/location-voiture?spot=${encodeURIComponent(g.spot)}&start=${din}&end=${dout}` }, { l: "Carburant sur place (estimé)", v: fuelLoc, c: C.fuel }, hotelPart], pros: ["Rapide", "Liberté sur place"], cons: ["Bagages limités", "Caution de location"] },
      { k: "airtaxi", title: "Avion + transferts", ic: ["plane", "car"], hours: airH, freedom: 0, parts: [flightPart, { l: `Transferts aéroport ⇄ hôtel (${g.tr} km)`, v: taxi, c: C.taxi }, hotelPart], pros: ["Le plus simple", "Aucune conduite"], cons: ["Peu mobile sur place", "Excursions en supplément"] },
      { k: "ferry", title: "Ferry avec votre voiture", ic: ["ship", "car"], hours: ferryH, freedom: 3, parts: [{ l: `Ferry A/R ${R.port} ⇄ Tunis · voiture + ${CAB[cab].toLowerCase()} (${feO.p})`, v: ferryCost, c: C.ship, href: `#/ferry?route=${R.id}&date=${din}&ret=${dout}&ad=${ad}&ch=${ch}&veh=car&cab=${cab}` }, { l: `Route ${o.name} ⇄ ${R.port} (carburant + péages)`, v: road, c: C.road }, { l: `Carburant en Tunisie (${g.kmG} km jusqu'à ${city.name} + sorties)`, v: fuelTn, c: C.fuel }, hotelPart], pros: ["Votre voiture sur place", "Bagages sans limite"], cons: ["Trajet long", "Réservation tôt l'été"] }
    ];
    S.forEach((s) => { s.total = s.parts.reduce((a, p) => a + p.v, 0); s.meta = hTxt(s.hours); });
    const cheap = minBy(S, (s) => s.total), fast = minBy(S, (s) => s.hours), dear = S.reduce((a, b) => (b.total > a.total ? b : a));
    app.innerHTML = pageHead("globe", "Pack vacances en Tunisie", "Avion, ferry, location, transferts et hôtel combinés : le vrai coût total, porte-à-porte.", "Pack vacances") + `
    <div class="container"><form class="page-search form-grid" id="pk">
      <div class="field"><label>Vous partez de</label><select name="from">${ORIG.map((x) => opt(x.id, x.name, o.id)).join("")}</select></div>
      <div class="field"><label>Destination</label><select name="dest">${D.cities.map((c) => opt(c.id, c.name, city.id)).join("")}</select></div>
      <div class="field"><label>Arrivée</label><input type="date" name="in" value="${din}" min="${inDays(1)}"></div>
      <div class="field"><label>Départ</label><input type="date" name="out" value="${dout}" min="${inDays(2)}"></div>
      <div class="field"><label>Adultes</label><select name="ad">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n, ad)).join("")}</select></div>
      <div class="field"><label>Enfants</label><select name="ch">${[0, 1, 2, 3, 4].map((n) => opt(n, n, ch)).join("")}</select></div>
      <div class="field"><label>Hôtel</label><select name="stars">${[3, 4, 5].map((n) => opt(n, n + " étoiles", stars)).join("")}</select></div>
      <button class="btn btn-primary">${icon("calc")}Comparer</button></form>
      <div style="padding:24px 0 70px">
        ${note("<b>Données de démonstration.</b> Chaque poste provient d'un comparateur du site (vols, ferry, location, hôtels) ; carburant à " + FUEL.toFixed(2).replace(".", ",") + " DT/L et route en Europe à 0,14 €/km. Cliquez sur › pour comparer chaque poste en détail.")}
        <div class="save-hero"><div>${icon("scale")}<div><small>${people} voyageur${people > 1 ? "s" : ""} · ${nights} nuits · ${o.name} → ${esc(city.name)}</small><b>${esc(cheap.title)} : ${tnd(cheap.total)}</b><span>soit ${tnd(dear.total - cheap.total)} de moins que l'option la plus chère (${esc(dear.title.toLowerCase())})</span></div></div></div>
        <div class="scen-grid">${S.map((s) => scenCard(s, [s === cheap ? "cheap" : "", s === fast ? "fast" : ""], people)).join("")}</div>
        <h2 style="margin:34px 0 4px;letter-spacing:-.5px">Récapitulatif</h2><p class="muted" style="margin:0">Meilleure valeur en vert.</p>
        ${recapTable(S, [
          ["Coût total", (s) => ({ n: Math.round(s.total), t: `<b>${tnd(s.total)}</b>` }), "min"],
          ["Par personne", (s) => ({ n: Math.round(s.total / people), t: tnd(s.total / people) }), "min"],
          ["Transport", (s) => { const v = s.parts.filter((p) => p !== hotelPart).reduce((a, p) => a + p.v, 0); return { n: Math.round(v), t: tnd(v) }; }, "min"],
          ["Hébergement", () => ({ n: 0, t: tnd(hotelCost) })],
          ["Durée porte-à-porte (aller)", (s) => ({ n: Math.round(s.hours * 10), t: `${Math.floor(s.hours)} h ${pad(Math.round((s.hours % 1) * 60))}` }), "min"],
          ["Voiture sur place", (s) => ({ n: s.freedom, t: s.freedom >= 2 ? "Oui" : "Non" }), "max"],
          ["Bagages", (s) => ({ n: s.k === "ferry" ? 2 : 1, t: s.k === "ferry" ? "Sans limite" : "Selon billet" }), "max"]
        ])}
      </div></div>`;
    $("#pk").addEventListener("submit", (e) => { e.preventDefault(); go("pack-voyage", Object.fromEntries(new FormData(e.target).entries())); });
  }

  /* =========================================================
     MULTI-DOMAINES : BUDGET FOYER (Internet + mobiles + assurance auto)
     ========================================================= */
  function budgetPage(params) {
    document.title = "Budget foyer — Internet, mobiles et assurance auto au meilleur prix | Qarin.tn";
    const n = (k, d, a, b) => clamp(params.has(k) && params.get(k) !== "" ? +params.get(k) : d, a, b);
    const q = {
      gov: D.governorates.includes(params.get("gov")) ? params.get("gov") : "Tunis", pers: n("pers", 4, 1, 10), use: ["web", "stream", "intense"].includes(params.get("use")) ? params.get("use") : "stream",
      lines: n("lines", 2, 0, 6), data: n("data", 15, 1, 200), car: params.get("car") !== "0", cv: n("cv", 6, 4, 15), val: n("val", 45000, 5000, 500000), f: ["rc", "tp", "tr"].includes(params.get("f")) ? params.get("f") : "tp",
      curNet: params.get("curNet") || "", curMob: params.get("curMob") || "", curIns: params.get("curIns") || ""
    };
    const per = { web: 4, stream: 10, intense: 22 }[q.use], need = Math.round(per * q.pers * (q.pers > 1 ? 0.75 : 1) + 5);
    const avail = (o) => (o.tech === "Fibre" ? D.fiberGov.includes(q.gov) : o.tech === "5G Box" ? D.g5Gov.includes(q.gov) : true);
    const netM = (o) => o.price + o.setup / 24;
    const pickNet = (list) => { const ok = list.filter((o) => avail(o) && o.down >= need); return ok.length ? minBy(ok, netM) : list.filter(avail).reduce((a, b) => (b.down > a.down ? b : a), list.filter(avail)[0]); };
    const pickMob = (list) => { const ok = list.filter((o) => o.data >= q.data && o.min !== "—"); return ok.length ? minBy(ok, (o) => o.price) : list.filter((o) => o.min !== "—").reduce((a, b) => (b.data > a.data ? b : a)); };
    const ins = q.car ? minBy(insQuotes({ cv: q.cv, val: q.val, f: q.f, age: 35, lic: 10, vage: 3, gov: q.gov }), (o) => o.price) : null;
    const build = (title, ic, net, mob, extra) => {
      const parts = [];
      if (net) parts.push({ l: `Internet · ${net.name} (${net.p})`, v: netM(net) * 12, c: C.net, href: `#/internet?gov=${encodeURIComponent(q.gov)}&min=${[0, 10, 30, 50, 100, 300, 500].filter((x) => x <= need).pop()}` });
      if (mob && q.lines) parts.push({ l: `${q.lines} ligne${q.lines > 1 ? "s" : ""} · ${mob.name} (${mob.p})`, v: mob.price * q.lines * 12, c: C.mob, href: `#/mobile?data=${[0, 10, 30, 50, 100].filter((x) => x <= q.data).pop()}` });
      if (ins) parts.push({ l: `Assurance auto · ${ins.p} (${INS_FORM[q.f].toLowerCase()})`, v: ins.price, c: C.ins, href: `#/assurance-auto?cv=${q.cv}&val=${q.val}&f=${q.f}&gov=${encodeURIComponent(q.gov)}` });
      return { title, ic, parts, total: parts.reduce((a, p) => a + p.v, 0), extra };
    };
    const S = [build("Meilleure combinaison", ["sparkles"], pickNet(D.internet), pickMob(D.mobile), ["Multi-fournisseurs"])];
    ["Ooredoo", "Orange", "Tunisie Telecom"].forEach((op) => {
      const nets = D.internet.filter((o) => o.p === op && avail(o)), mobs = D.mobile.filter((o) => o.p === op);
      if (nets.length && mobs.length) S.push(build("Tout chez " + op, ["home"], pickNet(nets), pickMob(mobs), ["Un seul opérateur"]));
    });
    const cheap = minBy(S, (s) => s.total);
    const hasCur = q.curNet !== "" || q.curMob !== "" || q.curIns !== "";
    const cur = (+q.curNet || 0) * 12 + (+q.curMob || 0) * 12 + (+q.curIns || 0);
    const yn = (v) => opt("1", "Oui", v ? "1" : "0") + opt("0", "Non", v ? "1" : "0");
    app.innerHTML = pageHead("home", "Budget foyer", "Internet + forfaits mobiles + assurance auto : trouvez la combinaison la moins chère pour tout le foyer.", "Budget foyer") + `
    <div class="container"><form class="page-search" id="bf">
      <div class="bf-sec"><b>${icon("users")}Votre foyer</b><div class="form-grid">
        <div class="field"><label>Gouvernorat</label><select name="gov">${D.governorates.map((x) => opt(x, x, q.gov)).join("")}</select></div>
        <div class="field"><label>Personnes</label><select name="pers">${[1, 2, 3, 4, 5, 6, 7, 8].map((x) => opt(x, x, q.pers)).join("")}</select></div>
        <div class="field"><label>Usage Internet</label><select name="use">${opt("web", "Web & réseaux sociaux", q.use)}${opt("stream", "Streaming HD, visio", q.use)}${opt("intense", "4K, jeux, télétravail", q.use)}</select></div>
        <div class="field"><label>Lignes mobiles</label><select name="lines">${[0, 1, 2, 3, 4, 5, 6].map((x) => opt(x, x, q.lines)).join("")}</select></div>
        <div class="field"><label>Data / ligne</label><select name="data">${[5, 15, 40, 100].map((x) => opt(x, x + " Go", q.data)).join("")}</select></div>
      </div></div>
      <div class="bf-sec"><b>${icon("car")}Votre voiture</b><div class="form-grid">
        <div class="field"><label>Voiture à assurer</label><select name="car">${yn(q.car)}</select></div>
        <div class="field"><label>Puissance</label><select name="cv">${[4, 5, 6, 7, 8, 9, 10, 11, 12].map((x) => opt(x, x + " CV", q.cv)).join("")}</select></div>
        <div class="field"><label>Valeur (DT)</label><input type="number" name="val" value="${q.val}" min="5000" step="1000"></div>
        <div class="field"><label>Formule</label><select name="f">${Object.entries(INS_FORM).map(([k, v]) => opt(k, v, q.f)).join("")}</select></div>
      </div></div>
      <div class="bf-sec"><b>${icon("wallet")}Ce que vous payez aujourd'hui <small class="muted">(optionnel)</small></b><div class="form-grid">
        <div class="field"><label>Internet (DT/mois)</label><input type="number" name="curNet" value="${esc(q.curNet)}" min="0" placeholder="ex. 89"></div>
        <div class="field"><label>Mobiles (DT/mois, total)</label><input type="number" name="curMob" value="${esc(q.curMob)}" min="0" placeholder="ex. 70"></div>
        <div class="field"><label>Assurance (DT/an)</label><input type="number" name="curIns" value="${esc(q.curIns)}" min="0" placeholder="ex. 1200"></div>
        <button class="btn btn-primary">${icon("calc")}Calculer</button>
      </div></div>
    </form>
    <div style="padding:24px 0 70px">
      <div class="profile">${icon("bulb")}<span>Profil calculé : besoin Internet ≈ <b>${need} Mbps</b> · ${q.lines} ligne${q.lines > 1 ? "s" : ""} de <b>${q.data} Go</b>${q.car ? ` · assurance <b>${INS_FORM[q.f].toLowerCase()}</b>` : ""}</span></div>
      ${hasCur ? `<div class="save-hero ${cur - cheap.total > 0 ? "" : "neutral"}"><div>${icon("trend")}<div><small>Aujourd'hui : ${tnd(cur)} / an</small><b>${cur - cheap.total > 0 ? `Économisez jusqu'à ${tnd(cur - cheap.total)} par an` : "Vous payez déjà un bon prix"}</b><span>avec « ${esc(cheap.title)} » : ${tnd(cheap.total)} / an, soit ${tnd(cheap.total / 12)} / mois</span></div></div></div>` : ""}
      <div class="scen-grid four">${S.map((s) => scenCard(s, [s === cheap ? "cheap" : ""], 1, `${tnd(s.total / 12)} / mois · par an`)).join("")}</div>
      <h2 style="margin:34px 0 4px;letter-spacing:-.5px">Récapitulatif annuel</h2><p class="muted" style="margin:0">Remises multi-services éventuelles non incluses — demandez-les à l'opérateur.</p>
      ${recapTable(S, [
        ["Total annuel", (s) => ({ n: Math.round(s.total), t: `<b>${tnd(s.total)}</b>` }), "min"],
        ["Par mois", (s) => ({ n: Math.round(s.total / 12), t: tnd(s.total / 12) }), "min"],
        ["Internet / an", (s) => { const p = s.parts.find((x) => x.c === C.net); return { n: p ? Math.round(p.v) : 0, t: p ? tnd(p.v) : "—" }; }, "min"],
        ["Mobiles / an", (s) => { const p = s.parts.find((x) => x.c === C.mob); return { n: p ? Math.round(p.v) : 0, t: p ? tnd(p.v) : "—" }; }, "min"],
        ...(hasCur ? [["Économie vs aujourd'hui", (s) => ({ n: Math.round(cur - s.total), t: tnd(cur - s.total) }), "max"]] : [])
      ])}
      ${note("<b>Données de démonstration.</b> Calcul : Internet = abonnement + frais d'installation lissés sur 24 mois ; mobiles = forfait le moins cher couvrant la data demandée ; assurance = estimation la plus basse pour votre profil.")}
    </div></div>`;
    $("#bf").addEventListener("submit", (e) => { e.preventDefault(); const p = Object.fromEntries(new FormData(e.target).entries()); Object.keys(p).forEach((k) => p[k] === "" && delete p[k]); go("budget-foyer", p); });
  }

  /* =========================================================
     DONNÉES & MÉTHODOLOGIE
     ========================================================= */
  function dataPage() {
    document.title = "Nos données & méthodologie — Qarin.tn";
    const LBL = { internet: "Internet", mobile: "Forfaits mobiles", vols: "Vols", hotels: "Hôtels", ferry: "Ferry", voiture: "Location de voiture", assurance: "Assurance auto", credit: "Crédit", transfert: "Transfert d'argent" };
    app.innerHTML = pageHead("database", "Nos données & méthodologie", "D'où viennent les prix, ce qu'ils valent, et comment nous les corrigeons.", "Données") + `<div class="container"><div class="prose wide">
      ${DEMO ? `<div class="note">${icon("alert")}<div><b>Ce site est actuellement une version de démonstration.</b> Les prix affichés sont fictifs ou estimés par des modèles. Ils ne proviennent pas des fournisseurs cités et ne constituent ni une offre ni un devis.</div></div>` : ""}
      <h2>Statut des données par comparateur</h2>
      <div class="ctable-wrap"><table class="cmp data-t"><thead><tr><th>Comparateur</th><th>Statut</th><th>Origine actuelle</th><th>Source prévue (légale)</th></tr></thead><tbody>
      ${Object.entries(D.meta.cats).map(([k, c]) => `<tr><td><b>${esc(LBL[k] || c.label || k)}</b></td><td><span class="ribbon ${c.status === "Démo" ? "r-hot" : "r-ok"}">${esc(c.status)}</span></td><td>${esc(c.origin)}</td><td>${esc(c.real)}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="muted">Dernière mise à jour : ${frDate(D.meta.updated, { day: "numeric", month: "long", year: "numeric" })} · Taux de référence : 1 € = ${f3(D.meta.eurTnd)} DT · TMM ${D.meta.tmm.toFixed(2).replace(".", ",")} %</p>
      <h2>Nos engagements</h2>
      <ul class="checklist">
        <li>${icon("check")}<span><b>Transparence</b> : chaque prix affiche son statut (démonstration, estimation ou source officielle avec date de relevé).</span></li>
        <li>${icon("check")}<span><b>Neutralité</b> : le classement dépend uniquement des critères affichés et de vos priorités ; aucun fournisseur ne paie pour être mieux classé.</span></li>
        <li>${icon("check")}<span><b>Marques</b> : les noms de fournisseurs sont cités uniquement pour les identifier. Nous n'utilisons pas leurs logos.</span></li>
        <li>${icon("check")}<span><b>Droit de rectification</b> : tout fournisseur ou visiteur peut signaler une erreur (bouton « Signaler une erreur » sur chaque offre). Les corrections sont traitées en priorité.</span></li>
        <li>${icon("check")}<span><b>Affiliation déclarée</b> : si un lien devient rémunéré, il sera signalé comme tel. Cela ne change ni le prix ni le classement.</span></li>
        <li>${icon("check")}<span><b>Vie privée</b> : aucune donnée personnelle collectée ; vos réglages et favoris restent dans votre navigateur.</span></li>
      </ul>
      <h2>Comment les vrais prix seront intégrés</h2>
      <ol class="steps-list">
        <li><b>Tarifs publics</b> (Internet, mobile, frais bancaires) : relevés sur les pages officielles des fournisseurs, avec l'adresse de la page et la date du relevé affichées sur chaque offre.</li>
        <li><b>Voyages</b> (vols, hôtels, location, ferry) : via des programmes d'affiliation ou des API officielles qui autorisent l'affichage de leurs prix.</li>
        <li><b>Produits réglementés</b> (assurance, crédit) : partenariats avec les établissements ou des intermédiaires agréés. Qarin.tn ne fait qu'orienter vers l'établissement ; le devis ou l'offre de crédit est établi par lui.</li>
        <li><b>Pas d'aspiration sauvage</b> de sites tiers contre leurs conditions d'utilisation.</li>
      </ol>
      <h2>Méthode de calcul</h2>
      <p>Le <b>score sur 10</b> pondère plusieurs critères (prix, performance, flexibilité, service…) normalisés entre l'offre la moins bonne et la meilleure du marché. Les pondérations par défaut sont visibles et modifiables dans « Mes priorités ». Les coûts totaux incluent les frais connus (installation, frais de dossier, frais d'envoi, marge de change…).</p>
    </div></div>`;
  }

  /* =========================================================
     PAGES SIMPLES
     ========================================================= */
  function favPage() {
    document.title = "Mes favoris — Qarin.tn";
    const list = Object.entries(FAV).sort((a, b) => b[1].t - a[1].t);
    const al = ALERTS();
    const alertsHtml = al.length ? `<h2 style="margin:0 0 12px;display:flex;gap:8px;align-items:center">${icon("bell")}Mes alertes prix</h2><div class="fav-list" style="margin-bottom:30px">${al.map((a, i) => { const p = a.date >= inDays(0) ? alertPrice(a) : null; const ok = p != null && p <= a.target; return `<div class="fav-item"><div class="pbadge" style="background:${ok ? "var(--ok)" : "#64748b"}">${icon("bell")}</div><div><b>${esc(a.label)}</b><small>Objectif : ${tnd(a.target)} · ${p == null ? "date passée" : "prix actuel dès " + tnd(p)}</small></div><div class="pr" style="color:${ok ? "var(--ok)" : "inherit"}">${ok ? "Atteint !" : "En attente"}</div><div class="rm" style="display:flex;gap:6px"><button type="button" class="btn btn-ghost btn-sm" data-unalert="${i}" aria-label="Supprimer">${icon("trash")}</button></div></div>`; }).join("")}</div><h2 style="margin:0 0 12px;display:flex;gap:8px;align-items:center">${icon("heart")}Offres sauvegardées</h2>` : "";
    app.innerHTML = pageHead("heart", "Mes favoris", "Vos offres sauvegardées et vos alertes prix, sur cet appareil.", "Favoris") + `<div class="container" style="padding:28px 20px 70px">${alertsHtml}${list.length ? `<div class="fav-list">${list.map(([k, f]) => `<div class="fav-item">${f.badge || ""}<div><b>${esc(f.title)}</b><small>${esc(f.cat)} · ${esc(f.sub)}</small><a href="${esc(f.route)}" style="font-size:13px;font-weight:700">Revoir la recherche</a></div><div class="pr">${esc(f.price)}</div><div class="rm" style="display:flex;gap:6px"><a class="btn btn-primary btn-sm" href="${esc(f.url)}" target="_blank" rel="noopener nofollow">Voir</a><button type="button" class="btn btn-ghost btn-sm" data-unfav="${esc(k)}" aria-label="Supprimer">${icon("trash")}</button></div></div>`).join("")}</div>` : `<div class="empty">${icon("heart")}<b>Aucun favori pour l'instant</b>Cliquez sur « Sauver » sur une offre pour la retrouver ici.<div style="margin-top:14px"><a class="btn btn-brand btn-sm" href="#/internet">Commencer à comparer</a></div></div>`}</div>`;
    app.addEventListener("click", (e) => {
      const b = e.target.closest("[data-unfav]"); if (b) { delete FAV[b.dataset.unfav]; LS.set("qarin-favs", FAV); favCount(); router(); }
      const u = e.target.closest("[data-unalert]"); if (u) { const l = ALERTS(); l.splice(+u.dataset.unalert, 1); LS.set("qarin-alerts", l); router(); }
    });
  }
  function aboutPage() {
    document.title = "À propos — Qarin.tn";
    app.innerHTML = pageHead("info", "À propos de Qarin.tn", "Notre mission : rendre les prix transparents en Tunisie.", "À propos") + `<div class="container"><div class="prose">
      <h2>Notre mission</h2><p><b>Qarin</b> (قارن, « compare ! ») aide les consommateurs tunisiens à comparer en quelques secondes les offres Internet, mobiles, voyages, assurances et location de voiture. Un seul endroit, des critères clairs, aucune inscription.</p>
      <h2>Comment nous classons les offres</h2><p>Chaque offre reçoit un <b>score sur 10</b> calculé à partir de plusieurs critères (prix, performance, flexibilité, service…). Par défaut, les critères ont une pondération équilibrée ; avec « Mes priorités », vous décidez vous-même de leur importance. Le même calcul s'applique à tous les fournisseurs : aucun ne peut acheter une meilleure place.</p>
      <h2>Comment le site est financé</h2><p>Le service est gratuit. À terme, Qarin.tn pourra percevoir une commission de certains partenaires lorsqu'une souscription est réalisée via le site. Cette commission n'a aucun impact sur le prix que vous payez ni sur le classement.</p>
      <h2>Fiabilité des données</h2><p>Les tarifs sont des <b>estimations indicatives</b> établies à partir des grilles publiques des fournisseurs et de modèles de saisonnalité (vols, hôtels, location). Vérifiez toujours l'offre sur le site du fournisseur avant de souscrire.</p>
      <h2>Vous êtes fournisseur ?</h2><p>Opérateurs, assureurs, hôtels, agences : pour faire corriger ou ajouter une offre, contactez-nous via la page GitHub du projet.</p></div></div>`;
  }
  function legalPage() {
    document.title = "Mentions légales — Qarin.tn";
    app.innerHTML = pageHead("file", "Mentions légales & confidentialité", "Informations légales et protection des données.", "Mentions légales") + `<div class="container"><div class="prose">
      <h2>Éditeur</h2><p>[À compléter avant mise en production : nom ou raison sociale, forme juridique, identifiant unique (RNE), adresse, e-mail de contact, directeur de la publication.]</p><p>Qarin.tn est un service de comparaison indépendant, affilié à aucun des fournisseurs cités.</p>
      <h2>Hébergement</h2><p>GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>
      <h2>Statut des données</h2><p>${DEMO ? "<b>Version de démonstration :</b> les prix affichés sont fictifs ou estimés et ne proviennent pas des fournisseurs cités. Ils ne constituent ni une offre commerciale, ni un devis, ni une recommandation personnalisée. " : ""}Détails dans la page <a href="#/donnees">Nos données & méthodologie</a>.</p>
      <h2>Marques</h2><p>Les noms de marques cités appartiennent à leurs propriétaires respectifs et sont utilisés uniquement pour identifier les offres comparées. Aucun logo n'est reproduit. Un fournisseur peut demander la correction ou le retrait d'une information via « Signaler une erreur ».</p>
      <h2>Assurance, crédit et transferts</h2><p>Qarin.tn n'est ni intermédiaire d'assurance, ni établissement de crédit, ni intermédiaire en opérations de banque, ni établissement de paiement. Les estimations affichées sont non contractuelles ; seuls les établissements concernés peuvent établir un devis ou une offre.</p>
      <h2>Données personnelles</h2><p>Le site ne demande aucune inscription et ne collecte aucune donnée personnelle. Vos critères, priorités et favoris sont enregistrés uniquement dans votre navigateur (stockage local). Aucun cookie publicitaire n'est utilisé.</p>
      <h2>Liens externes</h2><p>Les boutons « Voir l'offre » vous redirigent vers les sites des fournisseurs ou de partenaires de réservation, qui appliquent leurs propres conditions et politiques de confidentialité.</p>
      <h2>Responsabilité</h2><p>Les informations sont fournies à titre indicatif. Qarin.tn ne saurait être tenu responsable d'un écart entre les prix affichés et les prix pratiqués par les fournisseurs.</p></div></div>`;
  }
  function notFound() {
    document.title = "Page introuvable — Qarin.tn";
    app.innerHTML = `<div class="container" style="padding:90px 0;text-align:center"><h1 style="font-size:72px;margin:0;letter-spacing:-3px">404</h1><p class="muted">Cette page n'existe pas.</p><a class="btn btn-primary" href="#/">Retour à l'accueil</a></div>`;
  }

  /* ================= routeur ================= */
  const routes = { "": home, internet: internetPage, mobile: mobilePage, vols: flightsPage, hotels: hotelsPage, ferry: ferryPage, "assurance-auto": insurancePage, "location-voiture": carPage, transfert: transferPage, credit: creditPage, "pack-voyage": packPage, "budget-foyer": budgetPage, donnees: dataPage, favoris: favPage, "a-propos": aboutPage, mentions: legalPage };
  function router() {
    const [path, qs] = location.hash.replace(/^#\/?/, "").split("?");
    const fn = routes[path] || notFound;
    cmp.cfg = null; cmp.ids = []; closeModal();
    const fresh = app.cloneNode(false); app.replaceWith(fresh); app = fresh;
    try { fn(new URLSearchParams(qs || ""), path); } catch (err) { console.error(err); notFound(); }
    renderCmpBar();
    $$("nav.main a").forEach((a) => a.classList.toggle("active", path !== "" && a.getAttribute("href") === "#/" + path));
    $$("nav.main .dd").forEach((dd) => { dd.classList.remove("open"); $(".dd-btn", dd).classList.toggle("active", !!$("a.active", dd)); });
    $("nav.main").classList.remove("open");
    window.scrollTo(0, 0);
  }

  /* ================= initialisation ================= */
  $$("nav.main [data-ic]").forEach((a) => a.insertAdjacentHTML("afterbegin", icon(a.dataset.ic)));
  $$("nav.main .dd-btn").forEach((b) => b.addEventListener("click", () => { const dd = b.parentElement, was = dd.classList.contains("open"); $$("nav.main .dd").forEach((x) => x.classList.remove("open")); dd.classList.toggle("open", !was); b.setAttribute("aria-expanded", !was); }));
  document.addEventListener("click", (e) => { if (!e.target.closest(".dd")) $$("nav.main .dd.open").forEach((x) => x.classList.remove("open")); });
  $("#favBtn").insertAdjacentHTML("afterbegin", icon("heart"));
  $(".burger").innerHTML = icon("menu");
  $("#toTop").innerHTML = icon("arrowUp");
  $("#cmpClear").innerHTML = icon("x");
  $("#cmpGo").insertAdjacentHTML("afterbegin", icon("scale"));
  setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  $("#themeBtn").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  favCount();
  $("#cmpGo").addEventListener("click", openCompare);
  $("#cmpClear").addEventListener("click", () => { cmp.ids = []; refreshCmpUI(); });
  $("#cmpBar").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) toggleCmp(b.dataset.rm); });
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal" || e.target.closest(".close")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); const f = $(".filters.open"); if (f) { f.classList.remove("open"); $("#ovl").classList.remove("show"); } } });
  $(".burger").addEventListener("click", () => $("nav.main").classList.toggle("open"));
  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => $("#toTop").classList.toggle("show", window.scrollY > 700), { passive: true });
  $("#year").textContent = new Date().getFullYear();
  window.addEventListener("hashchange", router);

  /* ================= alertes prix (stockées localement) ================= */
  const ALERTS = () => LS.get("qarin-alerts", []);
  function alertPrice(a) {
    if (a.kind === "vol") { const l = genFlights(a.from, a.to, a.date, "eco"); return l.length ? Math.min(...l.map((f) => f.price)) : null; }
    if (a.kind === "ferry") { const l = genFerries(a.route, a.date, a.ad, a.ch, a.veh, a.cab); return l.length ? Math.min(...l.map((f) => f.price)) : null; }
    return null;
  }
  function addAlert(a) {
    openModal(`<div class="mpad"><h2 style="margin:0 0 6px">${icon("bell")} Créer une alerte prix</h2><p class="muted" style="margin:0 0 14px">${esc(a.label)} · prix actuel dès <b>${tnd(a.now)}</b></p>
      <form id="alf" class="form-grid"><div class="field"><label>Prévenez-moi sous</label><input type="number" name="target" value="${Math.round(a.now * 0.9)}" min="1"></div><button class="btn btn-primary">${icon("bell")}Activer l'alerte</button></form>
      <p class="muted" style="font-size:12.5px;margin:12px 0 0">L'alerte est enregistrée sur cet appareil : elle s'affiche à votre prochaine visite si le prix passe sous votre objectif.</p></div>`, true);
    $("#alf").addEventListener("submit", (e) => { e.preventDefault(); const l = ALERTS(); l.push(Object.assign({}, a, { target: +e.target.target.value, t: Date.now() })); LS.set("qarin-alerts", l); closeModal(); toast("Alerte prix activée", "bell"); });
  }
  function checkAlerts() {
    const hit = ALERTS().filter((a) => a.date >= inDays(0)).map((a) => ({ a, p: alertPrice(a) })).filter((x) => x.p != null && x.p <= x.a.target);
    if (hit.length) setTimeout(() => toast(`${hit.length} alerte${hit.length > 1 ? "s" : ""} prix atteinte${hit.length > 1 ? "s" : ""} — voir Mes favoris`, "bell"), 1200);
  }

  /* ================= API interne pour les modules (more.js, i18n.js) ================= */
  window.Q = {
    D, $, $$, esc, nf, tnd, eur, f2, f3, clamp, rng, hashStr, iso, inDays, addDays, daysBetween, frDate, validDate, hm, dur, pad, LS,
    icon, starsHtml, badge, badgeOf, purl, opt, go, note, feats, meter, spec, yes, pageHead, listPage, toast, openModal, closeModal, scoreLabel,
    minBy, scenCard, recapTable, C, DEMO, genFlights, genFerries, genHotels, genCars, insQuotes, ALERTS, alertPrice, addAlert,
    routes, router, app: () => app, setApp: (el) => (app = el), P
  };
  const start = () => { router(); checkAlerts(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
