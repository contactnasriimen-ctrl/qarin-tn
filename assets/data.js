/* Qarin.tn — données de comparaison (tarifs indicatifs, à vérifier auprès des fournisseurs) */
window.QDATA = (function () {
  const providers = {
    "Tunisie Telecom": { short: "TT", color: "#0057a8", url: "https://www.tunisietelecom.tn" },
    "Ooredoo": { short: "OO", color: "#e30613", url: "https://www.ooredoo.tn" },
    "Orange": { short: "OR", color: "#ff7900", url: "https://www.orange.tn" },
    "Topnet": { short: "TN", color: "#00a19a", url: "https://www.topnet.tn" },
    "GlobalNet": { short: "GN", color: "#5b2d90", url: "https://www.gnet.tn" },
    "Hexabyte": { short: "HX", color: "#1f2937", url: "https://www.hexabyte.tn" },
    "Tunisair": { short: "TU", color: "#c8102e", url: "https://www.tunisair.com" },
    "Nouvelair": { short: "BJ", color: "#1d3c8f", url: "https://www.nouvelair.com" },
    "Transavia": { short: "TO", color: "#00b373", url: "https://www.transavia.com" },
    "Air France": { short: "AF", color: "#002157", url: "https://www.airfrance.fr" },
    "Lufthansa": { short: "LH", color: "#05164d", url: "https://www.lufthansa.com" },
    "ITA Airways": { short: "AZ", color: "#0a2a6b", url: "https://www.ita-airways.com" },
    "Turkish Airlines": { short: "TK", color: "#c70a0c", url: "https://www.turkishairlines.com" },
    "Qatar Airways": { short: "QR", color: "#5c0632", url: "https://www.qatarairways.com" },
    "Emirates": { short: "EK", color: "#b5121b", url: "https://www.emirates.com" },
    "Royal Air Maroc": { short: "AT", color: "#b0123a", url: "https://www.royalairmaroc.com" },
    "Air Algérie": { short: "AH", color: "#d2232a", url: "https://airalgerie.dz" },
    "Saudia": { short: "SV", color: "#006c35", url: "https://www.saudia.com" },
    "Brussels Airlines": { short: "SN", color: "#0b2f6a", url: "https://www.brusselsairlines.com" },
    "Swiss": { short: "LX", color: "#d52b1e", url: "https://www.swiss.com" },
    "British Airways": { short: "BA", color: "#075aaa", url: "https://www.britishairways.com" },
    "STAR Assurances": { short: "ST", color: "#003f87", url: "https://www.star.com.tn" },
    "GAT Assurances": { short: "GA", color: "#c4161c", url: "https://www.gat.com.tn" },
    "COMAR": { short: "CO", color: "#00539b", url: "https://www.comar.tn" },
    "Astrée": { short: "AS", color: "#1b75bb", url: "https://www.astree.com.tn" },
    "BH Assurance": { short: "BH", color: "#e2001a", url: "https://www.bh-assurance.com" },
    "Maghrebia": { short: "MA", color: "#00843d", url: "https://www.maghrebia.com.tn" },
    "Lloyd Assurances": { short: "LL", color: "#0d2c54", url: "https://www.lloyd.tn" },
    "Zitouna Takaful": { short: "ZT", color: "#007a3d", url: "https://www.zitounatakaful.com" },
    "AMI Assurances": { short: "AM", color: "#e85d04", url: "https://www.ami-assurances.com.tn" },
    "Hertz": { short: "HZ", color: "#f7c600", url: "https://www.hertz.com.tn" },
    "Europcar": { short: "EC", color: "#007a33", url: "https://www.europcar.com" },
    "Avis": { short: "AV", color: "#d4002a", url: "https://www.avis.com" },
    "Sixt": { short: "SX", color: "#ff5f00", url: "https://www.sixt.com" },
    "Budget": { short: "BU", color: "#00285f", url: "https://www.budget.com" },
    "Enterprise": { short: "EN", color: "#169a5a", url: "https://www.enterprise.com" }
  };

  const internet = [
    { p: "Tunisie Telecom", name: "ADSL 8 Mbps", tech: "ADSL", down: 8, up: 1, price: 29, setup: 30, eng: 12, feats: ["Ligne fixe incluse", "Appels fixes illimités soir & WE"] },
    { p: "Tunisie Telecom", name: "VDSL 30 Mbps", tech: "VDSL", down: 30, up: 5, price: 52, setup: 30, eng: 12, feats: ["Modem Wi-Fi offert", "Ligne fixe incluse"] },
    { p: "Tunisie Telecom", name: "Fibre FTTH 100 Mbps", tech: "Fibre", down: 100, up: 50, price: 85, setup: 0, eng: 12, feats: ["Routeur Wi-Fi 6", "Installation gratuite", "IPTV en option"] },
    { p: "Tunisie Telecom", name: "Fibre FTTH 500 Mbps", tech: "Fibre", down: 500, up: 250, price: 155, setup: 0, eng: 12, feats: ["Routeur Wi-Fi 6", "Installation gratuite", "Débit montant élevé"] },
    { p: "Topnet", name: "Rapido 12 Mbps", tech: "ADSL", down: 12, up: 1, price: 34, setup: 25, eng: 12, feats: ["Modem offert", "Assistance 7j/7"] },
    { p: "Topnet", name: "Rapido VDSL 50 Mbps", tech: "VDSL", down: 50, up: 8, price: 62, setup: 25, eng: 12, feats: ["Modem VDSL offert", "Assistance 7j/7"] },
    { p: "Topnet", name: "Fibre 200 Mbps", tech: "Fibre", down: 200, up: 100, price: 99, setup: 0, eng: 12, feats: ["Routeur Wi-Fi 6", "1er mois offert"], promo: true },
    { p: "Topnet", name: "Fibre 1 Gbps", tech: "Fibre", down: 1000, up: 500, price: 199, setup: 0, eng: 12, feats: ["Routeur Wi-Fi 6E", "IP fixe en option", "Priorité support"] },
    { p: "GlobalNet", name: "Smart ADSL 20 Mbps", tech: "ADSL", down: 20, up: 1, price: 39, setup: 20, eng: 12, feats: ["Modem offert", "Sans plafond de volume"] },
    { p: "GlobalNet", name: "Smart VDSL 100 Mbps", tech: "VDSL", down: 100, up: 20, price: 79, setup: 20, eng: 12, feats: ["Modem VDSL", "Sans plafond de volume"] },
    { p: "GlobalNet", name: "Fibre 300 Mbps", tech: "Fibre", down: 300, up: 150, price: 119, setup: 0, eng: 12, feats: ["Routeur Wi-Fi 6", "Installation offerte"] },
    { p: "Hexabyte", name: "Hexa ADSL 10 Mbps", tech: "ADSL", down: 10, up: 1, price: 31, setup: 20, eng: 6, feats: ["Engagement 6 mois", "Modem offert"] },
    { p: "Hexabyte", name: "Hexa VDSL 50 Mbps", tech: "VDSL", down: 50, up: 10, price: 59, setup: 20, eng: 6, feats: ["Engagement 6 mois", "Modem VDSL"], promo: true },
    { p: "Hexabyte", name: "Hexa Fibre 100 Mbps", tech: "Fibre", down: 100, up: 50, price: 82, setup: 0, eng: 12, feats: ["Routeur Wi-Fi", "Installation offerte"] },
    { p: "Ooredoo", name: "Fibre 100 Mbps", tech: "Fibre", down: 100, up: 50, price: 89, setup: 0, eng: 12, feats: ["Routeur Wi-Fi 6", "Bonus data mobile"] },
    { p: "Ooredoo", name: "Fibre 500 Mbps", tech: "Fibre", down: 500, up: 250, price: 149, setup: 0, eng: 12, feats: ["Routeur Wi-Fi 6", "Bonus data mobile", "Installation offerte"] },
    { p: "Ooredoo", name: "Box 4G+ Illimitée", tech: "4G Box", down: 40, up: 10, price: 69, setup: 99, eng: 0, feats: ["Sans ligne fixe", "Sans engagement", "Prêt à l'emploi"] },
    { p: "Ooredoo", name: "Box 5G Home", tech: "5G Box", down: 300, up: 50, price: 119, setup: 149, eng: 0, feats: ["Sans ligne fixe", "Sans engagement", "Zones 5G couvertes"], promo: true },
    { p: "Orange", name: "Flybox 4G 100 Go", tech: "4G Box", down: 40, up: 10, price: 49, setup: 89, eng: 0, feats: ["100 Go / mois", "Sans engagement"] },
    { p: "Orange", name: "Fibre 200 Mbps", tech: "Fibre", down: 200, up: 100, price: 105, setup: 0, eng: 12, feats: ["Routeur Wi-Fi 6", "Installation offerte"] },
    { p: "Orange", name: "Box 5G Max", tech: "5G Box", down: 500, up: 80, price: 135, setup: 149, eng: 0, feats: ["Sans ligne fixe", "Sans engagement", "Wi-Fi 6"] },
    { p: "Tunisie Telecom", name: "Box 4G Elissa", tech: "4G Box", down: 30, up: 8, price: 45, setup: 79, eng: 0, feats: ["80 Go / mois", "Sans engagement"] }
  ];

  const mobile = [
    { p: "Ooredoo", name: "Forfait Smart 20", price: 20, data: 15, min: "300 min", sms: "Illimités", eng: 0, feats: ["Réseaux sociaux inclus"] },
    { p: "Ooredoo", name: "Forfait Smart 35", price: 35, data: 40, min: "Illimitées nat.", sms: "Illimités", eng: 0, feats: ["5G incluse", "Roaming Maghreb 1 Go"] },
    { p: "Ooredoo", name: "Forfait Max 60", price: 60, data: 120, min: "Illimitées", sms: "Illimités", eng: 12, feats: ["5G incluse", "Appels int. 60 min"], promo: true },
    { p: "Orange", name: "Hayya 15", price: 15, data: 10, min: "200 min", sms: "200", eng: 0, feats: ["Report de data"] },
    { p: "Orange", name: "Hayya 30", price: 30, data: 35, min: "Illimitées nat.", sms: "Illimités", eng: 0, feats: ["5G incluse", "Report de data"] },
    { p: "Orange", name: "Hayya 55", price: 55, data: 100, min: "Illimitées", sms: "Illimités", eng: 12, feats: ["5G incluse", "Appels Europe 60 min"] },
    { p: "Tunisie Telecom", name: "Forfait Essentiel 18", price: 18, data: 12, min: "300 min", sms: "Illimités", eng: 0, feats: ["Couverture rurale large"] },
    { p: "Tunisie Telecom", name: "Forfait Plus 32", price: 32, data: 45, min: "Illimitées nat.", sms: "Illimités", eng: 0, feats: ["5G incluse", "Appels fixe illimités"], promo: true },
    { p: "Tunisie Telecom", name: "Forfait Premium 65", price: 65, data: 150, min: "Illimitées", sms: "Illimités", eng: 12, feats: ["5G incluse", "Roaming Europe 2 Go"] },
    { p: "Ooredoo", name: "Data Only 25", price: 25, data: 50, min: "—", sms: "—", eng: 0, feats: ["Idéal tablette / routeur"] },
    { p: "Orange", name: "Data Only 39", price: 39, data: 80, min: "—", sms: "—", eng: 0, feats: ["Idéal tablette / routeur"] }
  ];

  const airportsTN = [
    { code: "TUN", city: "Tunis-Carthage", f: 1 },
    { code: "DJE", city: "Djerba-Zarzis", f: 1.08 },
    { code: "MIR", city: "Monastir", f: 1.04 },
    { code: "NBE", city: "Enfidha-Hammamet", f: 1.03 },
    { code: "SFA", city: "Sfax-Thyna", f: 1.12 },
    { code: "TOE", city: "Tozeur-Nefta", f: 1.18 }
  ];

  const destinations = [
    { code: "CDG", city: "Paris CDG", km: 1480, air: ["Tunisair", "Air France", "Nouvelair", "Transavia"] },
    { code: "ORY", city: "Paris Orly", km: 1470, air: ["Tunisair", "Transavia", "Nouvelair"] },
    { code: "MRS", city: "Marseille", km: 880, air: ["Tunisair", "Nouvelair", "Transavia"] },
    { code: "LYS", city: "Lyon", km: 1060, air: ["Tunisair", "Nouvelair", "Transavia"] },
    { code: "NCE", city: "Nice", km: 830, air: ["Tunisair", "Nouvelair"] },
    { code: "FCO", city: "Rome", km: 600, air: ["Tunisair", "ITA Airways"] },
    { code: "FRA", city: "Francfort", km: 1650, air: ["Tunisair", "Lufthansa", "Nouvelair"] },
    { code: "MUC", city: "Munich", km: 1500, air: ["Tunisair", "Lufthansa", "Nouvelair"] },
    { code: "BRU", city: "Bruxelles", km: 1700, air: ["Tunisair", "Brussels Airlines", "Nouvelair"] },
    { code: "GVA", city: "Genève", km: 1150, air: ["Tunisair", "Swiss", "Nouvelair"] },
    { code: "LHR", city: "Londres", km: 1830, air: ["Tunisair", "British Airways"] },
    { code: "IST", city: "Istanbul", km: 1650, air: ["Tunisair", "Turkish Airlines"] },
    { code: "CMN", city: "Casablanca", km: 1520, air: ["Tunisair", "Royal Air Maroc"] },
    { code: "ALG", city: "Alger", km: 640, air: ["Tunisair", "Air Algérie"] },
    { code: "DXB", city: "Dubaï", km: 4550, air: ["Emirates", "Tunisair", "Qatar Airways", "Turkish Airlines"] },
    { code: "DOH", city: "Doha", km: 4050, air: ["Qatar Airways", "Turkish Airlines"] },
    { code: "JED", city: "Djeddah", km: 3250, air: ["Tunisair", "Saudia", "Turkish Airlines"] },
    { code: "CAI", city: "Le Caire", km: 2080, air: ["Tunisair", "Turkish Airlines"] }
  ];
  const directAirlines = { CDG: ["Tunisair", "Air France", "Nouvelair", "Transavia"], ORY: ["Tunisair", "Transavia", "Nouvelair"], MRS: ["Tunisair", "Nouvelair", "Transavia"], LYS: ["Tunisair", "Nouvelair", "Transavia"], NCE: ["Tunisair", "Nouvelair"], FCO: ["Tunisair", "ITA Airways"], FRA: ["Tunisair", "Lufthansa", "Nouvelair"], MUC: ["Tunisair", "Lufthansa"], BRU: ["Tunisair", "Brussels Airlines"], GVA: ["Tunisair", "Swiss"], LHR: ["Tunisair", "British Airways"], IST: ["Tunisair", "Turkish Airlines"], CMN: ["Tunisair", "Royal Air Maroc"], ALG: ["Tunisair", "Air Algérie"], DXB: ["Emirates", "Tunisair"], DOH: ["Qatar Airways"], JED: ["Tunisair", "Saudia"], CAI: ["Tunisair"] };
  const hubs = { "Turkish Airlines": "IST", "Qatar Airways": "DOH", "Air France": "CDG", "Lufthansa": "FRA", "ITA Airways": "FCO", "Royal Air Maroc": "CMN", "Emirates": "DXB", "Saudia": "JED", "Brussels Airlines": "BRU", "Swiss": "ZRH", "British Airways": "LHR", "Air Algérie": "ALG", "Tunisair": "TUN", "Nouvelair": "TUN", "Transavia": "ORY" };
  const airlineFactor = { "Tunisair": 1, "Nouvelair": .9, "Transavia": .82, "Air France": 1.22, "Lufthansa": 1.25, "ITA Airways": 1.1, "Turkish Airlines": 1.05, "Qatar Airways": 1.15, "Emirates": 1.2, "Royal Air Maroc": .98, "Air Algérie": .92, "Saudia": 1.02, "Brussels Airlines": 1.15, "Swiss": 1.3, "British Airways": 1.28 };

  const cities = [
    { id: "hammamet", name: "Hammamet", g1: "#0ea5e9", g2: "#14b8a6" },
    { id: "sousse", name: "Sousse", g1: "#f97316", g2: "#ec4899" },
    { id: "djerba", name: "Djerba", g1: "#06b6d4", g2: "#3b82f6" },
    { id: "tunis", name: "Tunis & Gammarth", g1: "#6366f1", g2: "#0ea5e9" },
    { id: "monastir", name: "Monastir", g1: "#22c55e", g2: "#0ea5e9" },
    { id: "mahdia", name: "Mahdia", g1: "#0891b2", g2: "#a3e635" },
    { id: "tozeur", name: "Tozeur", g1: "#f59e0b", g2: "#b45309" },
    { id: "tabarka", name: "Tabarka", g1: "#16a34a", g2: "#0f766e" },
    { id: "kantaoui", name: "Port El Kantaoui", g1: "#8b5cf6", g2: "#06b6d4" }
  ];
  const hotelTypes = [
    { t: "Resort balnéaire", stars: 5, board: "All Inclusive", base: 260, feats: ["Plage privée", "Spa", "Piscine", "Club enfants", "Wi-Fi"] },
    { t: "Hôtel club familial", stars: 4, board: "All Inclusive", base: 170, feats: ["Plage", "Piscine", "Club enfants", "Animation", "Wi-Fi"] },
    { t: "Hôtel thalasso & spa", stars: 5, board: "Demi-pension", base: 230, feats: ["Thalasso", "Spa", "Piscine couverte", "Wi-Fi"] },
    { t: "Hôtel de charme", stars: 4, board: "Petit-déjeuner", base: 140, feats: ["Piscine", "Restaurant", "Wi-Fi", "Calme"] },
    { t: "Hôtel pieds dans l'eau", stars: 4, board: "Demi-pension", base: 155, feats: ["Plage", "Piscine", "Wi-Fi"] },
    { t: "Hôtel économique", stars: 3, board: "Demi-pension", base: 85, feats: ["Piscine", "Wi-Fi", "Parking"] },
    { t: "Maison d'hôtes", stars: 3, board: "Petit-déjeuner", base: 95, feats: ["Cuisine locale", "Wi-Fi", "Patio"] },
    { t: "Hôtel adults only", stars: 5, board: "All Inclusive", base: 290, feats: ["Adultes uniquement", "Spa", "Plage", "Wi-Fi"] },
    { t: "Résidence appart-hôtel", stars: 3, board: "Logement seul", base: 70, feats: ["Cuisine équipée", "Piscine", "Wi-Fi", "Parking"] }
  ];
  const cityFactor = { hammamet: 1, sousse: .92, djerba: 1.05, tunis: 1.12, monastir: .9, mahdia: .95, tozeur: 1.1, tabarka: .85, kantaoui: 1 };
  const nameBits = ["Jasmin", "Azur", "Les Palmiers", "Marina", "Sidi Bou", "El Medina", "Corail", "Oasis", "Le Golfe", "Carthage", "Riviera", "Dunes", "Andalous", "Belvédère", "Phénicia", "Les Oliviers", "Yasmine", "Nour"];

  const insurers = [
    { p: "STAR Assurances", f: 1.0, rating: 4.1, feats: ["Réseau national", "Assistance 24/7"], claims: "8 j" },
    { p: "GAT Assurances", f: .96, rating: 4.0, feats: ["Constat digital", "Assistance 24/7"], claims: "7 j" },
    { p: "COMAR", f: 1.04, rating: 4.3, feats: ["Véhicule de remplacement", "Assistance 24/7"], claims: "6 j" },
    { p: "Astrée", f: 1.06, rating: 4.4, feats: ["Garage agréé", "Assistance 24/7", "Bris de glace inclus"], claims: "6 j" },
    { p: "BH Assurance", f: .93, rating: 3.9, feats: ["Paiement mensuel", "Assistance"], claims: "9 j" },
    { p: "Maghrebia", f: .99, rating: 4.2, feats: ["Application mobile", "Assistance 24/7"], claims: "7 j" },
    { p: "Lloyd Assurances", f: .97, rating: 4.0, feats: ["Agences nombreuses", "Assistance"], claims: "8 j" },
    { p: "Zitouna Takaful", f: 1.01, rating: 4.1, feats: ["Assurance Takaful", "Partage d'excédent"], claims: "8 j" },
    { p: "AMI Assurances", f: .9, rating: 3.8, feats: ["Prix compétitifs", "Paiement fractionné"], claims: "10 j" }
  ];

  const carCats = [
    { id: "eco", name: "Économique", ex: "Kia Picanto, Hyundai i10", seats: 4, base: 75, bags: 1 },
    { id: "compact", name: "Compacte", ex: "Peugeot 208, Renault Clio", seats: 5, base: 95, bags: 2 },
    { id: "sedan", name: "Berline", ex: "Hyundai Accent, Kia Rio Sedan", seats: 5, base: 115, bags: 3 },
    { id: "suv", name: "SUV", ex: "Dacia Duster, Hyundai Tucson", seats: 5, base: 160, bags: 3 },
    { id: "van", name: "Monospace 7 pl.", ex: "Dacia Lodgy, Kia Carnival", seats: 7, base: 210, bags: 4 },
    { id: "lux", name: "Premium", ex: "Mercedes Classe C, BMW Série 3", seats: 5, base: 330, bags: 3 }
  ];
  const rentals = [
    { p: "Hertz", f: 1.12, feats: ["Km illimité", "Annulation gratuite"], franchise: 1500 },
    { p: "Europcar", f: 1.08, feats: ["Km illimité", "2e conducteur offert"], franchise: 1500 },
    { p: "Avis", f: 1.1, feats: ["Km illimité", "Annulation gratuite"], franchise: 1400 },
    { p: "Sixt", f: 1.18, feats: ["Véhicules récents", "Km illimité"], franchise: 1800 },
    { p: "Budget", f: .95, feats: ["Km illimité"], franchise: 1700 },
    { p: "Enterprise", f: 1.0, feats: ["Km illimité", "Annulation gratuite"], franchise: 1500 }
  ];
  const rentalSpots = ["Aéroport Tunis-Carthage", "Aéroport Enfidha", "Aéroport Monastir", "Aéroport Djerba", "Tunis centre", "Sousse", "Hammamet", "Sfax"];

  const governorates = ["Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", "Béja", "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kébili"];
  const fiberGov = ["Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Sousse", "Monastir", "Sfax", "Bizerte", "Mahdia", "Médenine"];
  const g5Gov = ["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax", "Nabeul", "Monastir"];

  return { providers, internet, mobile, airportsTN, destinations, directAirlines, hubs, airlineFactor, cities, hotelTypes, cityFactor, nameBits, insurers, carCats, rentals, rentalSpots, governorates, fiberGov, g5Gov };
})();
