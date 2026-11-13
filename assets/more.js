/* Qarin.tn — comparateurs supplémentaires : vitesse réelle, transport, assurance voyage, Omra,
   panier (Qoffa), high-tech, solaire, calculateur FCR. S'appuie sur l'API interne window.Q. */
(function (Q) {
  "use strict";
  const { D, $, $$, esc, nf, tnd, eur, f2, clamp, rng, hashStr, inDays, frDate, pad, LS, icon, badge, purl, opt, go, note, feats, meter, spec, yes, pageHead, listPage, toast, minBy, scenCard, recapTable, C } = Q;
  const R = Q.routes;
  const FUEL = 2.5;
  const durH = (h) => Math.floor(h) + " h " + pad(Math.round((h % 1) * 60));
  const submitTo = (sel, route, clean) => $(sel).addEventListener("submit", (e) => { e.preventDefault(); const p = Object.fromEntries(new FormData(e.target).entries()); if (clean) Object.keys(p).forEach((k) => p[k] === "" && delete p[k]); go(route, p); });
  const stepBadge = (txt, color) => `<div class="pbadge" style="background:${color}" aria-hidden="true">${esc(txt)}</div>`;

  /* =========================================================
     TRANSPORT INTERURBAIN : louage, train, bus, voiture
     ========================================================= */
  function townKm(a, b) {
    const A = D.towns.find((t) => t[0] === a), B = D.towns.find((t) => t[0] === b), r = (x) => (x * Math.PI) / 180;
    const h = Math.sin(r(B[1] - A[1]) / 2) ** 2 + Math.cos(r(A[1])) * Math.cos(r(B[1])) * Math.sin(r(B[2] - A[2]) / 2) ** 2;
    return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)) * 1.25);
  }
  R.transport = function (params, path) {
    const names = D.towns.map((t) => t[0]);
    const from = names.includes(params.get("from")) ? params.get("from") : "Tunis";
    let to = names.includes(params.get("to")) ? params.get("to") : "Sousse"; if (to === from) to = from === "Tunis" ? "Sousse" : "Tunis";
    const pax = clamp(+params.get("pax") || 1, 1, 8), ret = params.get("ret") === "1", mult = ret ? 2 : 1;
    const km = townKm(from, to), hw = D.highwayTowns.includes(from) && D.highwayTowns.includes(to);
    document.title = `${from} → ${to} : louage, train ou bus ? | Qarin.tn`;
    const half = (x) => Math.round(x * 2) / 2;
    const items = [
      { id: "louage", p: "Louage", name: "Louage", per: half(1 + km * 0.078), hours: km / 85 + 0.4, freq: "Départ dès que le louage est plein", comfort: 2.5, co2: 0.03 * km, feats: ["Départs fréquents", "Stations en centre-ville"] },
      { id: "bus", p: "Bus SNTRI", name: "Bus interurbain", per: half(1 + km * 0.066), hours: km / 68 + 0.3, freq: "Plusieurs départs par jour", comfort: 3, co2: 0.025 * km, feats: ["Place assise garantie", "Bagages en soute"] }
    ];
    if (D.trainTowns.includes(from) && D.trainTowns.includes(to)) {
      items.push({ id: "train2", p: "Train SNCFT", name: "Train · 2ᵉ classe", per: half(1 + km * 0.06), hours: km / 70 + 0.25, freq: "Horaires fixes", comfort: 3.8, co2: 0.015 * km, feats: ["Pas d'embouteillages", "Bagages libres"] });
      items.push({ id: "train1", p: "Train SNCFT", name: "Train · 1ʳᵉ / Confort", per: half(1.5 + km * 0.088), hours: km / 70 + 0.25, freq: "Horaires fixes", comfort: 4.5, co2: 0.015 * km, feats: ["Sièges confort", "Climatisation"] });
    }
    const fuel = km * 0.07 * FUEL, toll = hw ? km * 0.022 : 0;
    items.push({ id: "car", p: "Votre voiture", name: "Votre voiture", per: (fuel + toll) / pax, car: true, fuel, toll, hours: km / (hw ? 95 : 75), freq: "Quand vous voulez", comfort: 5, co2: (0.12 * km) / pax, feats: [hw ? "Autoroute (péage estimé inclus)" : "Routes nationales", "Porte-à-porte"] });
    items.forEach((it) => (it.total = (it.car ? it.fuel + it.toll : it.per * pax) * mult));
    const maps = `https://www.google.com/maps/dir/${encodeURIComponent(from + ", Tunisie")}/${encodeURIComponent(to + ", Tunisie")}`;
    const form = `<form class="page-search form-grid" id="trs">
      <div class="field"><label>Départ</label><select name="from">${names.map((n) => opt(n, n, from)).join("")}</select></div>
      <div class="field"><label>Arrivée</label><select name="to">${names.map((n) => opt(n, n, to)).join("")}</select></div>
      <div class="field"><label>Voyageurs</label><select name="pax">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n, pax)).join("")}</select></div>
      <div class="field"><label>Trajet</label><select name="ret">${opt("0", "Aller simple", ret ? "1" : "0")}${opt("1", "Aller-retour", ret ? "1" : "0")}</select></div>
      <button class="btn btn-primary">${icon("search")}Comparer</button></form>`;
    listPage({
      key: "transport", icon: "bus", title: `${from} → ${to}`, crumb: "Transport", cmpTitle: "transport", unit: "options",
      sub: `≈ ${km} km · ${pax} voyageur${pax > 1 ? "s" : ""} · ${ret ? "aller-retour" : "aller simple"}${hw ? " · autoroute" : ""}`,
      searchForm: form, items, label: (it) => it.name, sublabel: (it) => it.p,
      note: "<b>Tarifs et durées estimés</b> (démonstration). Les tarifs officiels du louage, du train et du bus sont fixés par les autorités et les sociétés de transport : vérifiez-les avant de partir.",
      price: (it) => it.total, costLabel: "sur le trajet",
      perf: { label: "Le plus rapide", icon: "zap", get: (it) => -it.hours, text: (it) => durH(it.hours) },
      criteria: [{ k: "price", label: "Prix", get: (it) => it.total, better: "min", def: 4 }, { k: "time", label: "Durée", get: (it) => it.hours, better: "min", def: 3 }, { k: "comfort", label: "Confort", get: (it) => it.comfort, better: "max", def: 2 }, { k: "co2", label: "Écologie (CO₂)", get: (it) => it.co2, better: "min", def: 1 }],
      presets: [{ label: "Économique", w: { price: 5, time: 1, comfort: 0, co2: 0 } }, { label: "Rapide", w: { price: 1, time: 5, comfort: 1, co2: 0 } }, { label: "Confort", w: { price: 1, time: 2, comfort: 5, co2: 0 } }, { label: "Écologique", w: { price: 2, time: 1, comfort: 1, co2: 5 } }],
      filters: [{ key: "mode", type: "checks", label: "Modes de transport", options: [...new Set(items.map((i) => i.p))], get: (it) => it.p }],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix", (a, b) => a.total - b.total, "tag"], ["time", "Durée", (a, b) => a.hours - b.hours, "clock"]],
      ribbons: (it) => (it.co2 === Math.min(...items.map((x) => x.co2)) ? `<span class="ribbon r-ok">${icon("check")}Le plus écologique</span>` : ""),
      card: (it) => `<div class="head">${badge(it.p)}<div><h3>${esc(it.name)}</h3><small>${esc(it.freq)}</small></div></div>
        <div class="meters">${meter("Confort", (it.comfort / 5) * 100, it.comfort.toFixed(1) + " / 5")}</div>
        <div class="specs">${spec("Durée", durH(it.hours))}${spec("Distance", km + " km")}${spec(it.car ? "Coût voiture" : "Prix / pers.", tnd(it.car ? it.fuel + it.toll : it.per))}${spec("CO₂ / pers.", Math.round(it.co2) + " kg")}</div>${feats(it.feats)}`,
      details: (it) => it.car ? `<table><tr><td>Carburant (${km} km × 7 L/100 × ${f2(FUEL)} DT)</td><td>${tnd(it.fuel)}</td></tr><tr><td>Péage autoroute (estimé)</td><td>${tnd(it.toll)}</td></tr><tr class="total"><td>Total ${ret ? "aller-retour" : "aller"}</td><td>${tnd(it.total)}</td></tr><tr><td>Par passager (${pax})</td><td>${tnd(it.total / pax)}</td></tr></table>` : `<table><tr><td>Prix par passager</td><td>${tnd(it.per)}</td></tr><tr><td>× ${pax} voyageur${pax > 1 ? "s" : ""}${ret ? " × 2 trajets" : ""}</td><td></td></tr><tr class="total"><td>Total</td><td>${tnd(it.total)}</td></tr></table>`,
      side: (it) => `<div><div class="price-big">${f2(it.total).replace(",00", "")}<sup>DT</sup></div><div class="price-sub">${ret ? "aller-retour" : "aller"} · ${pax} pers.<br><b>${durH(it.hours)}</b></div></div>`,
      cta: "Voir le trajet", url: (it) => (purl(it.p) !== "#" ? purl(it.p) : maps), fav: (it) => ({ title: `${from} → ${to} · ${it.name}`, sub: `${km} km · ${durH(it.hours)}`, price: tnd(it.total) }),
      compare: [{ g: "Prix" }, ["Total", (it) => ({ n: it.total, t: tnd(it.total) }), "min"], ["Par personne", (it) => ({ n: it.total / pax, t: tnd(it.total / pax) }), "min"], { g: "Trajet" }, ["Durée", (it) => ({ n: it.hours, t: durH(it.hours) }), "min"], ["Fréquence", (it) => it.freq], ["Confort", (it) => ({ n: it.comfort, t: it.comfort.toFixed(1) + " / 5" }), "max"], ["CO₂ / pers.", (it) => ({ n: Math.round(it.co2), t: Math.round(it.co2) + " kg" }), "min"]],
      after: () => submitTo("#trs", "transport")
    }, params, path);
  };

  /* =========================================================
     ASSURANCE VOYAGE (visa Schengen, monde)
     ========================================================= */
  R["assurance-voyage"] = function (params, path) {
    document.title = "Assurance voyage & visa Schengen — comparez | Qarin.tn";
    const days = clamp(+params.get("days") || 15, 1, 365), age = clamp(+params.get("age") || 35, 0, 99), pax = clamp(+params.get("pax") || 1, 1, 8);
    const zone = D.travelZones[params.get("zone")] ? params.get("zone") : "schengen";
    const base = days <= 7 ? 35 : days <= 15 ? 55 : days <= 31 ? 80 : days <= 92 ? 160 : days <= 180 ? 260 : 380;
    const ageF = age < 18 ? 0.8 : age < 65 ? 1 : age <= 75 ? 1.8 : 2.8;
    const items = D.insurers.map((ins, i) => {
      const r = rng(hashStr(ins.p + days + zone + age)), tier = ins.f >= 1.04 ? 3 : ins.f >= 0.98 ? 2 : 1, cover = [30000, 50000, 100000][tier - 1];
      return { id: "tv" + i, p: ins.p, name: "Assurance voyage", price: Math.round(base * D.travelZones[zone].f * ageF * ins.f * (0.93 + r() * 0.14)) * pax, cover, bag: tier >= 2, rc: tier >= 2, sport: tier === 3, multi: r() < 0.6, rating: ins.rating, feats: ["Frais médicaux " + nf.format(cover) + " €", "Rapatriement sanitaire", "Attestation pour le visa"] };
    });
    const form = `<form class="page-search form-grid" id="tvs">
      <div class="field"><label>Destination</label><select name="zone">${Object.entries(D.travelZones).map(([k, v]) => opt(k, v.label, zone)).join("")}</select></div>
      <div class="field"><label>Durée (jours)</label><input type="number" name="days" value="${days}" min="1" max="365"></div>
      <div class="field"><label>Âge du voyageur</label><input type="number" name="age" value="${age}" min="0" max="99"></div>
      <div class="field"><label>Voyageurs</label><select name="pax">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n, pax)).join("")}</select></div>
      <button class="btn btn-primary">${icon("search")}Comparer</button></form>`;
    listPage({
      key: "assurance-voyage", icon: "umbrella", title: "Assurance voyage", crumb: "Assurance voyage", cmpTitle: "assurance voyage", unit: "assureurs",
      sub: `${D.travelZones[zone].label} · ${days} jours · ${pax} voyageur${pax > 1 ? "s" : ""} de ${age} ans`, searchForm: form, items,
      label: (o) => o.p, sublabel: (o) => nf.format(o.cover) + " € de frais médicaux",
      note: "<b>Primes estimées (démonstration).</b> Pour un visa Schengen, l'assurance doit couvrir au moins <b>30 000 €</b> de frais médicaux et de rapatriement sur toute la durée du séjour — vérifiez les exigences du consulat. Qarin.tn n'est pas intermédiaire d'assurance.",
      price: (o) => o.price, costLabel: "sur le voyage",
      perf: { label: "La meilleure couverture", icon: "shield", get: (o) => o.cover + (o.bag ? 1 : 0) + (o.rc ? 1 : 0), text: (o) => nf.format(o.cover) + " € de frais médicaux" },
      criteria: [{ k: "price", label: "Prix", get: (o) => o.price, better: "min", def: 4 }, { k: "cover", label: "Niveau de couverture", get: (o) => o.cover, better: "max", def: 3 }, { k: "extras", label: "Garanties en plus", get: (o) => +o.bag + +o.rc + +o.sport, better: "max", def: 2 }, { k: "rating", label: "Satisfaction", get: (o) => o.rating, better: "max", def: 1 }],
      presets: [{ label: "Juste pour le visa", w: { price: 5, cover: 1, extras: 0, rating: 1 } }, { label: "Bien couvert", w: { price: 2, cover: 5, extras: 4, rating: 2 } }],
      filters: [{ key: "bag", type: "toggle", label: "Bagages couverts", test: (o) => o.bag }, { key: "rc", type: "toggle", label: "Responsabilité civile", test: (o) => o.rc }, { key: "multi", type: "toggle", label: "Multi-entrées", test: (o) => o.multi }, { key: "ins", type: "checks", label: "Assureurs", options: items.map((o) => o.p), get: (o) => o.p }],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix", (a, b) => a.price - b.price, "tag"], ["cover", "Couverture", (a, b) => b.cover - a.cover, "shield"]],
      ribbons: () => `<span class="ribbon r-ok">${icon("check")}Conforme visa Schengen</span>`,
      card: (o) => `<div class="head">${badge(o.p)}<div><h3>${esc(o.p)}</h3><small>Frais médicaux jusqu'à ${nf.format(o.cover)} €</small></div></div>
        <div class="ins-guar">${[["Frais médicaux", true], ["Rapatriement", true], ["Bagages", o.bag], ["Resp. civile", o.rc], ["Sports & loisirs", o.sport], ["Multi-entrées", o.multi]].map(([g, on]) => `<span class="${on ? "on" : ""}">${icon(on ? "check" : "x")}${g}</span>`).join("")}</div>${feats(o.feats)}`,
      side: (o) => `<div><div class="price-big">${nf.format(o.price)}<sup>DT</sup></div><div class="price-sub">${days} jours · ${pax} pers.<br><b>${tnd(o.price / days)}</b> / jour</div></div>`,
      cta: "Site de l'assureur", url: (o) => purl(o.p), fav: (o) => ({ title: o.p + " · voyage", sub: `${D.travelZones[zone].label} · ${days} j`, price: tnd(o.price) }),
      compare: [{ g: "Prix" }, ["Prime totale", (o) => ({ n: o.price, t: tnd(o.price) }), "min"], { g: "Garanties" }, ["Frais médicaux", (o) => ({ n: o.cover, t: nf.format(o.cover) + " €" }), "max"], ["Rapatriement", () => yes(true), "max", false], ["Bagages", (o) => yes(o.bag), "max", false], ["Responsabilité civile", (o) => yes(o.rc), "max", false], ["Sports & loisirs", (o) => yes(o.sport), "max", false], ["Multi-entrées", (o) => yes(o.multi), "max", false], ["Satisfaction", (o) => ({ n: o.rating, t: o.rating.toFixed(1) + " / 5" }), "max"]],
      after: () => submitTo("#tvs", "assurance-voyage")
    }, params, path);
  };

  /* =========================================================
     OMRA (formules types — agences non nommées en démo)
     ========================================================= */
  R.omra = function (params, path) {
    document.title = "Omra — comparez les formules des agences | Qarin.tn";
    const room = ["4", "3", "2"].includes(params.get("room")) ? params.get("room") : "4", ram = params.get("ram") === "1", pax = clamp(+params.get("pax") || 2, 1, 8);
    const roomF = { 4: 1, 3: 1.08, 2: 1.2 }[room], COLORS = ["#047857", "#0e7490", "#7c3aed", "#b45309"];
    const items = [];
    D.omraFormulas.forEach((f) => D.omraAgencies.forEach((a, ai) => {
      const r = rng(hashStr(f.id + a + room + ram)); if (r() < 0.3) return;
      items.push({ id: f.id + "-" + a, p: "Agence " + a, short: a, color: COLORS[ai], name: f.name, f, per: Math.round((f.base * roomF * (ram ? 1.35 : 1) * (0.92 + r() * 0.16)) / 10) * 10, visa: true });
    }));
    items.forEach((it) => (it.total = it.per * pax));
    const form = `<form class="page-search form-grid" id="oms">
      <div class="field"><label>Période</label><select name="ram">${opt("0", "Hors Ramadan", ram ? "1" : "0")}${opt("1", "Pendant le Ramadan", ram ? "1" : "0")}</select></div>
      <div class="field"><label>Chambre</label><select name="room">${opt("4", "Quadruple", room)}${opt("3", "Triple", room)}${opt("2", "Double", room)}</select></div>
      <div class="field"><label>Pèlerins</label><select name="pax">${[1, 2, 3, 4, 5, 6].map((n) => opt(n, n, pax)).join("")}</select></div>
      <button class="btn btn-primary">${icon("search")}Comparer</button></form>`;
    listPage({
      key: "omra", icon: "moon", title: "Omra", crumb: "Omra", cmpTitle: "Omra", unit: "formules",
      sub: `${ram ? "Pendant le Ramadan" : "Hors Ramadan"} · chambre ${{ 4: "quadruple", 3: "triple", 2: "double" }[room]} · ${pax} pèlerin${pax > 1 ? "s" : ""}`, searchForm: form, items,
      label: (it) => `${it.name} · ${it.p}`, sublabel: (it) => `${it.f.days} jours · hôtel ${it.f.stars}★`,
      top: `<div class="assist"><div><b>${icon("info")}Et le Hajj ?</b><small>En Tunisie, le Hajj passe par un tirage au sort et un cadre fixé par les autorités : il n'est donc pas comparé ici. Renseignez-vous auprès du ministère des Affaires religieuses.</small></div></div>`,
      note: "<b>Formules types de démonstration</b> — les agences sont anonymisées en attendant des partenariats avec des agences de voyage agréées. Vérifiez toujours l'agrément de l'agence avant de payer.",
      price: (it) => it.per, cost: (it) => it.total, costLabel: "pour le groupe",
      perf: { label: "Le plus proche du Haram", icon: "pin", get: (it) => -it.f.dist, text: (it) => it.f.dist + " m · hôtel " + it.f.stars + "★" },
      criteria: [{ k: "price", label: "Prix", get: (it) => it.per, better: "min", def: 4 }, { k: "dist", label: "Proximité du Haram", get: (it) => it.f.dist, better: "min", def: 3 }, { k: "stars", label: "Catégorie d'hôtel", get: (it) => it.f.stars, better: "max", def: 2 }, { k: "direct", label: "Vol direct", get: (it) => +it.f.direct, better: "max", def: 1 }],
      presets: [{ label: "Économique", w: { price: 5, dist: 1, stars: 0, direct: 0 } }, { label: "Proche du Haram", w: { price: 2, dist: 5, stars: 2, direct: 1 } }, { label: "Confort", w: { price: 1, dist: 3, stars: 5, direct: 3 } }],
      filters: [{ key: "stars", type: "checks", label: "Hôtel", options: [["5", "5 étoiles"], ["4", "4 étoiles"], ["3", "3 étoiles"]], get: (it) => it.f.stars }, { key: "direct", type: "toggle", label: "Vol direct", test: (it) => it.f.direct }, { key: "dist", type: "select", label: "Distance du Haram", options: [[5000, "Peu importe"], [1000, "≤ 1 km"], [500, "≤ 500 m"], [200, "≤ 200 m"]], def: "5000", test: (it, v) => it.f.dist <= +v, chip: (v) => `≤ ${v} m du Haram` }, { key: "ag", type: "checks", label: "Agences", options: D.omraAgencies.map((a) => "Agence " + a), get: (it) => it.p }],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix", (a, b) => a.per - b.per, "tag"], ["dist", "Proximité", (a, b) => a.f.dist - b.f.dist, "pin"]],
      ribbons: (it) => (it.f.direct ? `<span class="ribbon r-info">${icon("plane")}Vol direct</span>` : "") + `<span class="ribbon r-info">${esc(it.f.meals)}</span>`,
      card: (it) => `<div class="head">${stepBadge(it.short, it.color)}<div><h3>${esc(it.name)}</h3><small>${esc(it.p)} (agréée) · ${it.f.days} jours</small></div></div>
        <div class="meters">${meter("Proximité", 100 - (it.f.dist / 1200) * 100, it.f.dist + " m")}</div>
        <div class="specs">${spec("Durée", it.f.days + " jours")}${spec("Hôtel", it.f.stars + "★")}${spec("Vol", it.f.direct ? "Direct" : "Avec escale")}${spec("Repas", esc(it.f.meals))}</div>${feats(["Visa inclus", "Transferts inclus", "Accompagnateur"])}`,
      side: (it) => `<div><div class="price-big">${nf.format(it.per)}<sup>DT</sup></div><div class="price-sub">par pèlerin<br><b>${tnd(it.total)}</b> pour ${pax}</div></div>`,
      cta: "Bientôt disponible", url: () => "#/donnees", fav: (it) => ({ title: `Omra · ${it.name}`, sub: `${it.p} · ${it.f.days} j`, price: tnd(it.per) }),
      compare: [{ g: "Prix" }, ["Par pèlerin", (it) => ({ n: it.per, t: tnd(it.per) }), "min"], ["Total", (it) => ({ n: it.total, t: tnd(it.total) }), "min"], { g: "Séjour" }, ["Durée", (it) => it.f.days + " jours"], ["Hôtel", (it) => ({ n: it.f.stars, t: it.f.stars + "★" }), "max"], ["Distance du Haram", (it) => ({ n: it.f.dist, t: it.f.dist + " m" }), "min"], ["Vol direct", (it) => yes(it.f.direct), "max", false], ["Repas", (it) => it.f.meals]],
      after: () => submitTo("#oms", "omra")
    }, params, path);
  };

  /* =========================================================
     HIGH-TECH : un produit, plusieurs boutiques
     ========================================================= */
  R["high-tech"] = function (params, path) {
    const prod = D.techProducts.find((p) => p.id === params.get("p")) || D.techProducts[0];
    document.title = `${prod.n} — meilleur prix en Tunisie | Qarin.tn`;
    const items = D.techStores.map((s, i) => {
      const r = rng(hashStr(prod.id + s.p)); if (r() < 0.12) return null;
      const price = Math.round((prod.base * s.f * (0.95 + r() * 0.1)) / 10) * 10 - 1, promo = r() < 0.3;
      return { id: "ht" + i, p: s.p, name: prod.n, price, old: promo ? Math.round(price * 1.12 / 10) * 10 - 1 : 0, ship: price > 300 ? 0 : s.ship, days: s.days, dmin: parseInt(s.days), facility: s.facility, warranty: s.warranty, stock: r() < 0.85 };
    }).filter(Boolean);
    items.forEach((it) => (it.total = it.price + it.ship));
    const cats = [...new Set(D.techProducts.map((p) => p.cat))];
    const form = `<form class="page-search form-grid" id="hts"><div class="field" style="grid-column:span 2"><label>Produit</label><select name="p">${cats.map((c) => `<optgroup label="${esc(c)}">${D.techProducts.filter((p) => p.cat === c).map((p) => opt(p.id, p.n, prod.id)).join("")}</optgroup>`).join("")}</select></div><button class="btn btn-primary">${icon("search")}Comparer les boutiques</button></form>`;
    listPage({
      key: "high-tech", icon: "laptop", title: prod.n, crumb: "High-tech", cmpTitle: "boutiques", unit: "boutiques",
      sub: `${prod.cat} · prix comparés entre boutiques tunisiennes`, searchForm: form, items, label: (it) => it.p, sublabel: (it) => it.days,
      note: "<b>Prix de démonstration.</b> Vérifiez sur la boutique : modèle exact, couleur, garantie (officielle ou boutique) et disponibilité.",
      price: (it) => it.total, costLabel: "livraison comprise",
      perf: { label: "Meilleure garantie", icon: "shield", get: (it) => it.warranty * 10 - it.dmin, text: (it) => it.warranty + " mois de garantie" },
      criteria: [{ k: "price", label: "Prix livré", get: (it) => it.total, better: "min", def: 5 }, { k: "speed", label: "Livraison rapide", get: (it) => it.dmin, better: "min", def: 1 }, { k: "warranty", label: "Garantie", get: (it) => it.warranty, better: "max", def: 2 }, { k: "fac", label: "Paiement en plusieurs fois", get: (it) => +it.facility, better: "max", def: 1 }],
      filters: [{ key: "stock", type: "toggle", label: "En stock uniquement", test: (it) => it.stock }, { key: "fac", type: "toggle", label: "Paiement en plusieurs fois", test: (it) => it.facility }, { key: "st", type: "checks", label: "Boutiques", options: items.map((i) => i.p), get: (it) => it.p }],
      sorts: [["score", "Pour vous", null, "sparkles"], ["price", "Prix livré", (a, b) => a.total - b.total, "tag"]],
      ribbons: (it) => (it.old ? `<span class="ribbon r-hot">${icon("fire")}Promo −${Math.round((1 - it.price / it.old) * 100)} %</span>` : "") + (it.stock ? `<span class="ribbon r-ok">${icon("check")}En stock</span>` : `<span class="ribbon r-info">Sur commande</span>`),
      card: (it) => `<div class="head">${badge(it.p)}<div><h3>${esc(it.p)}</h3><small>${esc(prod.n)}</small></div></div><div class="specs">${spec("Livraison", it.ship ? tnd(it.ship) : "Offerte")}${spec("Délai", esc(it.days))}${spec("Garantie", it.warranty + " mois")}${spec("Facilités", it.facility ? "Oui" : "Non")}</div>`,
      side: (it) => `<div>${it.old ? `<div class="price-sub" style="text-decoration:line-through">${tnd(it.old)}</div>` : ""}<div class="price-big">${nf.format(it.price)}<sup>DT</sup></div><div class="price-sub"><b>${tnd(it.total)}</b> livré</div></div>`,
      cta: "Voir en boutique", url: (it) => purl(it.p), fav: (it) => ({ title: prod.n, sub: it.p, price: tnd(it.price) }),
      compare: [{ g: "Prix" }, ["Prix", (it) => ({ n: it.price, t: tnd(it.price) }), "min"], ["Livraison", (it) => ({ n: it.ship, t: it.ship ? tnd(it.ship) : "Offerte" }), "min"], ["Prix livré", (it) => ({ n: it.total, t: tnd(it.total) }), "min"], { g: "Service" }, ["Délai", (it) => it.days], ["Garantie", (it) => ({ n: it.warranty, t: it.warranty + " mois" }), "max"], ["Paiement en plusieurs fois", (it) => yes(it.facility), "max", false], ["En stock", (it) => yes(it.stock), "max", false]],
      after: () => submitTo("#hts", "high-tech")
    }, params, path);
  };

  /* =========================================================
     PANIER « QOFFA » : quelle enseigne pour mes courses ?
     ========================================================= */
  R.panier = function (params) {
    document.title = "Panier « Qoffa » — comparez les supermarchés | Qarin.tn";
    const app = Q.app();
    const gov = D.governorates.includes(params.get("gov")) ? params.get("gov") : "Tunis";
    const basket = {};
    if (params.get("b")) params.get("b").split(",").forEach((x) => { const [k, v] = x.split(":"); if (D.products.some((p) => p.id === k)) basket[k] = clamp(+v || 0, 0, 20); });
    else Object.assign(basket, D.defaultBasket);
    const stores = D.stores.filter((s) => s.govs === "all" || s.govs.includes(gov));
    const price = (s, p) => { const r = rng(hashStr(s.p + p.id)); if (r() < 0.06) return null; return Math.round(p.base * s.f * (0.9 + r() * 0.22) * 20) / 20; };
    const cats = [...new Set(D.products.map((p) => p.cat))];
    app.innerHTML = pageHead("cart", "Panier « Qoffa »", "Composez vos courses : on calcule le total dans chaque enseigne et le panier le plus malin.", "Panier") + `
      <div class="container"><form class="page-search form-grid" id="pns"><div class="field"><label>Votre gouvernorat</label><select name="gov">${D.governorates.map((g) => opt(g, g, gov)).join("")}</select></div><button class="btn btn-primary">${icon("search")}Mettre à jour</button></form>
      <div class="layout">
        <aside class="filters basket"><div class="fh"><h3>${icon("cart")}Mon panier</h3><button type="button" class="link-btn" data-clear>Vider</button></div>
          ${cats.map((c) => `<div class="fgroup"><b>${esc(c)}</b>${D.products.filter((p) => p.cat === c).map((p) => `<div class="qty-row"><span>${esc(p.n)}</span><div class="qty"><button type="button" data-q="${p.id}" data-d="-1" aria-label="Moins">−</button><output id="q-${p.id}">${basket[p.id] || 0}</output><button type="button" data-q="${p.id}" data-d="1" aria-label="Plus">+</button></div></div>`).join("")}</div>`).join("")}
        </aside>
        <div>${note("<b>Prix de démonstration</b> (moyennes estimées). Les prix réels varient selon le magasin et les promotions : le comparateur sera alimenté par des relevés datés et les catalogues des enseignes.")}<div id="pres"></div></div>
      </div></div>`;
    const render = () => {
      const items = D.products.filter((p) => basket[p.id] > 0);
      const res = $("#pres", app);
      if (!items.length) { res.innerHTML = `<div class="empty">${icon("cart")}<b>Votre panier est vide</b>Ajoutez des produits avec les boutons +.</div>`; return; }
      const rows = stores.map((s) => { let total = 0, missing = 0; items.forEach((p) => { const v = price(s, p); if (v == null) { missing++; total += p.base * 1.1 * basket[p.id]; } else total += v * basket[p.id]; }); return { s, total, missing }; }).sort((a, b) => a.total - b.total);
      let bestPair = null;
      for (let i = 0; i < stores.length; i++) for (let j = i + 1; j < stores.length; j++) {
        let t = 0; items.forEach((p) => { const a = price(stores[i], p), b = price(stores[j], p); const m = Math.min(a == null ? Infinity : a, b == null ? Infinity : b); t += (m === Infinity ? p.base * 1.1 : m) * basket[p.id]; });
        if (!bestPair || t < bestPair.t) bestPair = { a: stores[i], b: stores[j], t };
      }
      const best = rows[0], worst = rows[rows.length - 1], nItems = items.reduce((a, p) => a + basket[p.id], 0);
      res.innerHTML = `
        <div class="save-hero"><div>${icon("cart")}<div><small>${nItems} articles · ${stores.length} enseignes à ${esc(gov)}</small><b>${esc(best.s.p)} : ${tnd(best.total)}</b><span>soit ${tnd(worst.total - best.total)} de moins que ${esc(worst.s.p)}${bestPair && best.total - bestPair.t > 0.5 ? ` · panier malin ${esc(bestPair.a.p)} + ${esc(bestPair.b.p)} : ${tnd(bestPair.t)}` : ""}</span></div></div></div>
        <div class="store-rank">${rows.map((r, i) => `<div class="store ${i === 0 ? "best" : ""}">${badge(r.s.p)}<div><b>${esc(r.s.p)}</b><small>${r.missing ? r.missing + " produit(s) indisponible(s) — estimé" : "Tous les produits disponibles"}</small><div class="track"><i style="width:${Math.round((best.total / r.total) * 100)}%"></i></div></div><div class="pr">${tnd(r.total)}<small>${i ? "+" + tnd(r.total - best.total) : "le moins cher"}</small></div></div>`).join("")}</div>
        <h2 style="margin:28px 0 10px;letter-spacing:-.5px">Détail par produit</h2>
        <div class="ctable-wrap"><table class="cmp"><thead><tr><th>Produit</th>${rows.map((r) => `<th>${esc(r.s.p)}</th>`).join("")}</tr></thead><tbody>
        ${items.map((p) => { const vals = rows.map((r) => price(r.s, p)); const mn = Math.min(...vals.filter((v) => v != null)); return `<tr><td>${esc(p.n)} <small class="muted">× ${basket[p.id]}</small></td>${vals.map((v) => `<td class="${v === mn ? "win" : ""}">${v == null ? '<span class="muted">—</span>' : f2(v)}</td>`).join("")}</tr>`; }).join("")}
        <tr class="grp"><td>Total</td>${rows.map((r) => `<td>${tnd(r.total)}</td>`).join("")}</tr></tbody></table></div>`;
    };
    const sync = () => { const b = Object.entries(basket).filter(([, v]) => v > 0).map(([k, v]) => k + ":" + v).join(","); history.replaceState(null, "", `#/panier?gov=${encodeURIComponent(gov)}&b=${b}`); };
    app.addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]");
      if (b) { const k = b.dataset.q; basket[k] = clamp((basket[k] || 0) + +b.dataset.d, 0, 20); $("#q-" + k, app).textContent = basket[k]; sync(); render(); }
      if (e.target.closest("[data-clear]")) { Object.keys(basket).forEach((k) => (basket[k] = 0)); $$("output", app).forEach((o) => (o.textContent = 0)); sync(); render(); }
    });
    $("#pns", app).addEventListener("submit", (e) => { e.preventDefault(); const b = Object.entries(basket).filter(([, v]) => v > 0).map(([k, v]) => k + ":" + v).join(","); go("panier", { gov: e.target.gov.value, b }); });
    render();
  };

  /* =========================================================
     ÉNERGIE SOLAIRE (kit photovoltaïque raccordé)
     ========================================================= */
  R.solaire = function (params) {
    document.title = "Énergie solaire — coût, aide et rentabilité | Qarin.tn";
    const app = Q.app();
    const n = (k, d, a, b) => clamp(params.has(k) && params.get(k) !== "" ? +params.get(k) : d, a, b);
    const gov = D.governorates.includes(params.get("gov")) ? params.get("gov") : "Tunis";
    const bill = n("bill", 180, 20, 5000), roof = n("roof", 30, 6, 500), aidPct = n("aid", 20, 0, 60), aidCap = n("cap", 3000, 0, 50000), kwhP = n("kwh", 0.29, 0.05, 1);
    const prod = D.sunGov.south.includes(gov) ? 1750 : 1550;
    const annual = ((bill / 2) / kwhP) * 12;
    const kwc = clamp(Math.ceil((annual / prod) * 2) / 2, 1, Math.floor(roof / 6 * 2) / 2 || 1);
    const S = D.solarTiers.map((t) => {
      const cost = kwc * t.perKwc, aid = Math.min(cost * aidPct / 100, aidCap), net = cost - aid, production = kwc * prod * t.yieldF, save = Math.min(production, annual) * kwhP;
      let gain20 = -net, s = save; for (let y = 0; y < 20; y++) { gain20 += s; s *= 1.03; }
      return { t, cost, aid, net, production, save, payback: net / save, gain20 };
    });
    const best = S.reduce((a, b) => (b.gain20 > a.gain20 ? b : a));
    app.innerHTML = pageHead("sun", "Énergie solaire", "Combien coûte une installation photovoltaïque, combien elle rapporte, et en combien d'années elle est remboursée.", "Solaire") + `
      <div class="container"><form class="page-search" id="sos"><div class="form-grid">
        <div class="field"><label>Gouvernorat</label><select name="gov">${D.governorates.map((g) => opt(g, g, gov)).join("")}</select></div>
        <div class="field"><label>Facture d'électricité (DT / 2 mois)</label><input type="number" name="bill" value="${bill}" min="20"></div>
        <div class="field"><label>Surface de toit libre (m²)</label><input type="number" name="roof" value="${roof}" min="6"></div>
        <button class="btn btn-primary">${icon("calc")}Calculer</button></div>
        <details class="adv"><summary>${icon("sliders")}Paramètres avancés (aides, tarif)</summary><div class="form-grid">
          <div class="field"><label>Aide publique estimée (%)</label><input type="number" name="aid" value="${aidPct}" min="0" max="60"></div>
          <div class="field"><label>Plafond de l'aide (DT)</label><input type="number" name="cap" value="${aidCap}" min="0"></div>
          <div class="field"><label>Prix moyen du kWh (DT)</label><input type="number" name="kwh" value="${kwhP}" step="0.01" min="0.05"></div>
        </div></details></form>
      <div style="padding:24px 0 70px">
        <div class="profile">${icon("bulb")}<span>Consommation estimée ≈ <b>${nf.format(Math.round(annual))} kWh/an</b> · installation conseillée <b>${String(kwc).replace(".", ",")} kWc</b> (≈ ${Math.round(kwc * 6)} m² de panneaux) · ensoleillement ${prod} kWh/kWc/an</span></div>
        <div class="scen-grid">${S.map((s) => `<article class="scen ${s === best ? "best" : ""}">
          <div class="scen-flags">${s === best ? `<span class="ribbon r-ok">${icon("crown")}Meilleur gain sur 20 ans</span>` : ""}</div>
          <div class="scen-ic"><span>${icon("sun")}</span></div><h3>${esc(s.t.name)}</h3>
          <div class="scen-total">${tnd(s.net)}<small>reste à payer après aide</small></div>
          <ul class="lines"><li><span>Coût de l'installation</span><span>${tnd(s.cost)}</span></li><li><span>Aide estimée</span><span style="color:var(--ok)">− ${tnd(s.aid)}</span></li><li><span>Production</span><span>${nf.format(Math.round(s.production))} kWh/an</span></li><li><span>Économie sur la facture</span><span>${tnd(s.save)} / an</span></li><li><span>Remboursé en</span><span>${f2(s.payback).replace(",", ",")} ans</span></li><li><span>Gain net sur 20 ans</span><span style="color:var(--ok)">${tnd(s.gain20)}</span></li></ul>
          <div class="pc"><div><span class="pro">${icon("check")}${esc(s.t.panels)}</span><span class="pro">${icon("check")}${esc(s.t.inverter)}</span></div><div><span class="pro">${icon("shield")}Garantie ${s.t.warranty} ans</span></div></div>
        </article>`).join("")}</div>
        ${note("<b>Simulation de démonstration.</b> Les coûts, l'aide publique (programme Prosol Elec / ANME) et les conditions de raccordement STEG sont indicatifs et modifiables dans « Paramètres avancés ». Demandez des devis à des installateurs agréés avant de vous engager. Hausse du prix de l'électricité supposée : 3 %/an.")}
      </div></div>`;
    $("#sos", app).addEventListener("submit", (e) => { e.preventDefault(); go("solaire", Object.fromEntries(new FormData(e.target).entries())); });
  };

  /* =========================================================
     CALCULATEUR FCR (importer sa voiture en Tunisie ?)
     ========================================================= */
  R.fcr = function (params) {
    document.title = "Calculateur FCR — importer sa voiture ou acheter en Tunisie ? | Qarin.tn";
    const app = Q.app();
    const n = (k, d, a, b) => clamp(params.has(k) && params.get(k) !== "" ? +params.get(k) : d, a, b);
    const fuel = ["essence", "diesel", "hybride", "electrique"].includes(params.get("fuel")) ? params.get("fuel") : "essence";
    const price = n("price", 12000, 500, 300000), cc = n("cc", 1400, 0, 6000), age = n("age", 4, 0, 30), local = n("local", 78000, 0, 2000000);
    const route = D.ferryRoutes.some((r) => r.id === params.get("route")) ? params.get("route") : "MRS";
    const dcAuto = fuel === "electrique" ? 0 : (fuel === "diesel" ? (cc <= 1500 ? 38 : cc <= 2000 ? 55 : cc <= 2500 ? 75 : 88) : (cc <= 1000 ? 10 : cc <= 1300 ? 16 : cc <= 1600 ? 38 : cc <= 2000 ? 52 : 88)) * (fuel === "hybride" ? 0.5 : 1);
    const dd = n("dd", 0, 0, 100), dc = n("dc", dcAuto, 0, 300), tva = n("tva", 19, 0, 50), adv = n("adv", 75, 0, 100), fees = n("fees", 900, 0, 20000);
    const valueDT = price * D.meta.eurTnd;
    const DD = valueDT * dd / 100, DC = (valueDT + DD) * dc / 100, TVA = (valueDT + DD + DC) * tva / 100, taxes = DD + DC + TVA;
    const ferry = Math.min(...Q.genFerries(route, inDays(30), 1, 0, "car", "seat").map((f) => f.price));
    const port = D.ferryRoutes.find((r) => r.id === route).port;
    const S = [
      { title: "Importer avec le régime FCR", ic: ["car", "ship"], parts: [{ l: `Achat en Europe (${nf.format(price)} €)`, v: valueDT, c: C.air }, { l: `Taxes après réduction FCR de ${adv} %`, v: taxes * (1 - adv / 100), c: "#dc2626" }, { l: `Ferry ${port} → Tunis (voiture + 1 passager)`, v: ferry, c: C.ship }, { l: "Frais (transit, homologation, carte grise…)", v: fees, c: C.fuel }], extra: ["Si vous êtes éligible"] },
      { title: "Importer sans avantage (régime commun)", ic: ["car", "ship"], parts: [{ l: `Achat en Europe (${nf.format(price)} €)`, v: valueDT, c: C.air }, { l: "Droits et taxes complets", v: taxes, c: "#dc2626" }, { l: `Ferry ${port} → Tunis`, v: ferry, c: C.ship }, { l: "Frais (transit, homologation, carte grise…)", v: fees, c: C.fuel }] },
      { title: "Acheter le même modèle en Tunisie", ic: ["home"], parts: [{ l: "Prix d'achat local (neuf ou occasion)", v: local, c: C.hotel }] }
    ];
    S.forEach((s) => (s.total = s.parts.reduce((a, p) => a + p.v, 0)));
    const cheap = minBy(S, (s) => s.total), dear = S.reduce((a, b) => (b.total > a.total ? b : a));
    const fuelOpt = [["essence", "Essence"], ["diesel", "Diesel"], ["hybride", "Hybride"], ["electrique", "Électrique"]];
    app.innerHTML = pageHead("car", "Calculateur FCR", "Tunisiens à l'étranger : importer votre voiture (avec ou sans FCR) ou acheter en Tunisie ?", "FCR") + `
      <div class="container"><form class="page-search" id="fcs"><div class="form-grid">
        <div class="field"><label>Prix d'achat en Europe (€)</label><input type="number" name="price" value="${price}" min="500" step="100"></div>
        <div class="field"><label>Carburant</label><select name="fuel">${fuelOpt.map(([k, v]) => opt(k, v, fuel)).join("")}</select></div>
        <div class="field"><label>Cylindrée (cm³)</label><input type="number" name="cc" value="${cc}" min="0" step="100"></div>
        <div class="field"><label>Âge du véhicule (ans)</label><input type="number" name="age" value="${age}" min="0" max="30"></div>
        <div class="field"><label>Prix du même modèle en Tunisie (DT)</label><input type="number" name="local" value="${local}" min="0" step="1000"></div>
        <div class="field"><label>Port d'embarquement</label><select name="route">${D.ferryRoutes.map((r) => opt(r.id, r.port, route)).join("")}</select></div>
        <button class="btn btn-primary">${icon("calc")}Calculer</button></div>
        <details class="adv"><summary>${icon("sliders")}Taux utilisés (modifiables)</summary><div class="form-grid">
          <div class="field"><label>Droit de douane (%)</label><input type="number" name="dd" value="${dd}" min="0"></div>
          <div class="field"><label>Droit de consommation (%)</label><input type="number" name="dc" value="${dc}" min="0"></div>
          <div class="field"><label>TVA (%)</label><input type="number" name="tva" value="${tva}" min="0"></div>
          <div class="field"><label>Réduction FCR (%)</label><input type="number" name="adv" value="${adv}" min="0" max="100"></div>
          <div class="field"><label>Frais divers (DT)</label><input type="number" name="fees" value="${fees}" min="0"></div>
        </div></details></form>
      <div style="padding:24px 0 70px">
        <div class="note" style="background:var(--hot-soft);border-color:color-mix(in srgb,var(--hot) 35%,transparent)">${icon("alert")}<div><b>Important — simulation indicative.</b> Les conditions du régime FCR (éligibilité, âge maximal du véhicule, fréquence, cylindrée) et les taux de droits changent selon les lois de finances. Les valeurs par défaut sont des <b>exemples à vérifier auprès de la Douane tunisienne</b> ou d'un transitaire agréé. ${age > 5 ? "<br>⚠️ Les véhicules anciens peuvent être exclus de certains avantages." : ""}</div></div>
        <div class="save-hero"><div>${icon("scale")}<div><small>Taux de référence 1 € = ${f2(D.meta.eurTnd)} DT · taxes complètes estimées ${tnd(taxes)}</small><b>${esc(cheap.title)} : ${tnd(cheap.total)}</b><span>soit ${tnd(dear.total - cheap.total)} de moins que l'option la plus chère</span></div></div></div>
        <div class="scen-grid">${S.map((s) => scenCard(s, [s === cheap ? "cheap" : ""], 1, "coût total estimé")).join("")}</div>
        <h2 style="margin:30px 0 10px;letter-spacing:-.5px">Détail des taxes (régime commun)</h2>
        <div class="ctable-wrap"><table class="cmp"><tbody>
          <tr><td>Valeur en douane (${nf.format(price)} € × ${f2(D.meta.eurTnd)})</td><td>${tnd(valueDT)}</td></tr>
          <tr><td>Droit de douane (${dd} %)</td><td>${tnd(DD)}</td></tr><tr><td>Droit de consommation (${dc} %)</td><td>${tnd(DC)}</td></tr><tr><td>TVA (${tva} %)</td><td>${tnd(TVA)}</td></tr>
          <tr class="grp"><td>Total des taxes</td><td>${tnd(taxes)}</td></tr><tr><td>Avec réduction FCR de ${adv} %</td><td class="win">${tnd(taxes * (1 - adv / 100))}</td></tr>
        </tbody></table></div>
      </div></div>`;
    $("#fcs", app).addEventListener("submit", (e) => { e.preventDefault(); go("fcr", Object.fromEntries(new FormData(e.target).entries())); });
  };

  /* =========================================================
     VITESSE INTERNET RÉELLE : test + carte par gouvernorat
     ========================================================= */
  const TILES = [["Bizerte", 1, 0], ["Ariana", 2, 0], ["Tunis", 3, 0], ["Jendouba", 0, 1], ["Béja", 1, 1], ["Manouba", 2, 1], ["Ben Arous", 3, 1], ["Nabeul", 4, 1], ["Le Kef", 0, 2], ["Siliana", 1, 2], ["Zaghouan", 2, 2], ["Sousse", 3, 2], ["Monastir", 4, 2], ["Kasserine", 0, 3], ["Sidi Bouzid", 1, 3], ["Kairouan", 2, 3], ["Mahdia", 3, 3], ["Gafsa", 0, 4], ["Sfax", 2, 4], ["Tozeur", 0, 5], ["Kébili", 1, 5], ["Gabès", 2, 5], ["Médenine", 3, 5], ["Tataouine", 2, 6]];
  const OPS = ["Tous", "Tunisie Telecom", "Ooredoo", "Orange", "Topnet", "GlobalNet", "Hexabyte"];
  const demoAvg = (gov, op) => { const r = rng(hashStr("spd" + gov + op)); const base = D.fiberGov.includes(gov) ? 38 : 16; return Math.round(base * (0.7 + r() * 0.7) * (op === "Tous" ? 1 : 0.85 + r() * 0.35)); };
  const spdColor = (v) => (v >= 50 ? "#059669" : v >= 30 ? "#65a30d" : v >= 18 ? "#ca8a04" : v >= 10 ? "#ea580c" : "#dc2626");
  R.vitesse = function (params) {
    document.title = "Test de vitesse Internet & carte des débits réels | Qarin.tn";
    const app = Q.app();
    let op = OPS.includes(params.get("op")) ? params.get("op") : "Tous";
    const mine = () => LS.get("qarin-speed", []);
    app.innerHTML = pageHead("gauge", "Vitesse Internet réelle", "Mesurez votre débit, comparez-le à votre abonnement et voyez la carte des débits par gouvernorat.", "Vitesse réelle") + `
      <div class="container" style="padding:28px 20px 70px"><div class="speed-grid">
        <section class="speed-card">
          <div class="gauge"><svg viewBox="0 0 200 120" aria-hidden="true"><path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="var(--surface-2)" stroke-width="16" stroke-linecap="round"/><path id="garc" d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="url(#gg)" stroke-width="16" stroke-linecap="round" stroke-dasharray="252" stroke-dashoffset="252"/><defs><linearGradient id="gg"><stop offset="0" stop-color="#0e7490"/><stop offset="1" stop-color="#22c55e"/></linearGradient></defs></svg>
            <div class="gauge-val"><b id="gv">0</b><small>Mbps</small></div></div>
          <div class="speed-stats"><div><small>Ping</small><b id="gping">—</b></div><div><small>Téléchargement</small><b id="gdl">—</b></div><div><small>Données</small><b id="gmb">—</b></div></div>
          <button type="button" class="btn btn-primary btn-lg btn-block" id="gstart">${icon("zap")}Lancer le test</button>
          <form id="gsave" class="form-grid" hidden style="margin-top:14px">
            <div class="field"><label>Gouvernorat</label><select name="gov">${D.governorates.map((g) => opt(g, g, "Tunis")).join("")}</select></div>
            <div class="field"><label>Fournisseur</label><select name="op">${OPS.slice(1).map((o) => opt(o, o)).join("")}</select></div>
            <div class="field"><label>Débit de l'abonnement (Mbps)</label><input type="number" name="sub" value="50" min="1"></div>
            <button class="btn btn-brand">${icon("check")}Enregistrer ma mesure</button>
          </form>
          <div id="gverdict"></div>
          <p class="muted" style="font-size:12.5px;margin:12px 0 0">Mesure réelle effectuée dans votre navigateur vers un serveur CDN international : le résultat peut être un peu inférieur à votre débit local. Fermez les autres téléchargements pendant le test.</p>
        </section>
        <section class="speed-card">
          <div class="chart-head"><b>${icon("pin")}Carte des débits moyens</b><select class="select" id="mapop" style="width:auto;min-height:0;padding:7px 10px">${OPS.map((o) => opt(o, o, op)).join("")}</select></div>
          <div class="tilemap" id="tmap"></div>
          <div class="legend">${[["≥ 50", 50], ["30–50", 30], ["18–30", 18], ["10–18", 10], ["< 10", 0]].map(([l, v]) => `<span><i style="background:${spdColor(v)}"></i>${l} Mbps</span>`).join("")}</div>
          <p class="muted" style="font-size:12.5px;margin:10px 0 0">${icon("info")} <b>Moyennes de démonstration.</b> La carte collaborative réelle nécessite un serveur pour regrouper les mesures des visiteurs (avec déclaration à l'INPDP). Vos mesures restent sur votre appareil et apparaissent avec un point.</p>
        </section>
      </div><div id="mylist"></div></div>`;
    const drawMap = () => {
      const m = mine();
      $("#tmap", app).innerHTML = TILES.map(([g, x, y]) => { const v = demoAvg(g, op), own = m.filter((s) => s.gov === g && (op === "Tous" || s.op === op)); return `<div class="tile" style="grid-column:${x + 1};grid-row:${y + 1};background:${spdColor(v)}" title="${esc(g)} : ${v} Mbps en moyenne"><b>${esc(g)}</b><span>${v}</span>${own.length ? `<em title="Vos mesures">${Math.round(own.reduce((a, s) => a + s.dl, 0) / own.length)}</em>` : ""}</div>`; }).join("");
      const list = mine();
      $("#mylist", app).innerHTML = list.length ? `<h2 style="margin:30px 0 12px">Mes mesures</h2><div class="ctable-wrap"><table class="cmp"><thead><tr><th>Date</th><th>Gouvernorat</th><th>Fournisseur</th><th>Mesuré</th><th>Abonnement</th><th>% du promis</th></tr></thead><tbody>${list.slice().reverse().map((s) => `<tr><td>${new Date(s.t).toLocaleDateString()}</td><td>${esc(s.gov)}</td><td>${esc(s.op)}</td><td><b>${s.dl} Mbps</b></td><td>${s.sub} Mbps</td><td class="${s.dl / s.sub >= 0.8 ? "win" : ""}">${Math.round((s.dl / s.sub) * 100)} %</td></tr>`).join("")}</tbody></table></div>` : "";
    };
    drawMap();
    $("#mapop", app).addEventListener("change", (e) => { op = e.target.value; drawMap(); });
    let last = null;
    const setG = (v) => { $("#gv", app).textContent = v < 10 ? v.toFixed(1) : Math.round(v); $("#garc", app).style.strokeDashoffset = 252 - 252 * Math.min(1, Math.log10(1 + v) / Math.log10(1001)); };
    $("#gstart", app).addEventListener("click", async (e) => {
      const btn = e.currentTarget; btn.disabled = true; btn.innerHTML = icon("clock") + "Test en cours…"; $("#gverdict", app).innerHTML = ""; setG(0);
      try {
        const pings = [];
        for (let i = 0; i < 5; i++) { const t0 = performance.now(); await fetch("https://cdn.jsdelivr.net/npm/jquery@3.7.1/package.json?r=" + Math.random(), { cache: "no-store" }); pings.push(performance.now() - t0); }
        const ping = Math.round(Math.min(...pings)); $("#gping", app).textContent = ping + " ms";
        const ctrl = new AbortController(), t0 = performance.now(); let bytes = 0;
        const timer = setInterval(() => { const s = (performance.now() - t0) / 1000; if (s > 0.3) setG((bytes * 8) / s / 1e6); $("#gmb", app).textContent = (bytes / 1e6).toFixed(1) + " Mo"; }, 150);
        const grab = async () => { while (performance.now() - t0 < 8000) { const res = await fetch("https://cdn.jsdelivr.net/npm/typescript@5.4.5/lib/typescript.js?r=" + Math.random(), { cache: "no-store", signal: ctrl.signal }); const rd = res.body.getReader(); for (;;) { const { done, value } = await rd.read(); if (done) break; bytes += value.length; if (performance.now() - t0 > 8000) { ctrl.abort(); break; } } } };
        await Promise.allSettled([grab(), grab(), grab()]);
        clearInterval(timer);
        const secs = (performance.now() - t0) / 1000, dl = Math.round(((bytes * 8) / secs / 1e6) * 10) / 10;
        setG(dl); $("#gdl", app).textContent = dl + " Mbps"; $("#gmb", app).textContent = (bytes / 1e6).toFixed(1) + " Mo";
        last = { dl, ping }; $("#gsave", app).hidden = false;
        $("#gverdict", app).innerHTML = `<div class="profile" style="margin:14px 0 0">${icon("info")}<span>${dl >= 50 ? "Excellent : streaming 4K, télétravail et jeux sans souci." : dl >= 20 ? "Bon : streaming HD et visio confortables." : dl >= 8 ? "Correct pour un usage simple ; limite à plusieurs." : "Faible : comparez les offres disponibles chez vous."} <a href="#/internet">Comparer les offres</a></span></div>`;
      } catch (err) { $("#gverdict", app).innerHTML = `<div class="note">${icon("alert")}<div>Le test n'a pas pu aboutir (connexion ou bloqueur). Réessayez.</div></div>`; }
      btn.disabled = false; btn.innerHTML = icon("zap") + "Relancer le test";
    });
    $("#gsave", app).addEventListener("submit", (e) => {
      e.preventDefault(); if (!last) return;
      const f = e.target, l = mine(); l.push({ t: Date.now(), gov: f.gov.value, op: f.op.value, sub: +f.sub.value, dl: last.dl, ping: last.ping }); LS.set("qarin-speed", l);
      toast(`Mesure enregistrée : ${Math.round((last.dl / +f.sub.value) * 100)} % du débit promis`, "check"); f.hidden = true; drawMap();
    });
  };
})(window.Q);
