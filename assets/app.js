/* Qarin.tn — comparateur tunisien. Vanilla JS, routing par hash. */
(function () {
  "use strict";
  const D = window.QDATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  let app = $("#app");
  const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
  const tnd = (n) => nf.format(Math.round(n)) + " DT";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- utilitaires ---------- */
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed; return function () { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = (s, n) => { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return iso(d); };
  const inDays = (n) => { const d = today(); d.setDate(d.getDate() + n); return iso(d); };
  const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 864e5);
  const frDate = (s, o) => new Date(s + "T00:00:00").toLocaleDateString("fr-FR", o || { weekday: "short", day: "numeric", month: "short" });
  const hm = (min) => pad(Math.floor(min / 60) % 24) + ":" + pad(min % 60);
  const dur = (min) => Math.floor(min / 60) + " h " + pad(min % 60);
  const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !isNaN(new Date(s + "T00:00:00"));

  function badge(p) {
    const x = D.providers[p] || { short: p.slice(0, 2).toUpperCase(), color: "#334155" };
    return `<div class="pbadge" style="background:${x.color}" aria-hidden="true">${x.short}</div>`;
  }
  const purl = (p) => (D.providers[p] || {}).url || "#";
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2200); }
  function go(path, params) { const q = params ? "?" + new URLSearchParams(params).toString() : ""; location.hash = "#/" + path + q; }
  const opt = (v, label, sel) => `<option value="${esc(v)}" ${String(v) === String(sel) ? "selected" : ""}>${esc(label)}</option>`;
  const stars = (n) => "★".repeat(n) + '<span style="opacity:.25">' + "★".repeat(5 - n) + "</span>";
  const scoreLabel = (s) => s >= 9 ? "Excellent" : s >= 8.5 ? "Très bien" : s >= 8 ? "Bien" : s >= 7 ? "Correct" : "Moyen";
  const scoreHtml = (s) => `<span class="score"><span class="pill">${s.toFixed(1)}</span><small>${scoreLabel(s)}</small></span>`;
  const DISCLAIMER = `<div class="note">ℹ️ <b>Tarifs indicatifs</b> — les prix affichés sont des estimations établies à partir des grilles publiques et peuvent varier. Le prix final est toujours confirmé sur le site du fournisseur.</div>`;

  function pageHead(icon, title, sub, crumb) {
    return `<div class="page-head"><div class="container"><div class="crumbs"><a href="#/">Accueil</a> › ${esc(crumb || title)}</div><h1><span>${icon}</span>${esc(title)}</h1><p>${esc(sub)}</p></div></div>`;
  }

  /* ---------- comparateur (tiroir) ---------- */
  const cmp = { cat: null, ids: [], pool: {}, spec: null, title: "" };
  function cmpSetup(cat, title, spec) { cmp.cat = cat; cmp.title = title; cmp.spec = spec; cmp.ids = []; cmp.pool = {}; }
  function cmpPool(items) { items.forEach((it) => (cmp.pool[it.id] = it)); }
  const cmpChk = (id) => `<label class="compare-chk"><input type="checkbox" data-cmp="${id}" ${cmp.ids.includes(id) ? "checked" : ""}> Comparer</label>`;
  function renderCmpBar() {
    const bar = $("#cmpBar");
    if (!cmp.cat || !cmp.ids.length) { bar.classList.remove("show"); return; }
    bar.classList.add("show");
    $(".chips", bar).innerHTML = cmp.ids.map((id) => `<span class="chip">${esc(cmp.pool[id].p)} · ${esc(cmp.pool[id].name)}</span>`).join("");
    $("#cmpGo").textContent = `Comparer (${cmp.ids.length})`;
  }
  function openCompare() {
    const items = cmp.ids.map((id) => cmp.pool[id]);
    if (items.length < 2) { toast("Sélectionnez au moins 2 offres"); return; }
    let html = `<h2 style="margin-top:0">Comparatif ${esc(cmp.title)}</h2><div style="overflow-x:auto"><table class="cmp"><thead><tr><th></th>`;
    html += items.map((it) => `<th><div style="display:flex;flex-direction:column;align-items:center;gap:6px">${badge(it.p)}<b>${esc(it.name)}</b><small style="color:var(--muted)">${esc(it.p)}</small></div></th>`).join("") + "</tr></thead><tbody>";
    cmp.spec.forEach(([label, fn, better]) => {
      const vals = items.map((it) => fn(it));
      let win = -1;
      if (better) { const nums = vals.map((v) => (typeof v === "object" ? v.n : v)); const target = better === "min" ? Math.min(...nums) : Math.max(...nums); if (nums.filter((n) => n === target).length < nums.length) win = nums.indexOf(target); }
      html += `<tr><td>${esc(label)}</td>` + vals.map((v, i) => `<td class="${i === win ? "win" : ""}">${typeof v === "object" ? v.t : esc(v)}</td>`).join("") + "</tr>";
    });
    html += "<tr><td></td>" + items.map((it) => `<td><a class="btn btn-primary" target="_blank" rel="noopener nofollow" href="${purl(it.p)}">Voir l'offre</a></td>`).join("") + "</tr></tbody></table></div>";
    $("#modalBody").innerHTML = html;
    $("#modal").classList.add("show");
  }
  document.addEventListener("change", (e) => {
    const id = e.target.dataset && e.target.dataset.cmp;
    if (!id) return;
    if (e.target.checked) {
      if (cmp.ids.length >= 3) { e.target.checked = false; toast("Maximum 3 offres à comparer"); return; }
      cmp.ids.push(id);
    } else cmp.ids = cmp.ids.filter((x) => x !== id);
    renderCmpBar();
  });

  /* ---------- filtres génériques ---------- */
  function checks(name, values, selected, counts) {
    return values.map((v) => `<label class="check"><input type="checkbox" name="${name}" value="${esc(v)}" ${selected.has(v) ? "checked" : ""}> ${esc(v)}${counts ? `<span class="cnt">${counts[v] || 0}</span>` : ""}</label>`).join("");
  }
  const readChecks = (form, name) => new Set($$(`input[name="${name}"]:checked`, form).map((i) => i.value));
  function sortBar(opts, active) { return `<div class="sort">${opts.map(([k, l]) => `<button data-sort="${k}" class="${k === active ? "active" : ""}">${l}</button>`).join("")}</div>`; }
  function wireList(root, state, renderFn, readFn) {
    const form = $(".filters form", root);
    form.addEventListener("input", () => { readFn(form); renderFn(); });
    form.addEventListener("submit", (e) => e.preventDefault());
    root.addEventListener("click", (e) => {
      const s = e.target.closest("[data-sort]");
      if (s) { state.sort = s.dataset.sort; $$("[data-sort]", root).forEach((b) => b.classList.toggle("active", b === s)); renderFn(); }
      if (e.target.closest(".toggle-filters")) $(".filters", root).classList.toggle("open");
      if (e.target.closest("[data-reset]")) { form.reset(); readFn(form); renderFn(); }
    });
  }
  const emptyBox = (msg) => `<div class="empty"><b>Aucune offre ne correspond</b>${esc(msg || "Essayez d'élargir vos filtres.")}</div>`;

  /* =========================================================
     ACCUEIL
     ========================================================= */
  function home() {
    document.title = "Qarin.tn — Comparez et économisez en Tunisie | Internet, vols, hôtels, assurances";
    const depOpts = D.airportsTN.map((a) => opt(a.code, `${a.city} (${a.code})`, "TUN")).join("");
    const dstOpts = D.destinations.map((d) => opt(d.code, `${d.city} (${d.code})`, "CDG")).join("");
    const cityOpts = D.cities.map((c) => opt(c.id, c.name, "hammamet")).join("");
    const govOpts = D.governorates.map((g) => opt(g, g, "Tunis")).join("");
    const spotOpts = D.rentalSpots.map((s) => opt(s, s, D.rentalSpots[0])).join("");

    // offres phares calculées
    const fibre = D.internet.filter((o) => o.tech === "Fibre").sort((a, b) => a.price - b.price)[0];
    const fl = genFlights("TUN", "CDG", inDays(30), "eco").sort((a, b) => a.price - b.price)[0];
    const ht = genHotels("djerba", inDays(30), 7).sort((a, b) => a.night - b.night)[0];
    const mob = D.mobile.slice().sort((a, b) => a.price / a.data - b.price / b.data)[0];

    app.innerHTML = `
    <section class="hero"><div class="container">
      <h1>Comparez tout en Tunisie. <em>Payez moins.</em></h1>
      <p class="lead">Internet, forfaits mobiles, vols, hôtels, assurance auto et location de voiture : toutes les offres côte à côte, gratuitement et sans inscription.</p>
      <p class="ar" dir="rtl" lang="ar">قارن كل العروض في تونس ووفّر فلوسك</p>
      <div class="trust-row"><span>✅ 100 % gratuit</span><span>⚖️ Comparaison neutre</span><span>🔒 Sans inscription</span><span>📍 Pensé pour la Tunisie</span></div>
    </div></section>
    <div class="container">
      <div class="searchbox">
        <div class="tabs" role="tablist">
          <button class="tab active" data-tab="vols"><span class="ic">✈️</span>Vols</button>
          <button class="tab" data-tab="hotels"><span class="ic">🏨</span>Hôtels</button>
          <button class="tab" data-tab="internet"><span class="ic">📶</span>Internet</button>
          <button class="tab" data-tab="mobile"><span class="ic">📱</span>Mobile</button>
          <button class="tab" data-tab="assurance"><span class="ic">🚗</span>Assurance auto</button>
          <button class="tab" data-tab="voiture"><span class="ic">🔑</span>Location voiture</button>
        </div>
        <div class="search-body">
          <form data-pane="vols" class="form-grid">
            <div class="field"><label>Départ</label><select name="from">${depOpts}</select></div>
            <div class="field"><label>Destination</label><select name="to">${dstOpts}</select></div>
            <div class="field"><label>Aller</label><input type="date" name="date" value="${inDays(21)}" min="${inDays(0)}"></div>
            <div class="field"><label>Retour (option)</label><input type="date" name="ret" value="${inDays(28)}" min="${inDays(0)}"></div>
            <div class="field"><label>Voyageurs</label><select name="pax">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n + (n > 1 ? " adultes" : " adulte"), 1)).join("")}</select></div>
            <button class="btn btn-primary btn-lg">Rechercher les vols</button>
          </form>
          <form data-pane="hotels" class="form-grid" hidden>
            <div class="field"><label>Destination</label><select name="dest">${cityOpts}</select></div>
            <div class="field"><label>Arrivée</label><input type="date" name="in" value="${inDays(30)}" min="${inDays(0)}"></div>
            <div class="field"><label>Départ</label><input type="date" name="out" value="${inDays(37)}" min="${inDays(1)}"></div>
            <div class="field"><label>Adultes</label><select name="ad">${[1, 2, 3, 4].map((n) => opt(n, n, 2)).join("")}</select></div>
            <button class="btn btn-primary btn-lg">Comparer les hôtels</button>
          </form>
          <form data-pane="internet" class="form-grid" hidden>
            <div class="field"><label>Votre gouvernorat</label><select name="gov">${govOpts}</select></div>
            <div class="field"><label>Technologie</label><select name="tech">${opt("", "Toutes")}${["Fibre", "VDSL", "ADSL", "4G Box", "5G Box"].map((t) => opt(t, t)).join("")}</select></div>
            <div class="field"><label>Débit minimum</label><select name="min">${[0, 10, 30, 100, 300].map((n) => opt(n, n ? n + " Mbps" : "Peu importe")).join("")}</select></div>
            <button class="btn btn-primary btn-lg">Comparer Internet</button>
          </form>
          <form data-pane="mobile" class="form-grid" hidden>
            <div class="field"><label>Data minimum</label><select name="data">${[0, 10, 30, 50, 100].map((n) => opt(n, n ? n + " Go" : "Peu importe")).join("")}</select></div>
            <div class="field"><label>Budget max / mois</label><select name="max">${[20, 35, 50, 70].map((n) => opt(n, n + " DT", 70)).join("")}</select></div>
            <button class="btn btn-primary btn-lg">Comparer les forfaits</button>
          </form>
          <form data-pane="assurance" class="form-grid" hidden>
            <div class="field"><label>Puissance fiscale</label><select name="cv">${[4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => opt(n, n + " CV", 6)).join("")}</select></div>
            <div class="field"><label>Valeur du véhicule (DT)</label><input type="number" name="val" value="45000" min="5000" step="1000"></div>
            <div class="field"><label>Formule</label><select name="f">${opt("rc", "Responsabilité civile")}${opt("tp", "Tiers + vol/incendie", "tp")}${opt("tr", "Tous risques")}</select></div>
            <button class="btn btn-primary btn-lg">Calculer mon devis</button>
          </form>
          <form data-pane="voiture" class="form-grid" hidden>
            <div class="field"><label>Lieu de prise</label><select name="spot">${spotOpts}</select></div>
            <div class="field"><label>Prise</label><input type="date" name="start" value="${inDays(14)}" min="${inDays(0)}"></div>
            <div class="field"><label>Retour</label><input type="date" name="end" value="${inDays(21)}" min="${inDays(1)}"></div>
            <button class="btn btn-primary btn-lg">Comparer les loueurs</button>
          </form>
        </div>
      </div>

      <section class="block">
        <div class="section-title"><h2>Que voulez-vous comparer ?</h2><p>Six comparateurs, une seule adresse.</p></div>
        <div class="cat-grid">
          <a class="cat" href="#/internet"><span class="ic">📶</span><b>Internet</b><small>Fibre, VDSL, 4G/5G</small></a>
          <a class="cat" href="#/mobile"><span class="ic">📱</span><b>Forfaits mobiles</b><small>Ooredoo, Orange, TT</small></a>
          <a class="cat" href="#/vols"><span class="ic">✈️</span><b>Vols</b><small>${D.destinations.length} destinations</small></a>
          <a class="cat" href="#/hotels"><span class="ic">🏨</span><b>Hôtels</b><small>${D.cities.length} régions</small></a>
          <a class="cat" href="#/assurance-auto"><span class="ic">🚗</span><b>Assurance auto</b><small>${D.insurers.length} assureurs</small></a>
          <a class="cat" href="#/location-voiture"><span class="ic">🔑</span><b>Location voiture</b><small>Aéroports & villes</small></a>
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="section-title"><h2>Les bons plans du moment</h2><p>Calculés automatiquement à partir de nos comparateurs.</p></div>
        <div class="deals">
          ${dealCard("linear-gradient(135deg,#0a5c8a,#14b8a6)", "✈️ Vol aller", "Tunis → Paris", fl.price, "/ pers.", "#/vols?from=TUN&to=CDG&date=" + inDays(30))}
          ${dealCard("linear-gradient(135deg,#06b6d4,#3b82f6)", "🏨 Hôtel " + ht.stars + "★ · " + ht.board, "Djerba", ht.night, "/ nuit / pers.", "#/hotels?dest=djerba")}
          ${dealCard("linear-gradient(135deg,#7c3aed,#0ea5e9)", "📶 Fibre la moins chère · " + fibre.p, fibre.name, fibre.price, "/ mois", "#/internet?tech=Fibre")}
          ${dealCard("linear-gradient(135deg,#0f9d58,#84cc16)", "📱 Meilleur prix par Go · " + mob.p, mob.name + " · " + mob.data + " Go", mob.price, "/ mois", "#/mobile")}
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="section-title"><h2>Comment ça marche ?</h2><p>Trouver la meilleure offre en moins de 2 minutes.</p></div>
        <div class="steps">
          <div class="step"><div class="num">1</div><h3>Indiquez votre besoin</h3><p>Destination, débit souhaité, véhicule… quelques champs suffisent.</p></div>
          <div class="step"><div class="num">2</div><h3>Comparez en un clin d'œil</h3><p>Filtres, tri par prix ou par score qualité/prix, et comparatif côte à côte jusqu'à 3 offres.</p></div>
          <div class="step"><div class="num">3</div><h3>Souscrivez chez le fournisseur</h3><p>Un clic vous mène directement à l'offre. Aucun frais supplémentaire de notre part.</p></div>
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="stats">
          <div><b>${D.internet.length + D.mobile.length}</b><span>offres télécom comparées</span></div>
          <div><b>${D.destinations.length * D.airportsTN.length}</b><span>liaisons aériennes</span></div>
          <div><b>${D.insurers.length}</b><span>assureurs auto</span></div>
          <div><b>0 DT</b><span>c'est le prix du service</span></div>
        </div>
      </section>

      <section class="block" style="padding-top:0">
        <div class="section-title"><h2>Questions fréquentes</h2></div>
        <div class="faq">
          <details><summary>Qarin.tn est-il vraiment gratuit ?</summary><p>Oui. La comparaison est gratuite et sans inscription. Le site peut être rémunéré par certains partenaires lorsque vous souscrivez via un lien, sans aucun surcoût pour vous et sans influence sur le classement.</p></details>
          <details><summary>Comment est calculé le score qualité/prix ?</summary><p>Pour Internet, le score combine le débit (descendant et montant), le prix mensuel et les frais d'installation. Pour les forfaits mobiles, il met en rapport le volume de data, les appels et le prix. Le score est recalculé pour chaque recherche.</p></details>
          <details><summary>Les prix sont-ils garantis ?</summary><p>Non : les prix affichés sont indicatifs. Ils sont estimés à partir des grilles tarifaires publiques et des tendances de saison. Le prix définitif est toujours celui affiché par le fournisseur au moment de la souscription ou de la réservation.</p></details>
          <details><summary>La fibre est-elle disponible chez moi ?</summary><p>Choisissez votre gouvernorat dans le comparateur Internet : nous n'affichons que les technologies généralement disponibles dans votre zone. L'éligibilité exacte à votre adresse se vérifie chez l'opérateur.</p></details>
          <details><summary>Puis-je comparer des offres côte à côte ?</summary><p>Oui, cochez « Comparer » sur 2 ou 3 offres (Internet, mobile, assurance) puis cliquez sur le bouton en bas de l'écran.</p></details>
        </div>
      </section>
    </div>`;

    $$(".tab", app).forEach((t) => t.addEventListener("click", () => {
      $$(".tab", app).forEach((x) => x.classList.toggle("active", x === t));
      $$("[data-pane]", app).forEach((p) => (p.hidden = p.dataset.pane !== t.dataset.tab));
    }));
    const target = { vols: "vols", hotels: "hotels", internet: "internet", mobile: "mobile", assurance: "assurance-auto", voiture: "location-voiture" };
    $$("[data-pane]", app).forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const p = Object.fromEntries(new FormData(f).entries());
      Object.keys(p).forEach((k) => p[k] === "" && delete p[k]);
      go(target[f.dataset.pane], p);
    }));
  }
  function dealCard(bg, small, title, price, unit, href) {
    return `<div class="deal"><div class="top" style="background:${bg}"><small>${esc(small)}</small><b>${esc(title)}</b></div><div class="bot"><div class="price"><small>dès</small> ${tnd(price)} <small>${unit}</small></div><a class="btn btn-ghost" href="${href}">Voir</a></div></div>`;
  }

  /* =========================================================
     INTERNET
     ========================================================= */
  function internetPage(params) {
    document.title = "Comparateur Internet Tunisie — Fibre, VDSL, ADSL, 4G/5G | Qarin.tn";
    const TECHS = ["Fibre", "VDSL", "ADSL", "4G Box", "5G Box"];
    const PROVS = [...new Set(D.internet.map((o) => o.p))];
    const all = D.internet.map((o, i) => ({ ...o, id: "net" + i }));
    // score qualité/prix normalisé 6.0 → 9.7
    const raw = all.map((o) => (Math.sqrt(o.down) * 6 + Math.log2(o.up + 1) * 3) / (o.price + o.setup / 12));
    const mn = Math.min(...raw), mx = Math.max(...raw);
    all.forEach((o, i) => (o.score = 6 + ((raw[i] - mn) / (mx - mn)) * 3.7));
    const st = {
      gov: D.governorates.includes(params.get("gov")) ? params.get("gov") : "Tunis",
      techs: new Set(params.get("tech") && TECHS.includes(params.get("tech")) ? [params.get("tech")] : TECHS),
      provs: new Set(PROVS), min: +params.get("min") || 0, max: 250, noEng: false, sort: "score"
    };
    cmpSetup("internet", "Internet", [
      ["Technologie", (o) => o.tech], ["Débit descendant", (o) => ({ n: o.down, t: o.down + " Mbps" }), "max"], ["Débit montant", (o) => ({ n: o.up, t: o.up + " Mbps" }), "max"],
      ["Prix mensuel", (o) => ({ n: o.price, t: tnd(o.price) }), "min"], ["Frais d'installation", (o) => ({ n: o.setup, t: o.setup ? tnd(o.setup) : "Offerts" }), "min"],
      ["Coût sur 12 mois", (o) => ({ n: o.price * 12 + o.setup, t: tnd(o.price * 12 + o.setup) }), "min"], ["Engagement", (o) => (o.eng ? o.eng + " mois" : "Sans")],
      ["Score Qarin", (o) => ({ n: +o.score.toFixed(1), t: o.score.toFixed(1) + " / 10" }), "max"], ["Inclus", (o) => o.feats.join(" · ")]
    ]);
    cmpPool(all);
    const avail = (o) => (o.tech === "Fibre" ? D.fiberGov.includes(st.gov) : o.tech === "5G Box" ? D.g5Gov.includes(st.gov) : true);

    app.innerHTML = pageHead("📶", "Comparateur Internet", "Fibre, VDSL, ADSL et box 4G/5G de tous les fournisseurs tunisiens.", "Internet") + `
    <div class="container"><div class="layout">
      <aside class="filters"><form>
        <h3>Filtres <button type="button" data-reset>Réinitialiser</button></h3>
        <div class="fgroup"><b>Gouvernorat</b><select name="gov">${D.governorates.map((g) => opt(g, g, st.gov)).join("")}</select></div>
        <div class="fgroup"><b>Technologie</b>${checks("tech", TECHS, st.techs)}</div>
        <div class="fgroup"><b>Débit min.</b><select name="min">${[0, 10, 30, 50, 100, 300, 500].map((n) => opt(n, n ? n + " Mbps" : "Peu importe", st.min)).join("")}</select></div>
        <div class="fgroup"><b>Prix max : <span class="range-val" id="maxv">${st.max} DT</span></b><input type="range" name="max" min="30" max="250" step="5" value="${st.max}"></div>
        <div class="fgroup"><label class="check"><input type="checkbox" name="noeng"> Sans engagement uniquement</label></div>
        <div class="fgroup"><b>Fournisseurs</b>${checks("prov", PROVS, st.provs)}</div>
      </form></aside>
      <div>
        ${DISCLAIMER}
        <div class="results-bar"><div class="count" id="cnt"></div>${sortBar([["score", "⭐ Meilleur score"], ["price", "Prix"], ["speed", "Débit"], ["year", "Coût 12 mois"]], st.sort)}<button class="btn btn-ghost toggle-filters">⚙️ Filtres</button></div>
        <div id="res"></div>
      </div>
    </div></div>`;

    const read = (f) => {
      st.gov = f.gov.value; st.techs = readChecks(f, "tech"); st.provs = readChecks(f, "prov");
      st.min = +f.min.value; st.max = +f.max.value; st.noEng = f.noeng.checked; $("#maxv").textContent = st.max + " DT";
    };
    const render = () => {
      let list = all.filter((o) => avail(o) && st.techs.has(o.tech) && st.provs.has(o.p) && o.down >= st.min && o.price <= st.max && (!st.noEng || !o.eng));
      const sorters = { score: (a, b) => b.score - a.score, price: (a, b) => a.price - b.price, speed: (a, b) => b.down - a.down, year: (a, b) => a.price * 12 + a.setup - (b.price * 12 + b.setup) };
      list.sort(sorters[st.sort]);
      const unavailable = all.filter((o) => !avail(o)).length;
      $("#cnt").innerHTML = `${list.length} offres <small>à ${esc(st.gov)}${unavailable ? ` · ${unavailable} non disponibles dans votre zone` : ""}</small>`;
      if (!list.length) { $("#res").innerHTML = emptyBox(); return; }
      const cheapest = Math.min(...list.map((o) => o.price)), best = Math.max(...list.map((o) => o.score));
      $("#res").innerHTML = list.map((o, i) => `
        <article class="offer fade-in ${i === 0 && st.sort === "score" ? "top1" : ""}">
          <div class="main">
            <div class="ribbons">${o.score === best ? '<span class="ribbon r-ok">🏆 Meilleur rapport qualité/prix</span>' : ""}${o.price === cheapest ? '<span class="ribbon r-best">💰 Prix le plus bas</span>' : ""}${o.promo ? '<span class="ribbon r-hot">🔥 Promo</span>' : ""}${!o.eng ? '<span class="ribbon r-info">Sans engagement</span>' : ""}</div>
            <div class="head">${badge(o.p)}<div><h3>${esc(o.name)}</h3><small>${esc(o.p)}</small> <span class="tech">${o.tech}</span></div><div style="margin-left:auto">${scoreHtml(o.score)}</div></div>
            <div class="specs">
              <div class="spec"><small>Descendant</small><b>${o.down >= 1000 ? o.down / 1000 + " Gbps" : o.down + " Mbps"}</b></div>
              <div class="spec"><small>Montant</small><b>${o.up} Mbps</b></div>
              <div class="spec"><small>Installation</small><b>${o.setup ? tnd(o.setup) : "Offerte"}</b></div>
              <div class="spec"><small>Engagement</small><b>${o.eng ? o.eng + " mois" : "Aucun"}</b></div>
            </div>
            <ul class="feats">${o.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          </div>
          <div class="side">
            <div><div class="price-big">${nf.format(o.price)}<sup>DT/mois</sup></div><div class="price-sub">${tnd(o.price * 12 + o.setup)} sur 12 mois</div></div>
            <a class="btn btn-primary" target="_blank" rel="noopener nofollow" href="${purl(o.p)}">Voir l'offre →</a>
            ${cmpChk(o.id)}
          </div>
        </article>`).join("");
    };
    wireList(app, st, render, read);
    render();
  }

  /* =========================================================
     MOBILE
     ========================================================= */
  function mobilePage(params) {
    document.title = "Comparateur forfaits mobiles Tunisie — Ooredoo, Orange, Tunisie Telecom | Qarin.tn";
    const OPS = [...new Set(D.mobile.map((o) => o.p))];
    const all = D.mobile.map((o, i) => ({ ...o, id: "mob" + i }));
    const raw = all.map((o) => (o.data * 1 + (o.min.startsWith("Illimit") ? 25 : parseInt(o.min) / 20 || 0)) / o.price);
    const mn = Math.min(...raw), mx = Math.max(...raw);
    all.forEach((o, i) => (o.score = 6.2 + ((raw[i] - mn) / (mx - mn)) * 3.5));
    const st = { ops: new Set(OPS), data: +params.get("data") || 0, max: +params.get("max") || 70, noEng: false, sort: "score" };
    cmpSetup("mobile", "forfaits mobiles", [
      ["Prix", (o) => ({ n: o.price, t: tnd(o.price) + "/mois" }), "min"], ["Data", (o) => ({ n: o.data, t: o.data + " Go" }), "max"], ["Appels", (o) => o.min], ["SMS", (o) => o.sms],
      ["Prix par Go", (o) => ({ n: +(o.price / o.data).toFixed(2), t: (o.price / o.data).toFixed(2) + " DT" }), "min"], ["Engagement", (o) => (o.eng ? o.eng + " mois" : "Sans")],
      ["Score Qarin", (o) => ({ n: +o.score.toFixed(1), t: o.score.toFixed(1) + " / 10" }), "max"]
    ]);
    cmpPool(all);
    app.innerHTML = pageHead("📱", "Forfaits mobiles", "Data, appels et prix : trouvez le forfait qui vous ressemble.", "Mobile") + `
    <div class="container"><div class="layout">
      <aside class="filters"><form>
        <h3>Filtres <button type="button" data-reset>Réinitialiser</button></h3>
        <div class="fgroup"><b>Opérateurs</b>${checks("op", OPS, st.ops)}</div>
        <div class="fgroup"><b>Data min.</b><select name="data">${[0, 10, 30, 50, 100].map((n) => opt(n, n ? n + " Go" : "Peu importe", st.data)).join("")}</select></div>
        <div class="fgroup"><b>Budget max : <span class="range-val" id="maxv">${st.max} DT</span></b><input type="range" name="max" min="15" max="70" step="5" value="${st.max}"></div>
        <div class="fgroup"><label class="check"><input type="checkbox" name="noeng"> Sans engagement</label></div>
      </form></aside>
      <div>${DISCLAIMER}
        <div class="results-bar"><div class="count" id="cnt"></div>${sortBar([["score", "⭐ Meilleur score"], ["price", "Prix"], ["data", "Data"]], st.sort)}<button class="btn btn-ghost toggle-filters">⚙️ Filtres</button></div>
        <div id="res"></div></div>
    </div></div>`;
    const read = (f) => { st.ops = readChecks(f, "op"); st.data = +f.data.value; st.max = +f.max.value; st.noEng = f.noeng.checked; $("#maxv").textContent = st.max + " DT"; };
    const render = () => {
      const list = all.filter((o) => st.ops.has(o.p) && o.data >= st.data && o.price <= st.max && (!st.noEng || !o.eng))
        .sort({ score: (a, b) => b.score - a.score, price: (a, b) => a.price - b.price, data: (a, b) => b.data - a.data }[st.sort]);
      $("#cnt").innerHTML = `${list.length} forfaits`;
      if (!list.length) { $("#res").innerHTML = emptyBox(); return; }
      const best = Math.max(...list.map((o) => o.score)), cheap = Math.min(...list.map((o) => o.price));
      $("#res").innerHTML = list.map((o) => `
        <article class="offer fade-in ${o.score === best ? "top1" : ""}">
          <div class="main">
            <div class="ribbons">${o.score === best ? '<span class="ribbon r-ok">🏆 Meilleur rapport qualité/prix</span>' : ""}${o.price === cheap ? '<span class="ribbon r-best">💰 Le moins cher</span>' : ""}${o.promo ? '<span class="ribbon r-hot">🔥 Promo</span>' : ""}</div>
            <div class="head">${badge(o.p)}<div><h3>${esc(o.name)}</h3><small>${esc(o.p)}</small></div><div style="margin-left:auto">${scoreHtml(o.score)}</div></div>
            <div class="specs">
              <div class="spec"><small>Internet</small><b>${o.data} Go</b></div><div class="spec"><small>Appels</small><b>${esc(o.min)}</b></div>
              <div class="spec"><small>SMS</small><b>${esc(o.sms)}</b></div><div class="spec"><small>Engagement</small><b>${o.eng ? o.eng + " mois" : "Aucun"}</b></div>
            </div>
            <ul class="feats">${o.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          </div>
          <div class="side"><div><div class="price-big">${o.price}<sup>DT/mois</sup></div><div class="price-sub">${(o.price / o.data).toFixed(2)} DT par Go</div></div>
            <a class="btn btn-primary" target="_blank" rel="noopener nofollow" href="${purl(o.p)}">Voir l'offre →</a>${cmpChk(o.id)}</div>
        </article>`).join("");
    };
    wireList(app, st, render, read);
    render();
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
    if (from !== "TUN") {
      airlines = airlines.filter((a) => ["Tunisair", "Nouvelair", "Transavia", "Turkish Airlines", "Qatar Airways"].includes(a));
      if (!airlines.length) airlines = ["Tunisair"];
    }
    const out = [];
    airlines.forEach((a, ai) => {
      let direct = directs.includes(a);
      if (from !== "TUN") direct = direct && ["Tunisair", "Nouvelair", "Transavia"].includes(a) && dst.km < 2000 && (a !== "Tunisair" || from === "DJE" || from === "MIR" || from === "NBE");
      let via = null;
      if (!direct) { via = from !== "TUN" && ["Tunisair", "Nouvelair"].includes(a) ? "TUN" : D.hubs[a]; if (via === to) { direct = true; via = null; } else if (via === from) via = "IST"; }
      const n = 1 + (r() < (direct ? 0.55 : 0.3) ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const dep = (6 + Math.floor(r() * 16)) * 60 + [0, 15, 30, 45][Math.floor(r() * 4)];
        const block = Math.round(dst.km / 780 * 60 + 35);
        const duration = direct ? block : Math.round(block * 1.35 + 60 + r() * 220);
        const price = Math.round(base * season * dowF * leadF * (D.airlineFactor[a] || 1) * clsF * org.f * (direct ? 1.06 : 0.92) * (0.84 + r() * 0.4));
        const retDep = (7 + Math.floor(r() * 14)) * 60 + [0, 20, 40][Math.floor(r() * 3)];
        out.push({ id: `fl${ai}${k}`, p: a, name: a, dep, arr: dep + duration, duration, direct, via, price, retPrice: Math.round(price * (0.88 + r() * 0.28)), retDep, bag: a === "Transavia" ? "Cabine 10 kg" : cls === "business" ? "2 × 32 kg" : "Soute 23 kg" });
      }
    });
    return out;
  }
  function flightsPage(params) {
    const st = {
      from: D.airportsTN.some((a) => a.code === params.get("from")) ? params.get("from") : "TUN",
      to: D.destinations.some((d) => d.code === params.get("to")) ? params.get("to") : "CDG",
      date: validDate(params.get("date")) && params.get("date") >= inDays(0) ? params.get("date") : inDays(21),
      ret: validDate(params.get("ret")) ? params.get("ret") : "",
      pax: clamp(+params.get("pax") || 1, 1, 9), cls: params.get("cls") === "business" ? "business" : "eco",
      sort: "price", direct: false, airlines: null, slots: new Set(["Matin", "Après-midi", "Soir"])
    };
    if (st.ret && st.ret < st.date) st.ret = "";
    const dst = D.destinations.find((d) => d.code === st.to), org = D.airportsTN.find((a) => a.code === st.from);
    document.title = `Vols ${org.city} → ${dst.city} pas chers | Qarin.tn`;
    const all = genFlights(st.from, st.to, st.date, st.cls);
    st.airlines = new Set(all.map((f) => f.p));
    const cal = [-3, -2, -1, 0, 1, 2, 3].map((n) => addDays(st.date, n)).filter((d) => d >= inDays(0)).map((d) => ({ d, p: Math.min(...genFlights(st.from, st.to, d, st.cls).map((f) => f.price)) }));
    const calMin = Math.min(...cal.map((c) => c.p));
    const q = (o) => { const p = { from: st.from, to: st.to, date: st.date, pax: st.pax, cls: st.cls }; if (st.ret) p.ret = st.ret; return Object.assign(p, o); };
    const gf = `https://www.google.com/travel/flights?hl=fr&q=${encodeURIComponent(`Vols de ${st.from} à ${st.to} le ${st.date}${st.ret ? " retour " + st.ret : ""}`)}`;
    const nights = st.ret ? daysBetween(st.date, st.ret) : 0;

    app.innerHTML = pageHead("✈️", `${org.city} → ${dst.city}`, `${frDate(st.date, { weekday: "long", day: "numeric", month: "long" })}${st.ret ? " · retour le " + frDate(st.ret, { weekday: "long", day: "numeric", month: "long" }) : " · aller simple"} · ${st.pax} voyageur${st.pax > 1 ? "s" : ""} · ${st.cls === "business" ? "Affaires" : "Économique"}`, "Vols") + `
    <div class="container"><form class="page-search form-grid" id="fs">
      <div class="field"><label>Départ</label><select name="from">${D.airportsTN.map((a) => opt(a.code, `${a.city} (${a.code})`, st.from)).join("")}</select></div>
      <div class="field"><label>Destination</label><select name="to">${D.destinations.map((d) => opt(d.code, `${d.city} (${d.code})`, st.to)).join("")}</select></div>
      <div class="field"><label>Aller</label><input type="date" name="date" value="${st.date}" min="${inDays(0)}"></div>
      <div class="field"><label>Retour</label><input type="date" name="ret" value="${st.ret}" min="${inDays(0)}"></div>
      <div class="field"><label>Voyageurs</label><select name="pax">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n, st.pax)).join("")}</select></div>
      <div class="field"><label>Classe</label><select name="cls">${opt("eco", "Économique", st.cls)}${opt("business", "Affaires", st.cls)}</select></div>
      <button class="btn btn-primary">Rechercher</button>
    </form>
    <div class="layout">
      <aside class="filters"><form>
        <h3>Filtres <button type="button" data-reset>Réinitialiser</button></h3>
        <div class="fgroup"><b>Escales</b><label class="check"><input type="checkbox" name="direct"> Vols directs uniquement</label></div>
        <div class="fgroup"><b>Heure de départ</b>${checks("slot", ["Matin", "Après-midi", "Soir"], st.slots)}</div>
        <div class="fgroup"><b>Compagnies</b>${checks("air", [...st.airlines], st.airlines)}</div>
      </form></aside>
      <div>
        <div class="cal">${cal.map((c) => `<button data-day="${c.d}" class="${c.d === st.date ? "active" : ""} ${c.p === calMin ? "cheap" : ""}"><small>${frDate(c.d)}</small><b>${tnd(c.p)}</b><small>aller dès</small></button>`).join("")}</div>
        <div class="note">ℹ️ <b>Prix estimés</b> par personne, selon la saison, le jour et la compagnie. Cliquez sur « Voir les vols » pour la disponibilité et le prix réels en temps réel.</div>
        <div class="results-bar"><div class="count" id="cnt"></div>${sortBar([["price", "💰 Moins cher"], ["duration", "⚡ Plus rapide"], ["dep", "🕐 Départ"]], st.sort)}<button class="btn btn-ghost toggle-filters">⚙️ Filtres</button></div>
        <div id="res"></div>
      </div>
    </div></div>`;

    $("#fs").addEventListener("submit", (e) => { e.preventDefault(); const p = Object.fromEntries(new FormData(e.target).entries()); if (!p.ret) delete p.ret; go("vols", p); });
    $$(".cal button", app).forEach((b) => b.addEventListener("click", () => go("vols", q({ date: b.dataset.day, ...(st.ret && st.ret < b.dataset.day ? { ret: addDays(b.dataset.day, nights || 7) } : {}) }))));
    const slotOf = (m) => (m < 12 * 60 ? "Matin" : m < 18 * 60 ? "Après-midi" : "Soir");
    const read = (f) => { st.direct = f.direct.checked; st.slots = readChecks(f, "slot"); st.airlines = readChecks(f, "air"); };
    const render = () => {
      const list = all.filter((f) => (!st.direct || f.direct) && st.airlines.has(f.p) && st.slots.has(slotOf(f.dep)))
        .sort({ price: (a, b) => a.price - b.price, duration: (a, b) => a.duration - b.duration, dep: (a, b) => a.dep - b.dep }[st.sort]);
      $("#cnt").innerHTML = `${list.length} vols <small>trouvés</small>`;
      if (!list.length) { $("#res").innerHTML = emptyBox(); return; }
      const cheap = Math.min(...list.map((f) => f.price)), fast = Math.min(...list.map((f) => f.duration));
      $("#res").innerHTML = list.map((f) => {
        const per = f.price + (st.ret ? f.retPrice : 0);
        const row = (dep, from, to, lbl) => `<div class="fl-row" style="margin-bottom:10px">${badge(f.p)}<div class="fl-time"><b>${hm(dep)}</b><small>${from} · ${lbl}</small></div>
            <div class="fl-line fl-dur">${dur(f.duration)}<div class="bar"></div>${f.direct ? '<span class="direct">Direct</span>' : `<span class="stop">1 escale · ${f.via}</span>`}</div>
            <div class="fl-time" style="text-align:right"><b>${hm(dep + f.duration)}${dep + f.duration >= 1440 ? '<sup style="color:var(--accent);font-size:12px"> +1</sup>' : ""}</b><small>${to}</small></div></div>`;
        return `<article class="offer flight fade-in ${f.price === cheap ? "top1" : ""}">
          <div class="main">
            <div class="ribbons">${f.price === cheap ? '<span class="ribbon r-best">💰 Le moins cher</span>' : ""}${f.duration === fast && fast < Math.max(...list.map((x) => x.duration)) ? '<span class="ribbon r-ok">⚡ Le plus rapide</span>' : ""}<span class="ribbon r-info">🧳 ${f.bag}</span></div>
            ${row(f.dep, st.from, st.to, "Aller")}${st.ret ? row(f.retDep, st.to, st.from, "Retour " + frDate(st.ret)) : ""}
            <small style="color:var(--muted)">${esc(f.p)}${f.direct ? "" : " · correspondance à " + f.via}</small>
          </div>
          <div class="side"><div><div class="price-big">${nf.format(per)}<sup>DT</sup></div><div class="price-sub">par pers. ${st.ret ? "aller-retour" : "aller simple"}${st.pax > 1 ? `<br><b>${tnd(per * st.pax)}</b> pour ${st.pax}` : ""}</div></div>
            <a class="btn btn-primary" target="_blank" rel="noopener nofollow" href="${gf}">Voir les vols →</a>
            <a href="${purl(f.p)}" target="_blank" rel="noopener nofollow" style="font-size:13px">Site ${esc(f.p)}</a></div>
        </article>`;
      }).join("");
    };
    wireList(app, st, render, read);
    render();
  }

  /* =========================================================
     HÔTELS
     ========================================================= */
  function genHotels(cityId, date, nights) {
    const city = D.cities.find((c) => c.id === cityId) || D.cities[0];
    const r = rng(hashStr("hotels" + city.id));
    const rp = rng(hashStr("hp" + city.id + date));
    const season = [0.75, 0.75, 0.85, 0.95, 1.05, 1.3, 1.6, 1.7, 1.25, 1, 0.82, 0.95][new Date(date + "T00:00:00").getMonth()];
    const used = new Set();
    return D.hotelTypes.concat(D.hotelTypes.filter(() => r() < 0.4)).map((t, i) => {
      let nm; do { nm = D.nameBits[Math.floor(r() * D.nameBits.length)]; } while (used.has(nm) && used.size < D.nameBits.length); used.add(nm);
      const suffix = t.t.includes("Resort") ? " Resort" : t.t.includes("Maison") ? "" : t.t.includes("Résidence") ? " Résidence" : "";
      const name = (t.t.includes("Maison") ? "Dar " : "Hôtel ") + nm + suffix;
      const night = Math.round(t.base * (D.cityFactor[city.id] || 1) * season * (0.85 + rp() * 0.35) * (nights >= 7 ? 0.93 : 1));
      const rating = Math.round((7.4 + r() * 2 + (t.stars - 3) * 0.15) * 10) / 10;
      return { id: "h" + i, p: name, name, type: t.t, stars: t.stars, board: t.board, feats: t.feats, night, rating: Math.min(rating, 9.6), beach: t.feats.some((f) => f.startsWith("Plage")) ? Math.round(r() * 3) * 50 : Math.round(300 + r() * 2500), reviews: Math.round(80 + r() * 2400), hue: Math.round(r() * 60 - 30), city };
    });
  }
  function hotelsPage(params) {
    const city = D.cities.find((c) => c.id === params.get("dest")) || D.cities[0];
    let din = validDate(params.get("in")) && params.get("in") >= inDays(0) ? params.get("in") : inDays(30);
    let dout = validDate(params.get("out")) && params.get("out") > din ? params.get("out") : addDays(din, 7);
    const nights = daysBetween(din, dout), ad = clamp(+params.get("ad") || 2, 1, 6);
    document.title = `Hôtels à ${city.name} — comparez les prix | Qarin.tn`;
    const all = genHotels(city.id, din, nights);
    const BOARDS = ["All Inclusive", "Demi-pension", "Petit-déjeuner", "Logement seul"];
    const FEATS = ["Plage", "Plage privée", "Piscine", "Spa", "Club enfants", "Adultes uniquement", "Thalasso"];
    const st = { stars: new Set(["3", "4", "5"]), boards: new Set(BOARDS), feats: new Set(), max: 600, sort: "reco" };
    const booking = `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(city.name.split(" &")[0] + ", Tunisie")}&checkin=${din}&checkout=${dout}&group_adults=${ad}&no_rooms=1`;

    app.innerHTML = pageHead("🏨", `Hôtels à ${city.name}`, `${frDate(din)} → ${frDate(dout)} · ${nights} nuit${nights > 1 ? "s" : ""} · ${ad} adulte${ad > 1 ? "s" : ""}`, "Hôtels") + `
    <div class="container"><form class="page-search form-grid" id="hs">
      <div class="field"><label>Destination</label><select name="dest">${D.cities.map((c) => opt(c.id, c.name, city.id)).join("")}</select></div>
      <div class="field"><label>Arrivée</label><input type="date" name="in" value="${din}" min="${inDays(0)}"></div>
      <div class="field"><label>Départ</label><input type="date" name="out" value="${dout}" min="${inDays(1)}"></div>
      <div class="field"><label>Adultes</label><select name="ad">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n, ad)).join("")}</select></div>
      <button class="btn btn-primary">Rechercher</button>
    </form>
    <div class="layout">
      <aside class="filters"><form>
        <h3>Filtres <button type="button" data-reset>Réinitialiser</button></h3>
        <div class="fgroup"><b>Étoiles</b>${["5", "4", "3"].map((s) => `<label class="check"><input type="checkbox" name="stars" value="${s}" checked> <span class="stars">${"★".repeat(+s)}</span></label>`).join("")}</div>
        <div class="fgroup"><b>Pension</b>${checks("board", BOARDS, st.boards)}</div>
        <div class="fgroup"><b>Prix max / nuit / pers. : <span class="range-val" id="maxv">${st.max} DT</span></b><input type="range" name="max" min="60" max="600" step="10" value="${st.max}"></div>
        <div class="fgroup"><b>Équipements</b>${checks("feat", FEATS, st.feats)}</div>
      </form></aside>
      <div>
        <div class="note">ℹ️ Établissements présentés à titre d'exemple avec des <b>prix moyens estimés</b> pour la période. La disponibilité et le prix réels s'affichent chez notre partenaire de réservation.</div>
        <div class="results-bar"><div class="count" id="cnt"></div>${sortBar([["reco", "⭐ Recommandés"], ["price", "Prix"], ["rating", "Note"], ["stars", "Étoiles"]], st.sort)}<button class="btn btn-ghost toggle-filters">⚙️ Filtres</button></div>
        <div id="res"></div>
      </div>
    </div></div>`;
    $("#hs").addEventListener("submit", (e) => { e.preventDefault(); go("hotels", Object.fromEntries(new FormData(e.target).entries())); });
    const read = (f) => { st.stars = readChecks(f, "stars"); st.boards = readChecks(f, "board"); st.feats = readChecks(f, "feat"); st.max = +f.max.value; $("#maxv").textContent = st.max + " DT"; };
    const render = () => {
      const list = all.filter((h) => st.stars.has(String(h.stars)) && st.boards.has(h.board) && h.night <= st.max && [...st.feats].every((f) => h.feats.includes(f)))
        .sort({ reco: (a, b) => b.rating * 40 - b.night - (a.rating * 40 - a.night), price: (a, b) => a.night - b.night, rating: (a, b) => b.rating - a.rating, stars: (a, b) => b.stars - a.stars || a.night - b.night }[st.sort]);
      $("#cnt").innerHTML = `${list.length} hébergements <small>à ${esc(city.name)}</small>`;
      if (!list.length) { $("#res").innerHTML = emptyBox(); return; }
      const cheap = Math.min(...list.map((h) => h.night)), top = Math.max(...list.map((h) => h.rating));
      $("#res").innerHTML = list.map((h) => `
        <article class="offer hotel fade-in">
          <div class="img" style="background:linear-gradient(135deg,${h.city.g1},${h.city.g2});filter:hue-rotate(${h.hue}deg)">
            <svg viewBox="0 0 200 120" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;opacity:.35" aria-hidden="true"><circle cx="150" cy="35" r="18" fill="#fff"/><path d="M0 85 Q25 75 50 85 T100 85 T150 85 T200 85 V120 H0Z" fill="#fff"/><path d="M0 98 Q25 90 50 98 T100 98 T150 98 T200 98 V120 H0Z" fill="#fff" opacity=".6"/><path d="M40 85 C40 60 44 45 48 35 M48 35 C38 30 30 34 26 40 M48 35 C56 28 66 30 70 36 M48 35 C46 26 50 20 56 18" stroke="#fff" stroke-width="3" fill="none"/></svg>
            <span>${esc(h.type)}</span></div>
          <div class="main">
            <div class="ribbons">${h.night === cheap ? '<span class="ribbon r-best">💰 Meilleur prix</span>' : ""}${h.rating === top ? '<span class="ribbon r-ok">🏆 Mieux noté</span>' : ""}<span class="ribbon r-info">${esc(h.board)}</span></div>
            <div class="head"><div><h3>${esc(h.name)}</h3><small><span class="stars">${stars(h.stars)}</span> · ${esc(city.name)} · ${h.beach <= 150 ? (h.beach ? h.beach + " m de la plage" : "Accès direct plage") : (h.beach / 1000).toFixed(1).replace(".", ",") + " km de la plage"}</small></div>
              <div style="margin-left:auto;text-align:right">${scoreHtml(h.rating)}<br><small style="color:var(--muted)">${nf.format(h.reviews)} avis</small></div></div>
            <ul class="feats">${h.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          </div>
          <div class="side"><div><div class="price-sub">dès</div><div class="price-big">${nf.format(h.night)}<sup>DT</sup></div><div class="price-sub">/ nuit / pers.<br><b>${tnd(h.night * nights * ad)}</b> total · ${nights} nuits</div></div>
            <a class="btn btn-primary" target="_blank" rel="noopener nofollow" href="${booking}">Disponibilités →</a></div>
        </article>`).join("");
    };
    wireList(app, st, render, read);
    render();
  }

  /* =========================================================
     ASSURANCE AUTO
     ========================================================= */
  function insurancePage(params) {
    document.title = "Comparateur assurance auto Tunisie — devis estimatif | Qarin.tn";
    const st = {
      cv: clamp(+params.get("cv") || 6, 4, 20), val: clamp(+params.get("val") || 45000, 5000, 500000), f: ["rc", "tp", "tr"].includes(params.get("f")) ? params.get("f") : "tp",
      age: clamp(+params.get("age") || 35, 18, 90), lic: clamp(params.has("lic") ? +params.get("lic") : 10, 0, 70), vage: clamp(+params.get("vage") || 3, 0, 40), gov: D.governorates.includes(params.get("gov")) ? params.get("gov") : "Tunis", sort: "price"
    };
    const FORM = { rc: "Responsabilité civile", tp: "Tiers + vol / incendie", tr: "Tous risques" };
    const GUAR = ["Resp. civile", "Défense & recours", "Incendie", "Vol", "Bris de glace", "Dommages collision", "Tous dommages", "Assistance 0 km"];
    app.innerHTML = pageHead("🚗", "Assurance auto", "Estimez et comparez votre prime annuelle auprès des assureurs tunisiens.", "Assurance auto") + `
    <div class="container"><form class="page-search form-grid" id="is">
      <div class="field"><label>Puissance fiscale</label><select name="cv">${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((n) => opt(n, n + " CV", st.cv)).join("")}</select></div>
      <div class="field"><label>Valeur véhicule (DT)</label><input type="number" name="val" value="${st.val}" min="5000" step="1000"></div>
      <div class="field"><label>Âge du véhicule</label><select name="vage">${[0, 1, 2, 3, 5, 8, 10, 15].map((n) => opt(n, n ? n + " ans" : "Neuf", st.vage)).join("")}</select></div>
      <div class="field"><label>Âge conducteur</label><input type="number" name="age" value="${st.age}" min="18" max="90"></div>
      <div class="field"><label>Années de permis</label><input type="number" name="lic" value="${st.lic}" min="0" max="70"></div>
      <div class="field"><label>Gouvernorat</label><select name="gov">${D.governorates.map((g) => opt(g, g, st.gov)).join("")}</select></div>
      <div class="field"><label>Formule</label><select name="f">${Object.entries(FORM).map(([k, v]) => opt(k, v, st.f)).join("")}</select></div>
      <button class="btn btn-primary">Recalculer</button>
    </form>
    <div style="padding:24px 0 60px">
      ${DISCLAIMER}
      <div class="results-bar"><div class="count" id="cnt"></div>${sortBar([["price", "💰 Prix"], ["rating", "⭐ Satisfaction"]], st.sort)}</div>
      <div id="res"></div>
    </div></div>`;
    $("#is").addEventListener("submit", (e) => { e.preventDefault(); go("assurance-auto", Object.fromEntries(new FormData(e.target).entries())); });
    const rc = (250 + st.cv * 38) * (st.age < 25 ? 1.35 : st.age < 30 ? 1.12 : st.age > 70 ? 1.15 : 1) * (st.lic < 2 ? 1.25 : st.lic < 5 ? 1.08 : 1) * (["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax"].includes(st.gov) ? 1.1 : 1);
    const basePrem = st.f === "rc" ? rc : st.f === "tp" ? rc + st.val * 0.011 * (st.vage > 10 ? 0.7 : 1) : rc + st.val * 0.034 * (st.vage > 8 ? 0.8 : 1);
    const all = D.insurers.map((ins, i) => {
      const r = rng(hashStr(ins.p + st.cv + st.val + st.f + st.age + st.gov));
      const price = Math.round(basePrem * ins.f * (0.96 + r() * 0.08));
      const on = new Set(["Resp. civile", "Défense & recours"]);
      if (st.f !== "rc") { on.add("Incendie"); on.add("Vol"); }
      if (st.f === "tr") { on.add("Dommages collision"); on.add("Tous dommages"); on.add("Bris de glace"); }
      if (ins.f >= 1.04 || ins.feats.some((f) => f.includes("Bris"))) on.add("Bris de glace");
      if (ins.feats.some((f) => f.includes("24/7"))) on.add("Assistance 0 km");
      return { id: "ins" + i, p: ins.p, name: FORM[st.f], price, rating: ins.rating, claims: ins.claims, feats: ins.feats, on };
    });
    cmpSetup("assurance", "assurance auto", [
      ["Prime annuelle", (o) => ({ n: o.price, t: tnd(o.price) }), "min"], ["Par mois", (o) => ({ n: o.price, t: tnd(o.price / 12) }), "min"],
      ["Satisfaction", (o) => ({ n: o.rating, t: o.rating.toFixed(1) + " / 5" }), "max"], ["Délai moyen d'indemnisation", (o) => o.claims],
      ...GUAR.map((g) => [g, (o) => ({ n: o.on.has(g) ? 1 : 0, t: o.on.has(g) ? "✅" : "—" })])
    ]);
    cmpPool(all);
    const render = () => {
      const list = all.slice().sort(st.sort === "price" ? (a, b) => a.price - b.price : (a, b) => b.rating - a.rating);
      const cheap = Math.min(...list.map((o) => o.price)), max = Math.max(...list.map((o) => o.price));
      $("#cnt").innerHTML = `${list.length} assureurs <small>· ${FORM[st.f]} · économie possible jusqu'à <b style="color:var(--ok)">${tnd(max - cheap)}</b>/an</small>`;
      $("#res").innerHTML = list.map((o) => `
        <article class="offer fade-in ${o.price === cheap ? "top1" : ""}">
          <div class="main">
            <div class="ribbons">${o.price === cheap ? '<span class="ribbon r-best">💰 Prime la plus basse</span>' : ""}${o.rating === Math.max(...list.map((x) => x.rating)) ? '<span class="ribbon r-ok">🏆 Clients les plus satisfaits</span>' : ""}</div>
            <div class="head">${badge(o.p)}<div><h3>${esc(o.p)}</h3><small>${esc(o.name)} · indemnisation ~${o.claims}</small></div><div style="margin-left:auto"><span class="score"><span class="pill">${o.rating.toFixed(1)}</span><small>/ 5</small></span></div></div>
            <div class="ins-guar" style="margin-bottom:10px">${GUAR.map((g) => `<span class="${o.on.has(g) ? "on" : ""}">${o.on.has(g) ? "✓" : "✕"} ${g}</span>`).join("")}</div>
            <ul class="feats">${o.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          </div>
          <div class="side"><div><div class="price-big">${nf.format(o.price)}<sup>DT/an</sup></div><div class="price-sub">soit ${tnd(o.price / 12)} / mois</div></div>
            <a class="btn btn-primary" target="_blank" rel="noopener nofollow" href="${purl(o.p)}">Demander un devis →</a>${cmpChk(o.id)}</div>
        </article>`).join("");
    };
    app.addEventListener("click", (e) => { const s = e.target.closest("[data-sort]"); if (s) { st.sort = s.dataset.sort; $$("[data-sort]", app).forEach((b) => b.classList.toggle("active", b === s)); render(); } });
    render();
  }

  /* =========================================================
     LOCATION VOITURE
     ========================================================= */
  function carPage(params) {
    document.title = "Location de voiture en Tunisie — comparez les loueurs | Qarin.tn";
    const spot = D.rentalSpots.includes(params.get("spot")) ? params.get("spot") : D.rentalSpots[0];
    const start = validDate(params.get("start")) && params.get("start") >= inDays(0) ? params.get("start") : inDays(14);
    const end = validDate(params.get("end")) && params.get("end") > start ? params.get("end") : addDays(start, 7);
    const days = daysBetween(start, end), young = params.get("young") === "1";
    const season = [0.8, 0.8, 0.9, 1, 1.05, 1.25, 1.5, 1.55, 1.15, 1, 0.85, 1.1][new Date(start + "T00:00:00").getMonth()];
    const CATS = D.carCats.map((c) => c.name), AG = D.rentals.map((a) => a.p);
    const all = [];
    D.carCats.forEach((c) => D.rentals.forEach((a) => {
      const r = rng(hashStr(c.id + a.p + spot + start));
      if (r() < 0.22) return; // tous les loueurs n'ont pas toutes les catégories
      const day = Math.round(c.base * a.f * season * (0.9 + r() * 0.25) * (days >= 7 ? 0.88 : days >= 3 ? 0.95 : 1) + (young ? 15 : 0));
      all.push({ id: c.id + a.p, p: a.p, name: c.name, cat: c, day, total: day * days, feats: a.feats, franchise: a.franchise, auto: c.id === "lux" || c.id === "suv" ? r() < 0.7 : r() < 0.25 });
    }));
    const st = { cats: new Set(CATS), ags: new Set(AG), auto: false, sort: "price" };
    app.innerHTML = pageHead("🔑", "Location de voiture", `${spot} · ${frDate(start)} → ${frDate(end)} · ${days} jour${days > 1 ? "s" : ""}`, "Location voiture") + `
    <div class="container"><form class="page-search form-grid" id="cs">
      <div class="field"><label>Lieu de prise</label><select name="spot">${D.rentalSpots.map((s) => opt(s, s, spot)).join("")}</select></div>
      <div class="field"><label>Prise</label><input type="date" name="start" value="${start}" min="${inDays(0)}"></div>
      <div class="field"><label>Retour</label><input type="date" name="end" value="${end}" min="${inDays(1)}"></div>
      <div class="field"><label>Conducteur</label><select name="young">${opt("0", "25 ans et plus", young ? "1" : "0")}${opt("1", "Moins de 25 ans", young ? "1" : "0")}</select></div>
      <button class="btn btn-primary">Rechercher</button>
    </form>
    <div class="layout">
      <aside class="filters"><form>
        <h3>Filtres <button type="button" data-reset>Réinitialiser</button></h3>
        <div class="fgroup"><b>Catégorie</b>${checks("cat", CATS, st.cats)}</div>
        <div class="fgroup"><b>Boîte</b><label class="check"><input type="checkbox" name="auto"> Automatique uniquement</label></div>
        <div class="fgroup"><b>Loueurs</b>${checks("ag", AG, st.ags)}</div>
      </form></aside>
      <div>${DISCLAIMER}
        <div class="results-bar"><div class="count" id="cnt"></div>${sortBar([["price", "💰 Prix"], ["franchise", "🛡️ Franchise"]], st.sort)}<button class="btn btn-ghost toggle-filters">⚙️ Filtres</button></div>
        <div id="res"></div></div>
    </div></div>`;
    $("#cs").addEventListener("submit", (e) => { e.preventDefault(); go("location-voiture", Object.fromEntries(new FormData(e.target).entries())); });
    const read = (f) => { st.cats = readChecks(f, "cat"); st.ags = readChecks(f, "ag"); st.auto = f.auto.checked; };
    const render = () => {
      const list = all.filter((o) => st.cats.has(o.name) && st.ags.has(o.p) && (!st.auto || o.auto)).sort(st.sort === "price" ? (a, b) => a.day - b.day : (a, b) => a.franchise - b.franchise || a.day - b.day);
      $("#cnt").innerHTML = `${list.length} véhicules <small>disponibles</small>`;
      if (!list.length) { $("#res").innerHTML = emptyBox(); return; }
      const cheap = Math.min(...list.map((o) => o.day));
      $("#res").innerHTML = list.map((o) => `
        <article class="offer fade-in ${o.day === cheap ? "top1" : ""}">
          <div class="main">
            <div class="ribbons">${o.day === cheap ? '<span class="ribbon r-best">💰 Le moins cher</span>' : ""}<span class="ribbon r-info">${o.auto ? "Automatique" : "Manuelle"}</span></div>
            <div class="head">${badge(o.p)}<div><h3>${esc(o.name)} <small style="font-weight:500">ou similaire</small></h3><small>${esc(o.cat.ex)} · ${esc(o.p)}</small></div></div>
            <div class="specs"><div class="spec"><small>Places</small><b>${o.cat.seats}</b></div><div class="spec"><small>Bagages</small><b>${o.cat.bags}</b></div><div class="spec"><small>Franchise</small><b>${tnd(o.franchise)}</b></div><div class="spec"><small>Clim</small><b>Oui</b></div></div>
            <ul class="feats">${o.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          </div>
          <div class="side"><div><div class="price-big">${nf.format(o.day)}<sup>DT/jour</sup></div><div class="price-sub"><b>${tnd(o.total)}</b> pour ${days} jour${days > 1 ? "s" : ""}</div></div>
            <a class="btn btn-primary" target="_blank" rel="noopener nofollow" href="${purl(o.p)}">Réserver →</a></div>
        </article>`).join("");
    };
    wireList(app, st, render, read);
    render();
  }

  /* =========================================================
     PAGES STATIQUES
     ========================================================= */
  function aboutPage() {
    document.title = "À propos — Qarin.tn";
    app.innerHTML = pageHead("💡", "À propos de Qarin.tn", "Notre mission : rendre les prix transparents en Tunisie.", "À propos") + `<div class="container"><div class="prose">
      <h2>Notre mission</h2><p><b>Qarin</b> (قارن, « compare ! ») aide les consommateurs tunisiens à comparer en quelques secondes les offres Internet, mobiles, voyages, assurances et location de voiture. Un seul endroit, des critères clairs, aucune inscription.</p>
      <h2>Comment nous classons les offres</h2><p>Par défaut, les offres sont triées par <b>score Qarin</b>, un indicateur qualité/prix calculé de la même façon pour tous les fournisseurs. Vous pouvez à tout moment trier par prix, débit, durée ou note. Aucun fournisseur ne peut acheter une meilleure place dans le classement.</p>
      <h2>Comment le site est financé</h2><p>Le service est gratuit. À terme, Qarin.tn pourra percevoir une commission de certains partenaires lorsqu'une souscription est réalisée via le site. Cette commission n'a aucun impact sur le prix que vous payez ni sur le classement.</p>
      <h2>Fiabilité des données</h2><p>Les tarifs sont des <b>estimations indicatives</b> établies à partir des grilles publiques des fournisseurs et de modèles de saisonnalité (vols, hôtels, location). Ils sont mis à jour régulièrement mais peuvent différer du prix final : vérifiez toujours l'offre sur le site du fournisseur avant de souscrire.</p>
      <h2>Vous êtes fournisseur ?</h2><p>Opérateurs, assureurs, hôtels, agences : pour faire corriger ou ajouter une offre, contactez-nous via la page GitHub du projet.</p>
    </div></div>`;
  }
  function legalPage() {
    document.title = "Mentions légales — Qarin.tn";
    app.innerHTML = pageHead("📄", "Mentions légales & confidentialité", "Informations légales et protection des données.", "Mentions légales") + `<div class="container"><div class="prose">
      <h2>Éditeur</h2><p>Qarin.tn est un service de comparaison indépendant. Il n'est affilié à aucun des fournisseurs cités. Les noms de marques cités appartiennent à leurs propriétaires respectifs et ne sont utilisés qu'à des fins d'identification.</p>
      <h2>Données personnelles</h2><p>Le site ne demande aucune inscription et ne collecte aucune donnée personnelle. Vos critères de recherche sont traités uniquement dans votre navigateur. Aucun cookie publicitaire n'est utilisé.</p>
      <h2>Liens externes</h2><p>Les boutons « Voir l'offre » vous redirigent vers les sites des fournisseurs ou de partenaires de réservation, qui appliquent leurs propres conditions et politiques de confidentialité.</p>
      <h2>Responsabilité</h2><p>Les informations sont fournies à titre indicatif. Qarin.tn ne saurait être tenu responsable d'un écart entre les prix affichés et les prix pratiqués par les fournisseurs.</p>
    </div></div>`;
  }
  function notFound() {
    document.title = "Page introuvable — Qarin.tn";
    app.innerHTML = `<div class="container" style="padding:80px 0;text-align:center"><h1 style="font-size:60px;margin:0">404</h1><p>Cette page n'existe pas.</p><a class="btn btn-primary" href="#/">Retour à l'accueil</a></div>`;
  }

  /* ---------- routeur ---------- */
  const routes = { "": home, internet: internetPage, mobile: mobilePage, vols: flightsPage, hotels: hotelsPage, "assurance-auto": insurancePage, "location-voiture": carPage, "a-propos": aboutPage, mentions: legalPage };
  function router() {
    const h = location.hash.replace(/^#\/?/, "");
    const [path, qs] = h.split("?");
    const fn = routes[path] || notFound;
    cmp.cat = null; cmp.ids = [];
    const fresh = app.cloneNode(false); app.replaceWith(fresh); app = fresh; // supprime les anciens listeners
    try { fn(new URLSearchParams(qs || "")); } catch (err) { console.error(err); notFound(); }
    renderCmpBar();
    $$("nav.main a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#/" + path && path !== ""));
    $("nav.main").classList.remove("open");
    window.scrollTo(0, 0);
  }

  $("#cmpGo").addEventListener("click", openCompare);
  $("#cmpClear").addEventListener("click", () => { cmp.ids = []; $$("[data-cmp]").forEach((c) => (c.checked = false)); renderCmpBar(); });
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal" || e.target.closest(".close")) $("#modal").classList.remove("show"); });
  document.addEventListener("keydown", (e) => e.key === "Escape" && $("#modal").classList.remove("show"));
  $(".burger").addEventListener("click", () => $("nav.main").classList.toggle("open"));
  $("#year").textContent = new Date().getFullYear();
  window.addEventListener("hashchange", router);
  router();
})();
