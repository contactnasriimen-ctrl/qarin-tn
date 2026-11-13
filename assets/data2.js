/* Qarin.tn — données des comparateurs « vie quotidienne », mobilité, diaspora.
   TOUTES CES VALEURS SONT DES DONNÉES DE DÉMONSTRATION à remplacer par des données sourcées. */
(function (D) {
  Object.assign(D.meta.cats, {
    vitesse: { label: "Vitesse Internet réelle", status: "Démo", origin: "Test réel dans votre navigateur ; moyennes de la carte fictives", real: "Mesures collectées auprès des visiteurs (serveur + déclaration INPDP)" },
    transport: { label: "Louage, train, bus", status: "Démo", origin: "Tarifs au km et durées estimés", real: "Tarifs officiels SNCFT / SNTRI / sociétés régionales et grilles louage publiées" },
    "assurance-voyage": { label: "Assurance voyage", status: "Démo", origin: "Primes estimées par formule", real: "Partenariat assureurs ou intermédiaire agréé" },
    omra: { label: "Omra", status: "Démo", origin: "Formules types sans agence réelle", real: "Partenariats avec des agences de voyage agréées" },
    panier: { label: "Panier Qoffa", status: "Démo", origin: "Prix moyens estimés par enseigne", real: "Relevés en magasin / catalogues publiés, ou flux fourni par les enseignes" },
    "high-tech": { label: "Smartphones & high-tech", status: "Démo", origin: "Prix estimés par boutique", real: "Flux produits ou programmes d'affiliation des boutiques" },
    solaire: { label: "Énergie solaire", status: "Démo", origin: "Coûts et aides indicatifs", real: "Devis d'installateurs agréés, conditions officielles du programme Prosol" },
    fcr: { label: "Calculateur FCR", status: "Démo", origin: "Taux paramétrables indicatifs", real: "Barèmes officiels de la Douane tunisienne" }
  });
  Object.assign(D.providers, {
    "Carrefour": { short: "CA", color: "#004e9f", url: "https://www.carrefour.tn" },
    "Monoprix": { short: "MO", color: "#d6001c", url: "https://www.monoprix.tn" },
    "Magasin Général": { short: "MG", color: "#0f5132", url: "https://www.mg.tn" },
    "Géant": { short: "GE", color: "#00843d", url: "#" },
    "Aziza": { short: "AZ", color: "#e8730c", url: "https://www.aziza.tn" },
    "Mytek": { short: "MY", color: "#e30613", url: "https://www.mytek.tn" },
    "Tunisianet": { short: "TN", color: "#0b4ea2", url: "https://www.tunisianet.com.tn" },
    "SpaceNet": { short: "SP", color: "#111827", url: "https://spacenet.tn" },
    "Jumia": { short: "JU", color: "#f68b1e", url: "https://www.jumia.com.tn" },
    "Louage": { short: "LO", color: "#ea580c", url: "#" },
    "Train SNCFT": { short: "TR", color: "#1d4ed8", url: "https://www.sncft.com.tn" },
    "Bus SNTRI": { short: "BU", color: "#047857", url: "https://www.sntri.com.tn" },
    "Votre voiture": { short: "VO", color: "#475569", url: "#" }
  });

  /* ---------- Panier (Qoffa) ---------- */
  D.stores = [
    { p: "Carrefour", f: 1.0, govs: ["Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Sousse", "Monastir", "Sfax", "Bizerte", "Médenine"] },
    { p: "Monoprix", f: 1.05, govs: "all" },
    { p: "Magasin Général", f: 0.97, govs: "all" },
    { p: "Géant", f: 0.99, govs: ["Tunis", "Ariana", "Ben Arous", "Manouba"] },
    { p: "Aziza", f: 0.93, govs: "all" }
  ];
  D.products = [
    { id: "yaourt", n: "Yaourt nature x4", ar: "ياغورت طبيعي ×4", cat: "Produits frais", base: 2.2 },
    { id: "fromage", n: "Fromage en portions x16", ar: "جبن قطع ×16", cat: "Produits frais", base: 6.2 },
    { id: "oeufs", n: "Œufs x10", ar: "بيض ×10", cat: "Produits frais", base: 4.3 },
    { id: "olive", n: "Huile d'olive 1 L", ar: "زيت زيتون 1 ل", cat: "Épicerie", base: 17.5 },
    { id: "thon", n: "Thon à l'huile 160 g", ar: "تن بالزيت 160 غ", cat: "Épicerie", base: 4.9 },
    { id: "tomate", n: "Concentré de tomate 400 g", ar: "طماطم مركّزة 400 غ", cat: "Épicerie", base: 2.7 },
    { id: "harissa", n: "Harissa 135 g", ar: "هريسة 135 غ", cat: "Épicerie", base: 1.5 },
    { id: "riz", n: "Riz 1 kg", ar: "روز 1 كغ", cat: "Épicerie", base: 4.1 },
    { id: "cafe", n: "Café moulu 250 g", ar: "قهوة مرحية 250 غ", cat: "Épicerie", base: 9.8 },
    { id: "the", n: "Thé vert 200 g", ar: "تاي أخضر 200 غ", cat: "Épicerie", base: 6.9 },
    { id: "tartiner", n: "Pâte à tartiner 400 g", ar: "شكلاطة للدهن 400 غ", cat: "Épicerie", base: 10.5 },
    { id: "eau", n: "Eau minérale 6 × 1,5 L", ar: "ماء معدني 6 × 1.5 ل", cat: "Boissons", base: 4.6 },
    { id: "jus", n: "Jus de fruits 1 L", ar: "عصير 1 ل", cat: "Boissons", base: 3.3 },
    { id: "lessive", n: "Lessive en poudre 3 kg", ar: "مسحوق غسيل 3 كغ", cat: "Maison", base: 15.5 },
    { id: "vaisselle", n: "Liquide vaisselle 1 L", ar: "سائل أواني 1 ل", cat: "Maison", base: 3.4 },
    { id: "papier", n: "Papier toilette x6", ar: "ورق صحي ×6", cat: "Maison", base: 5.2 },
    { id: "shampoing", n: "Shampooing 400 ml", ar: "شامبو 400 مل", cat: "Hygiène", base: 9.5 },
    { id: "dentifrice", n: "Dentifrice 75 ml", ar: "معجون أسنان 75 مل", cat: "Hygiène", base: 3.8 },
    { id: "couches", n: "Couches bébé x40", ar: "حفاظات ×40", cat: "Bébé", base: 26 }
  ];
  D.defaultBasket = { yaourt: 2, fromage: 1, oeufs: 2, olive: 1, thon: 2, tomate: 2, harissa: 1, riz: 1, cafe: 1, eau: 2, lessive: 1, vaisselle: 1, papier: 1 };

  /* ---------- Transport interurbain ---------- */
  D.towns = [
    ["Tunis", 36.80, 10.18], ["Sousse", 35.83, 10.64], ["Sfax", 34.74, 10.76], ["Monastir", 35.77, 10.83], ["Mahdia", 35.50, 11.06],
    ["Nabeul", 36.45, 10.73], ["Hammamet", 36.40, 10.62], ["Bizerte", 37.27, 9.87], ["Kairouan", 35.68, 10.10], ["Gabès", 33.88, 10.10],
    ["Médenine", 33.35, 10.50], ["Djerba", 33.87, 10.86], ["Tozeur", 33.92, 8.13], ["Gafsa", 34.43, 8.78], ["Le Kef", 36.18, 8.71],
    ["Béja", 36.73, 9.18], ["Jendouba", 36.50, 8.78], ["Tataouine", 32.93, 10.45], ["Kasserine", 35.17, 8.84], ["Sidi Bouzid", 35.04, 9.48],
    ["Zaghouan", 36.40, 10.14], ["Kébili", 33.70, 8.97], ["Siliana", 36.08, 9.37], ["Tabarka", 36.95, 8.76]
  ];
  D.trainTowns = ["Tunis", "Sousse", "Sfax", "Monastir", "Mahdia", "Nabeul", "Hammamet", "Bizerte", "Gabès", "Gafsa", "Tozeur", "Béja", "Jendouba"];
  D.highwayTowns = ["Tunis", "Sousse", "Sfax", "Monastir", "Mahdia", "Nabeul", "Hammamet", "Bizerte", "Gabès", "Béja", "Médenine", "Zaghouan"];

  /* ---------- Assurance voyage ---------- */
  D.travelZones = { schengen: { label: "Europe / Schengen", f: 1 }, world: { label: "Monde hors USA/Canada", f: 1.45 }, all: { label: "Monde entier", f: 2.1 } };

  /* ---------- Omra (formules types, agences non nommées) ---------- */
  D.omraFormulas = [
    { id: "eco15", name: "Formule économique", days: 15, stars: 3, dist: 900, direct: false, meals: "Petit-déjeuner", base: 5200 },
    { id: "std15", name: "Formule standard", days: 15, stars: 4, dist: 500, direct: true, meals: "Demi-pension", base: 6400 },
    { id: "std12", name: "Formule courte", days: 12, stars: 4, dist: 400, direct: true, meals: "Demi-pension", base: 6100 },
    { id: "conf15", name: "Formule confort", days: 15, stars: 5, dist: 200, direct: true, meals: "Demi-pension", base: 8300 },
    { id: "prem10", name: "Formule premium", days: 10, stars: 5, dist: 50, direct: true, meals: "Pension complète", base: 9800 },
    { id: "eco21", name: "Formule longue", days: 21, stars: 3, dist: 1100, direct: false, meals: "Petit-déjeuner", base: 5900 }
  ];
  D.omraAgencies = ["A", "B", "C", "D"];

  /* ---------- High-tech ---------- */
  D.techProducts = [
    { id: "ip15", n: "iPhone 15 128 Go", cat: "Smartphone", base: 3790 },
    { id: "s24", n: "Samsung Galaxy S24 256 Go", cat: "Smartphone", base: 3690 },
    { id: "a55", n: "Samsung Galaxy A55 128 Go", cat: "Smartphone", base: 1499 },
    { id: "rn13", n: "Redmi Note 13 Pro 256 Go", cat: "Smartphone", base: 1099 },
    { id: "hot40", n: "Infinix Hot 40 128 Go", cat: "Smartphone", base: 539 },
    { id: "hp15", n: "PC portable HP 15 (Core i5, 8 Go, 512 Go)", cat: "PC portable", base: 2290 },
    { id: "ideapad", n: "PC portable Lenovo IdeaPad (Core i3, 8 Go, 256 Go)", cat: "PC portable", base: 1490 },
    { id: "tv55", n: "TV 55\" 4K Smart", cat: "TV", base: 2390 },
    { id: "airpods", n: "Écouteurs sans fil Bluetooth (milieu de gamme)", cat: "Accessoire", base: 249 }
  ];
  D.techStores = [
    { p: "Mytek", f: 1.0, ship: 7, days: "24–48 h", facility: true, warranty: 12 },
    { p: "Tunisianet", f: 0.99, ship: 8, days: "24–72 h", facility: true, warranty: 12 },
    { p: "SpaceNet", f: 1.01, ship: 7, days: "24–48 h", facility: false, warranty: 12 },
    { p: "Jumia", f: 0.97, ship: 9, days: "2–5 jours", facility: false, warranty: 6 }
  ];

  /* ---------- Solaire ---------- */
  D.solarTiers = [
    { id: "eco", name: "Entrée de gamme", perKwc: 2700, panels: "Panneaux polycristallins", inverter: "Onduleur standard", warranty: 10, yieldF: 0.95 },
    { id: "std", name: "Standard", perKwc: 3100, panels: "Panneaux monocristallins", inverter: "Onduleur réseau de marque", warranty: 15, yieldF: 1 },
    { id: "prem", name: "Premium", perKwc: 3700, panels: "Panneaux monocristallins haut rendement", inverter: "Onduleur + monitoring", warranty: 25, yieldF: 1.06 }
  ];
  D.sunGov = { south: ["Gabès", "Médenine", "Tataouine", "Tozeur", "Kébili", "Gafsa", "Sfax", "Sidi Bouzid", "Kasserine"] };
})(window.QDATA);
