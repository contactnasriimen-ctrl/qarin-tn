/* Qarin.tn — interface arabe (RTL). Traduction par dictionnaire appliquée au DOM :
   chaque texte français connu est remplacé ; le français d'origine est conservé pour revenir en arrière. */
(function (Q) {
  "use strict";
  const PLACES = {
    "Tunis": "تونس", "Ariana": "أريانة", "Ben Arous": "بن عروس", "Manouba": "منوبة", "Nabeul": "نابل", "Zaghouan": "زغوان", "Bizerte": "بنزرت", "Béja": "باجة",
    "Jendouba": "جندوبة", "Le Kef": "الكاف", "Siliana": "سليانة", "Sousse": "سوسة", "Monastir": "المنستير", "Mahdia": "المهدية", "Sfax": "صفاقس", "Kairouan": "القيروان",
    "Kasserine": "القصرين", "Sidi Bouzid": "سيدي بوزيد", "Gabès": "قابس", "Médenine": "مدنين", "Tataouine": "تطاوين", "Gafsa": "قفصة", "Tozeur": "توزر", "Kébili": "قبلي",
    "Hammamet": "الحمامات", "Djerba": "جربة", "Tabarka": "طبرقة", "Tunis & Gammarth": "تونس وقمرت", "Port El Kantaoui": "مرسى القنطاوي",
    "France": "فرنسا", "Allemagne": "ألمانيا", "Italie": "إيطاليا", "Belgique": "بلجيكا", "Pays-Bas": "هولندا", "Espagne": "إسبانيا",
    "Paris": "باريس", "Marseille": "مرسيليا", "Lyon": "ليون", "Nice": "نيس", "Rome": "روما", "Francfort": "فرانكفورت", "Munich": "ميونيخ", "Bruxelles": "بروكسل", "Genève": "جنيف",
    "Gênes": "جنوة", "Civitavecchia": "تشيفيتافيكيا", "Palerme": "باليرمو", "Salerne": "ساليرنو"
  };
  const AR = Object.assign({}, PLACES, {
    /* en-tête, menus, pied de page */
    "Comparez. Économisez.": "قارن. وفّر.", "Télécom": "اتصالات", "Voyage": "سفر", "Argent": "مال", "Maison": "المنزل", "Diaspora": "بالخارج",
    "Internet": "الإنترنت", "Forfaits mobiles": "باقات الجوال", "Vitesse réelle": "السرعة الحقيقية", "Vols": "الطيران", "Hôtels": "النزل", "Ferry": "الباخرة",
    "Location de voiture": "كراء السيارات", "Transport entre villes": "التنقل بين المدن", "Assurance voyage": "تأمين السفر", "Omra": "العمرة", "Pack vacances": "باقة العطلة",
    "Assurance auto": "تأمين السيارة", "Crédit": "القروض", "Transfert d'argent": "تحويل الأموال", "Panier « Qoffa »": "مقارنة القفة", "Smartphones & high-tech": "الهواتف والإلكترونيات",
    "Énergie solaire": "الطاقة الشمسية", "Budget foyer": "ميزانية العائلة", "Calculateur FCR": "حاسبة FCR",
    "Fibre, VDSL, ADSL, box 4G/5G": "ألياف بصرية، VDSL، ADSL، 4G/5G", "Data, appels, prix au Go": "إنترنت، مكالمات، سعر الجيغا", "Test + carte par gouvernorat": "اختبار + خريطة حسب الولاية",
    "Calendrier des prix": "رزنامة الأسعار", "9 régions": "9 جهات", "Europe → Tunis avec voiture": "أوروبا → تونس بالسيارة", "Aéroports & villes": "المطارات والمدن",
    "Louage, train, bus": "لواج، قطار، حافلة", "Visa Schengen, monde": "تأشيرة شنغن، العالم", "Formules des agences": "عروض الوكالات", "Multi-domaines : coût porte-à-porte": "متعدد المجالات: الكلفة من الباب إلى الباب",
    "Estimation par profil": "تقدير حسب الملف", "Immobilier, auto, consommation": "سكن، سيارة، استهلاك", "Europe → Tunisie": "أوروبا → تونس", "Courses : quelle enseigne ?": "المشتريات: أي فضاء تجاري؟",
    "Prix entre boutiques": "الأسعار بين المتاجر", "Kit Prosol : coût & rentabilité": "Prosol: الكلفة والمردودية", "Toutes vos factures": "كل فواتيرك", "Importer sa voiture ?": "توريد السيارة؟",
    "Version de démonstration": "نسخة تجريبية", "— les prix sont fictifs ou estimés et ne proviennent pas des fournisseurs cités.": "— الأسعار وهمية أو تقديرية ولا تصدر عن المزوّدين المذكورين.",
    "Nos données": "معطياتنا", "Mes favoris": "المفضلة", "À propos": "من نحن", "Mentions légales": "البيانات القانونية", "Argent & foyer": "المال والعائلة",
    "Internet & Fibre": "الإنترنت والألياف", "Box 5G": "مودم 5G", "Assistant débit": "مساعد السرعة",
    "Le comparateur indépendant pour les consommateurs tunisiens. Score personnalisé, comparatif côte à côte, aucune inscription.": "موقع المقارنة المستقل للمستهلك التونسي. تقييم مخصّص، مقارنة جنبًا إلى جنب، ودون تسجيل.",
    "Les marques citées appartiennent à leurs propriétaires respectifs.": "العلامات المذكورة ملك لأصحابها.",
    /* accueil */
    "NOUVEAU": "جديد", "Pack vacances & budget foyer multi-domaines": "باقة العطلة وميزانية العائلة متعددة المجالات",
    "Comparez tout en Tunisie.": "قارن كل شيء في تونس.", "Payez moins.": "وادفع أقل.",
    "Internet, mobile, vols, hôtels, assurance auto et location de voiture : toutes les offres analysées selon": "الإنترنت، الجوال، الطيران، النزل، تأمين وكراء السيارات: كل العروض محلّلة حسب",
    "vos": "أولوياتك", "priorités, gratuitement.": "، ومجانًا.",
    "100 % gratuit": "مجاني 100 %", "Classement neutre": "ترتيب محايد", "Sans inscription": "دون تسجيل", "Pensé pour la Tunisie": "مصمَّم لتونس",
    "Fibre 100 Mbps · Tunis": "ألياف 100 ميغا · تونس", "Comparaison en direct": "مقارنة مباشرة", "Prix mensuel · même débit, prix différents": "السعر الشهري · نفس السرعة وأسعار مختلفة", "le moins cher": "الأرخص",
    "Location": "كراء", "Assurance": "تأمين", "Mobile": "جوال", "Transfert": "تحويل",
    "Départ": "الانطلاق", "Destination": "الوجهة", "Aller": "الذهاب", "Retour (option)": "العودة (اختياري)", "Retour": "العودة", "Voyageurs": "المسافرون", "Rechercher": "بحث",
    "Arrivée": "الوصول", "Adultes": "الكهول", "Enfants": "الأطفال", "Comparer les hôtels": "قارن النزل", "Votre gouvernorat": "ولايتك", "Technologie": "التقنية", "Débit minimum": "السرعة الدنيا",
    "Comparer Internet": "قارن الإنترنت", "Data minimum": "الحد الأدنى للإنترنت", "Budget max / mois": "الميزانية القصوى / شهر", "Comparer les forfaits": "قارن الباقات",
    "Puissance fiscale": "القوة الجبائية", "Valeur du véhicule (DT)": "قيمة السيارة (د.ت)", "Formule": "الصيغة", "Calculer mon devis": "احسب التسعيرة", "Lieu de prise": "مكان الاستلام", "Prise": "الاستلام",
    "Comparer les loueurs": "قارن وكالات الكراء", "Port de départ": "ميناء الانطلاق", "Date": "التاريخ", "Véhicule": "السيارة", "Comparer les ferries": "قارن البواخر",
    "Type de crédit": "نوع القرض", "Montant (DT)": "المبلغ (د.ت)", "Durée (ans)": "المدة (بالسنوات)", "Durée": "المدة", "Simuler": "احسب", "Vous envoyez (€)": "المبلغ المرسَل (€)", "Depuis": "من", "Réception": "الاستلام", "Comparer": "قارن",
    "Toutes": "الكل", "Peu importe": "لا يهم", "Responsabilité civile": "المسؤولية المدنية", "Tiers + vol/incendie": "ضد الغير + سرقة/حريق", "Tiers + vol / incendie": "ضد الغير + سرقة / حريق", "Tous risques": "كل الأخطار",
    "1 adulte": "كهل واحد", "Sans véhicule": "دون سيارة", "Voiture": "سيارة", "Van / 4x4": "شاحنة صغيرة / 4x4", "Moto": "دراجة نارية", "Crédit immobilier": "قرض سكني", "Crédit auto": "قرض سيارة", "Crédit consommation": "قرض استهلاك",
    "Sur compte bancaire": "في حساب بنكي", "Retrait en espèces": "سحب نقدي", "Bureau de poste": "مكتب البريد", "Fauteuil": "مقعد", "Cabine intérieure": "قمرة داخلية", "Cabine extérieure": "قمرة بنافذة",
    "Économique": "اقتصادي", "Affaires": "درجة الأعمال", "25 ans et plus": "25 سنة فما فوق", "Moins de 25 ans": "أقل من 25 سنة", "Aller simple": "ذهاب فقط", "Aller-retour": "ذهاب وإياب", "Oui": "نعم", "Non": "لا", "Neuf": "جديدة",
    "Que voulez-vous comparer ?": "ماذا تريد أن تقارن؟", "Une seule adresse pour toutes vos dépenses du quotidien et du voyage.": "عنوان واحد لكل مصاريفك اليومية وسفراتك.", "19 comparateurs": "19 أداة مقارنة",
    "Voyage & mobilité": "السفر والتنقّل", "Maison & consommation": "المنزل والاستهلاك", "Argent & assurance": "المال والتأمين", "Tunisiens à l'étranger": "التونسيون بالخارج",
    "Forfaits mobiles ": "باقات الجوال", "Ooredoo, Orange, Tunisie Telecom": "Ooredoo وOrange واتصالات تونس", "Vitesse Internet réelle": "سرعة الإنترنت الحقيقية", "Assurance voyage ": "تأمين السفر",
    "Aéroports & centres-villes": "المطارات ووسط المدن", "Trajets entre villes": "التنقل بين المدن", "Avion vs ferry, porte-à-porte": "طائرة أو باخرة، من الباب إلى الباب",
    "Calcul express": "حساب سريع", "Combien pouvez-vous économiser ?": "قدّاش تنجم توفّر؟", "Entrez vos factures actuelles : on cherche la meilleure combinaison Internet + mobiles + assurance.": "أدخل فواتيرك الحالية: نبحث لك عن أفضل تركيبة إنترنت + جوال + تأمين.",
    "Internet (DT/mois)": "الإنترنت (د.ت/شهر)", "Mobiles (DT/mois)": "الجوال (د.ت/شهر)", "Assurance auto (DT/an)": "تأمين السيارة (د.ت/سنة)", "Lignes mobiles": "عدد الخطوط", "Calculer mon économie": "احسب توفيري", "Calculer": "احسب",
    "Multi-domaines": "متعدد المجالات", "Comparez des scénarios complets": "قارن سيناريوهات كاملة", "Plusieurs comparateurs combinés pour obtenir le vrai coût total.": "عدة أدوات مقارنة مجمّعة لمعرفة الكلفة الحقيقية الكاملة.",
    "Pack vacances en Tunisie": "باقة العطلة في تونس", "Comparer les scénarios": "قارن السيناريوهات",
    "Avion + location, avion + transferts ou ferry avec votre voiture : coût porte-à-porte, durée et hôtel compris. Idéal pour les vacances au pays.": "طائرة + كراء سيارة، طائرة + نقل، أو باخرة بسيارتك: الكلفة من الباب إلى الباب مع المدة والنزل. مثالي لعطلة الصيف في البلاد.",
    "Internet + forfaits de toute la famille + assurance auto : la meilleure combinaison, ou tout chez un seul opérateur, et votre économie annuelle.": "إنترنت + باقات كل العائلة + تأمين السيارة: أفضل تركيبة أو كل شيء عند مشغّل واحد، مع التوفير السنوي.",
    "Comparaison avancée": "مقارنة متقدّمة", "Bien plus qu'une liste de prix": "أكثر بكثير من قائمة أسعار", "Des outils pour décider vite, et bien.": "أدوات لتقرّر بسرعة وبشكل صحيح.",
    "Score personnalisé": "تقييم مخصّص", "Comparatif côte à côte": "مقارنة جنبًا إلى جنب", "Assistant débit idéal": "مساعد السرعة المثالية",
    "Réglez l'importance du prix, du débit, de la flexibilité… le classement se recalcule instantanément.": "حدّد أهمية السعر والسرعة والمرونة… ويُعاد الترتيب فورًا.",
    "Jusqu'à 3 offres, meilleure valeur surlignée, verdict et économie chiffrée. Partageable et imprimable.": "حتى 3 عروض، أفضل قيمة مميّزة، حكم نهائي وتوفير بالأرقام. قابلة للمشاركة والطباعة.",
    "3 questions sur votre foyer et vos usages : on calcule le débit qu'il vous faut vraiment.": "3 أسئلة عن عائلتك واستعمالك: نحسب السرعة التي تحتاجها فعلًا.",
    "Visualisez les prix des vols jour par jour et partez au meilleur moment.": "شاهد أسعار الرحلات يومًا بيوم وسافر في أفضل وقت.",
    "Mis à jour en continu": "تحديث متواصل", "Les bons plans du moment": "أفضل العروض حاليًا", "Calculés automatiquement à partir de nos comparateurs.": "محسوبة آليًا من أدوات المقارنة.", "dès": "ابتداءً من",
    "Fibre la moins chère": "أرخص ألياف بصرية", "Meilleur prix au Go": "أفضل سعر للجيغا", "Vol aller · Tunis → Paris": "رحلة ذهاب · تونس ← باريس",
    "Simple": "بسيط", "Comment ça marche ?": "كيف يعمل؟", "La meilleure offre en moins de 2 minutes.": "أفضل عرض في أقل من دقيقتين.",
    "Indiquez votre besoin": "حدّد حاجتك", "Destination, gouvernorat, véhicule… quelques champs suffisent.": "الوجهة، الولاية، السيارة… بعض الخانات تكفي.",
    "Comparez selon vos priorités": "قارن حسب أولوياتك", "Filtres intelligents, score personnalisé, comparatif détaillé jusqu'à 3 offres.": "فلاتر ذكية، تقييم مخصّص، ومقارنة مفصّلة حتى 3 عروض.",
    "Souscrivez directement": "اشترك مباشرة", "Un clic vous mène à l'offre chez le fournisseur. Aucun frais de notre part.": "نقرة واحدة توصلك إلى العرض عند المزوّد. دون أي مصاريف من جهتنا.",
    "offres télécom": "عرض اتصالات", "liaisons aériennes": "خط جوي", "assureurs, banques, loueurs & services": "شركة تأمين وبنك ووكالة وخدمة", "comparateurs & calculateurs": "أداة مقارنة وحساب",
    "FAQ": "أسئلة شائعة", "Questions fréquentes": "الأسئلة المتكررة",
    "Qarin.tn est-il vraiment gratuit ?": "هل قارن مجاني فعلًا؟",
    "Oui. La comparaison est gratuite et sans inscription. Le site peut être rémunéré par certains partenaires lorsque vous souscrivez via un lien, sans surcoût pour vous et sans influence sur le classement.": "نعم. المقارنة مجانية ودون تسجيل. قد يتحصّل الموقع على عمولة من بعض الشركاء عند الاشتراك عبر رابط، دون أي كلفة إضافية عليك ودون تأثير على الترتيب.",
    "Comment fonctionne le score personnalisé ?": "كيف يعمل التقييم المخصّص؟",
    "Chaque offre est notée sur plusieurs critères (prix, performance, flexibilité, service…). Vous choisissez l'importance de chaque critère avec les curseurs « Mes priorités » : le score sur 10 et le pourcentage de correspondance sont recalculés immédiatement.": "كل عرض يُقيَّم حسب عدة معايير (السعر، الأداء، المرونة، الخدمة…). تختار أهمية كل معيار عبر «أولوياتي»، فيُعاد حساب التقييم على 10 ونسبة التوافق فورًا.",
    "Comment comparer des offres côte à côte ?": "كيف أقارن العروض جنبًا إلى جنب؟",
    "Cliquez sur « Comparer » sur 2 ou 3 offres, puis sur le bouton en bas de l'écran. Vous obtenez un tableau détaillé, la meilleure valeur surlignée, un verdict et l'économie réalisable. Le comparatif peut être partagé par lien ou imprimé.": "اضغط «قارن» على عرضين أو ثلاثة، ثم على الزر أسفل الشاشة. تحصل على جدول مفصّل مع أفضل قيمة مميّزة، وحكم نهائي، والتوفير الممكن. يمكن مشاركة المقارنة أو طباعتها.",
    "D'où viennent les prix ? Sont-ils garantis ?": "من أين تأتي الأسعار؟ وهل هي مضمونة؟",
    "Le site est actuellement une version de démonstration : les prix sont fictifs ou estimés par des modèles et ne proviennent pas des fournisseurs. Ils seront remplacés par des tarifs publics sourcés et datés, et par des flux officiels (affiliation, partenariats). Détails dans « Nos données & méthodologie ».": "الموقع حاليًا نسخة تجريبية: الأسعار وهمية أو تقديرية ولا تصدر عن المزوّدين. سيتم تعويضها بأسعار عمومية موثّقة ومؤرّخة وبمعطيات رسمية (شراكات وعمولات). التفاصيل في صفحة «معطياتنا».",
    "Qu'est-ce que le Pack vacances et le Budget foyer ?": "ما هي باقة العطلة وميزانية العائلة؟",
    "Ce sont des comparaisons multi-domaines : elles combinent plusieurs comparateurs (vols, ferry, hôtels, location… ou Internet, mobiles, assurance) pour comparer des scénarios complets sur leur coût total.": "هي مقارنات متعددة المجالات تجمع عدة أدوات (طيران، باخرة، نزل، كراء… أو إنترنت، جوال، تأمين) لمقارنة سيناريوهات كاملة حسب كلفتها الجملية.",
    "La fibre est-elle disponible chez moi ?": "هل الألياف البصرية متوفرة عندي؟",
    "Choisissez votre gouvernorat dans le comparateur Internet : seules les technologies généralement disponibles dans votre zone sont affichées. L'éligibilité exacte à votre adresse se vérifie chez l'opérateur.": "اختر ولايتك في مقارنة الإنترنت: تظهر فقط التقنيات المتوفرة عمومًا في منطقتك. التأكد من توفّرها في عنوانك يتم لدى المشغّل.",
    "Pas sûr du débit qu'il vous faut ?": "لست متأكدًا من السرعة التي تحتاجها؟", "Notre assistant le calcule en 3 questions et filtre les offres pour vous.": "مساعدنا يحسبها في 3 أسئلة ويصفّي العروض لك.", "Lancer l'assistant": "شغّل المساعد",
    /* moteur de résultats */
    "Accueil": "الرئيسية", "Filtres": "التصفية", "Tout effacer": "مسح الكل", "Afficher": "عرض", "résultats": "نتيجة", "Score personnalisé — mes priorités": "تقييم مخصّص — أولوياتي",
    "Ignoré": "غير مهم", "Faible": "ضعيف", "Modéré": "متوسط", "Important": "مهم", "Très important": "مهم جدًا", "Essentiel": "أساسي",
    "Pour vous": "الأنسب لك", "Prix": "السعر", "Débit": "السرعة", "Coût total": "الكلفة الجملية", "Moins cher": "الأرخص", "Plus rapide": "الأسرع", "Meilleur compromis": "أفضل توازن", "Data": "الإنترنت",
    "Prix / Go": "السعر / جيغا", "Note": "التقييم", "Étoiles": "النجوم", "Satisfaction": "رضا الحرفاء", "Franchise": "مبلغ الضمان", "Mensualité": "القسط الشهري", "Montant reçu": "المبلغ المستلم", "Rapidité": "السرعة", "Couverture": "التغطية", "Proximité": "القرب", "Prix livré": "السعر مع التوصيل",
    "Équilibré": "متوازن", "Petit budget": "ميزانية محدودة", "Performance": "الأداء", "Télétravail": "العمل عن بعد", "Flexibilité": "المرونة", "Gros consommateur data": "استهلاك كبير للإنترنت", "Bavard": "كثير المكالمات",
    "Le moins cher": "الأرخص", "Le plus rapide": "الأسرع", "Confort": "الراحة", "Rapport qualité/prix": "الجودة مقابل السعر", "Luxe": "فخامة", "Pieds dans l'eau": "على البحر", "Prix avant tout": "السعر أولًا",
    "Protection maximale": "حماية قصوى", "Service client": "خدمة الحرفاء", "Famille": "عائلة", "Sérénité": "راحة البال", "Maximum reçu": "أقصى مبلغ مستلم", "Urgent": "مستعجل", "Coût total minimum": "أقل كلفة جملية", "Mensualité la plus basse": "أقل قسط شهري",
    "Rapide": "سريع", "Écologique": "صديق للبيئة", "Juste pour le visa": "للتأشيرة فقط", "Bien couvert": "تغطية جيدة", "Proche du Haram": "قريب من الحرم",
    "Prix": "السعر", "Envoi (upload)": "الرفع (upload)", "Sans engagement": "دون التزام", "Volume de data": "حجم الإنترنت", "Appels": "المكالمات", "Vol direct": "رحلة مباشرة", "Bagage soute": "أمتعة الشحن",
    "Note des clients": "تقييم الحرفاء", "Catégorie (étoiles)": "الصنف (نجوم)", "Proximité plage": "القرب من البحر", "Satisfaction clients": "رضا الحرفاء", "Garanties": "الضمانات", "Rapidité d'indemnisation": "سرعة التعويض",
    "Franchise basse": "ضمان منخفض", "Annulation gratuite": "إلغاء مجاني", "Espace": "المساحة", "Frais de dossier": "مصاريف الملف", "Frais fixes bas": "مصاريف ثابتة منخفضة", "Confort / avis": "الراحة / الآراء",
    "Gouvernorat": "الولاية", "Prix max": "السعر الأقصى", "Installation offerte": "تركيب مجاني", "Fournisseurs": "المزوّدون", "Coût total calculé sur": "الكلفة الجملية محسوبة على", "12 mois": "12 شهرًا", "24 mois": "24 شهرًا", "36 mois": "36 شهرًا",
    "Opérateurs": "المشغّلون", "Budget max": "الميزانية القصوى", "Appels illimités": "مكالمات غير محدودة", "5G incluse": "5G مشمولة", "Vols directs uniquement": "رحلات مباشرة فقط", "Bagage soute inclus": "أمتعة الشحن مشمولة",
    "Heure de départ": "وقت الانطلاق", "Matin": "صباحًا", "Après-midi": "بعد الظهر", "Soir": "مساءً", "Prix max / pers.": "السعر الأقصى / شخص", "Compagnies": "الشركات", "Note minimum": "التقييم الأدنى", "Pension": "الإقامة",
    "Prix max / nuit": "السعر الأقصى / ليلة", "Équipements": "التجهيزات", "Satisfaction minimum": "الرضا الأدنى", "Bris de glace inclus": "كسر البلور مشمول", "Assistance 24/7": "مساعدة 24/7", "Prime max": "القسط الأقصى", "Assureurs": "شركات التأمين",
    "Catégorie": "الصنف", "Boîte automatique": "علبة سرعة أوتوماتيكية", "Prix max / jour": "السعر الأقصى / يوم", "Loueurs": "وكالات الكراء", "Financement islamique uniquement": "تمويل إسلامي فقط", "Mensualité max": "القسط الأقصى", "Banques": "البنوك",
    "Disponible en moins d'1 h": "متوفر في أقل من ساعة", "Sans frais fixes": "دون مصاريف ثابتة", "Services": "الخدمات", "Modes de transport": "وسائل النقل", "Bagages couverts": "الأمتعة مشمولة", "Multi-entrées": "متعدد الدخول",
    "Hôtel": "النزل", "Distance du Haram": "المسافة عن الحرم", "Agences": "الوكالات", "En stock uniquement": "المتوفر فقط", "Paiement en plusieurs fois": "الدفع بالتقسيط", "Boutiques": "المتاجر",
    "Toutes": "الكل", "Très bien 8+": "جيد جدًا +8", "Superbe 8,5+": "رائع +8.5", "Exceptionnel 9+": "استثنائي +9", "Plage": "شاطئ", "Plage privée": "شاطئ خاص", "Piscine": "مسبح", "Spa": "سبا", "Club enfants": "نادي الأطفال", "Adultes uniquement": "للكهول فقط", "Thalasso": "معالجة بمياه البحر", "Wi-Fi": "واي فاي",
    "All Inclusive": "كل شيء مشمول", "Demi-pension": "نصف إقامة", "Petit-déjeuner": "فطور الصباح", "Logement seul": "إقامة فقط", "Pension complète": "إقامة كاملة",
    "Installation": "التركيب", "Engagement": "الالتزام", "Aucun": "لا يوجد", "Offerte": "مجانية", "Offerts": "مجانية", "Prix / Mbps": "السعر / ميغا", "Envoi": "الرفع",
    "Détails & calcul": "التفاصيل والحساب", "Signaler une erreur": "الإبلاغ عن خطأ", "Donnée de démonstration": "معطى تجريبي", "Prix de démonstration": "سعر تجريبي", "Sauver": "حفظ", "Sauvé": "محفوظ",
    "Voir l'offre": "شاهد العرض", "Prix le plus bas": "أقل سعر", "Le plus reçu": "أكبر مبلغ مستلم", "Promo": "تخفيض", "Excellent": "ممتاز", "Très bien": "جيد جدًا", "Bien": "جيد", "Correct": "مقبول", "Moyen": "متوسط",
    "Afficher plus d'offres": "عرض المزيد", "Aucune offre ne correspond": "لا يوجد عرض مطابق", "Essayez d'élargir vos filtres.": "جرّب توسيع خيارات التصفية.", "Réinitialiser les filtres": "إعادة ضبط التصفية",
    "SMS": "الإرساليات", "Aucun ": "لا يوجد", "Illimités": "غير محدودة", "Illimitées": "غير محدودة", "Illimitées nat.": "غير محدودة وطنيًا", "Direct": "مباشرة", "vol direct": "رحلة مباشرة", "Places": "المقاعد", "Bagages": "الأمتعة", "Clim": "مكيّف",
    "ou similaire": "أو ما يماثلها", "Automatique": "أوتوماتيكية", "Manuelle": "يدوية", "Taux": "النسبة", "Hors assurance": "دون تأمين", "Frais dossier": "مصاريف الملف", "Frais": "المصاريف", "Taux appliqué": "سعر الصرف المطبّق", "Marge de change": "هامش الصرف", "Coût réel": "الكلفة الحقيقية",
    "Passagers": "المسافرون", "À bord": "على متن الباخرة", "Avis": "الآراء", "Express": "سريع", "Sans marge de change": "دون هامش صرف", "Mourabaha": "مرابحة",
    "Prix mensuel": "السعر الشهري", "Coût annuel": "الكلفة السنوية", "Prix par Go": "السعر للجيغا", "Contenu": "المحتوى", "Contrat": "العقد", "Inclus": "يشمل", "Trajet": "الرحلة", "Escales": "التوقفات", "Départ aller": "انطلاق الذهاب", "Bagage": "الأمتعة", "Compagnie": "الشركة", "Qualité": "الجودة",
    "Prime annuelle": "القسط السنوي", "Par mois": "في الشهر", "Service": "الخدمة", "Mensualités": "الأقساط", "Coût": "الكلفة", "Intérêts": "الفوائد", "Banque": "البنك", "Montants": "المبالغ", "Délai": "الأجل", "Total": "المجموع", "Par passager": "لكل مسافر", "Traversée": "العبور", "Par personne": "للشخص", "Par pèlerin": "لكل معتمر", "Séjour": "الإقامة",
    "Différences uniquement": "الاختلافات فقط", "Partager": "مشاركة", "Imprimer": "طباعة", "WhatsApp": "واتساب", "Meilleur choix pour vous": "أفضل خيار لك", "Le plus économique": "الأكثر توفيرًا", "Le plus couvrant": "الأكثر تغطية", "Le mieux noté": "الأعلى تقييمًا", "Le plus de data": "أكثر إنترنت",
    "Coût total le plus bas": "أقل كلفة جملية", "La plus courte": "الأقصر", "Le plus spacieux": "الأكثر اتساعًا", "La meilleure couverture": "أفضل تغطية", "Le plus proche du Haram": "الأقرب إلى الحرم", "Meilleure garantie": "أفضل ضمان",
    "Cellules vertes = meilleure valeur sur la ligne. Tarifs indicatifs, à confirmer chez le fournisseur.": "الخانات الخضراء = أفضل قيمة في السطر. أسعار تقريبية يجب تأكيدها لدى المزوّد.",
    "Ajoutez une offre": "أضف عرضًا", "pour lancer le comparatif": "لبدء المقارنة", "Tableau détaillé + verdict": "جدول مفصّل + حكم نهائي", "Prix équivalents": "أسعار متقاربة",
    "Ajouté à vos favoris": "أُضيف إلى المفضلة", "Retiré des favoris": "حُذف من المفضلة", "Ajoutez une 2ᵉ offre pour comparer": "أضف عرضًا ثانيًا للمقارنة", "Maximum 3 offres — retirez-en une d'abord": "3 عروض كحدّ أقصى — احذف واحدًا أولًا",
    "Lien du comparatif copié": "تم نسخ رابط المقارنة", "Alerte prix activée": "تم تفعيل تنبيه السعر", "Filtres de l'assistant appliqués": "تم تطبيق اختيارات المساعد", "Sélectionnez au moins 2 offres": "اختر عرضين على الأقل",
    "Tarifs indicatifs": "أسعار تقريبية", "— estimations établies à partir des grilles publiques. Le prix final est toujours confirmé sur le site du fournisseur.": "— تقديرات مبنية على التعريفات العمومية. السعر النهائي يُؤكَّد دائمًا على موقع المزوّد.",
    "Choix Qarin": "اختيار قارن", "Alerte prix": "تنبيه السعر", "Créer une alerte prix": "إنشاء تنبيه سعر", "Prévenez-moi sous": "نبّهني تحت", "Activer l'alerte": "فعّل التنبيه",
    /* détails & caractéristiques des offres */
    "Frais d'installation": "مصاريف التركيب", "Équivalent mensuel réel": "المعادل الشهري الحقيقي", "1er mois offert": "الشهر الأول مجاني", "Sans ligne fixe": "دون خط قار", "Zones 5G couvertes": "المناطق المغطاة بـ5G",
    "Prêt à l'emploi": "جاهز للاستعمال", "Modem offert": "مودم مجاني", "Routeur Wi-Fi 6": "موزّع Wi-Fi 6", "Routeur Wi-Fi 6E": "موزّع Wi-Fi 6E", "Ligne fixe incluse": "خط قار مشمول", "Appels fixes illimités soir & WE": "مكالمات قارة غير محدودة مساءً وفي العطل",
    "Modem Wi-Fi offert": "مودم Wi-Fi مجاني", "Installation gratuite": "تركيب مجاني", "IPTV en option": "IPTV اختياري", "Débit montant élevé": "سرعة رفع عالية", "Assistance 7j/7": "مساعدة 7/7", "Modem VDSL offert": "مودم VDSL مجاني",
    "IP fixe en option": "IP ثابت اختياري", "Priorité support": "أولوية في الدعم", "Sans plafond de volume": "دون سقف للاستهلاك", "Modem VDSL": "مودم VDSL", "Routeur Wi-Fi": "موزّع Wi-Fi", "Bonus data mobile": "إنترنت جوال إضافي",
    "Réseaux sociaux inclus": "مواقع التواصل مشمولة", "Roaming Maghreb 1 Go": "تجوال مغاربي 1 جيغا", "Appels int. 60 min": "مكالمات دولية 60 دقيقة", "Report de data": "ترحيل الإنترنت المتبقي", "Appels Europe 60 min": "مكالمات نحو أوروبا 60 دقيقة",
    "Couverture rurale large": "تغطية واسعة في الأرياف", "Appels fixe illimités": "مكالمات غير محدودة نحو القار", "Roaming Europe 2 Go": "تجوال أوروبا 2 جيغا", "Idéal tablette / routeur": "مثالي للوحة أو الموزّع", "Illimitées": "غير محدودة",
    "Réseau national": "شبكة وطنية", "Constat digital": "معاينة رقمية", "Véhicule de remplacement": "سيارة تعويضية", "Garage agréé": "ورشة معتمدة", "Paiement mensuel": "دفع شهري", "Application mobile": "تطبيق جوال", "Agences nombreuses": "وكالات عديدة",
    "Assurance Takaful": "تأمين تكافلي", "Partage d'excédent": "تقاسم الفائض", "Prix compétitifs": "أسعار تنافسية", "Paiement fractionné": "دفع مجزّأ", "Assistance": "مساعدة", "Assistance 0 km": "مساعدة من 0 كم", "Défense & recours": "الدفاع والرجوع", "Incendie": "الحريق", "Vol ": "السرقة", "Bris de glace": "كسر البلور", "Dommages collision": "أضرار الاصطدام", "Tous dommages": "كل الأضرار",
    "Km illimité": "كيلومترات غير محدودة", "2e conducteur offert": "سائق ثانٍ مجانًا", "Véhicules récents": "سيارات حديثة",
    "Resort balnéaire": "منتجع شاطئي", "Hôtel club familial": "نزل عائلي", "Hôtel thalasso & spa": "نزل علاج بمياه البحر وسبا", "Hôtel de charme": "نزل راقٍ", "Hôtel pieds dans l'eau": "نزل على البحر", "Hôtel économique": "نزل اقتصادي",
    "Maison d'hôtes": "دار ضيافة", "Hôtel adults only": "نزل للكهول فقط", "Résidence appart-hôtel": "إقامة شقق فندقية", "Restaurant": "مطعم", "Calme": "هادئ", "Parking": "موقف سيارات", "Cuisine locale": "مطبخ محلي", "Patio": "فناء", "Cuisine équipée": "مطبخ مجهّز", "Animation": "تنشيط", "Accès direct plage": "وصول مباشر إلى الشاطئ",
    "Réseau d'agences étendu": "شبكة فروع واسعة", "Réponse rapide": "ردّ سريع", "Simulation en ligne": "محاكاة على الإنترنت", "Banque en ligne": "بنك على الإنترنت", "Spécialiste de l'habitat": "مختص في السكن", "Banque publique": "بنك عمومي", "Frais de dossier réduits": "مصاريف ملف مخفّضة", "Conseiller dédié": "مستشار خاص", "Financement islamique (Mourabaha)": "تمويل إسلامي (مرابحة)",
    "Taux de change réel": "سعر الصرف الحقيقي", "Suivi en ligne": "متابعة على الإنترنت", "Réseau d'agences dense": "شبكة وكالات كثيفة", "Agences en Europe": "وكالات في أوروبا", "Frais offerts dès 500 €": "دون مصاريف ابتداءً من 500 €", "Garantie de délai": "ضمان الأجل", "Retrait en bureau de poste": "سحب من مكتب البريد", "Sans compte bancaire": "دون حساب بنكي", "Depuis votre banque": "من بنكك", "Montants élevés": "مبالغ كبيرة",
    "Quelques minutes": "بضع دقائق", "Quelques heures": "بضع ساعات", "2 à 4 jours": "من 2 إلى 4 أيام", "2 à 5 jours": "من 2 إلى 5 أيام",
    "Compagnie nationale": "الشركة الوطنية", "Restauration à bord": "أكل على متن الباخرة", "Navires récents": "بواخر حديثة", "Cabines climatisées": "قمرات مكيّفة", "Wi-Fi à bord": "واي فاي على المتن", "Animations": "تنشيط", "Piscine à bord (selon navire)": "مسبح على المتن (حسب الباخرة)", "Restaurants": "مطاعم",
    "Rapatriement sanitaire": "الترحيل الصحي", "Attestation pour le visa": "شهادة للتأشيرة", "Pas de départ ce jour": "لا رحلة في هذا اليوم",
    /* pages */
    "Comparateur Internet": "مقارنة الإنترنت", "Fibre, VDSL, ADSL et box 4G/5G de tous les fournisseurs tunisiens, classés selon vos priorités.": "ألياف، VDSL، ADSL و4G/5G لكل المزوّدين في تونس، مرتّبة حسب أولوياتك.",
    "Quel débit vous faut-il vraiment ?": "ما السرعة التي تحتاجها فعلًا؟", "Répondez à 3 questions, on calcule et on filtre pour vous.": "أجب عن 3 أسئلة، ونحسب ونصفّي لك.",
    "Data, appels et prix : trouvez le forfait qui vous ressemble.": "إنترنت ومكالمات وسعر: اختر الباقة التي تناسبك.",
    "Assurance auto": "تأمين السيارة", "Location de voiture ": "كراء السيارات",
    "Transport": "التنقل", "Voir le trajet": "شاهد المسار", "Le plus écologique": "الأكثر احترامًا للبيئة", "Distance": "المسافة", "Prix / pers.": "السعر / شخص", "Coût voiture": "كلفة السيارة", "CO₂ / pers.": "CO₂ / شخص", "Fréquence": "التواتر",
    "Louage": "لواج", "Bus interurbain": "حافلة بين المدن", "Train · 2ᵉ classe": "قطار · الدرجة الثانية", "Train · 1ʳᵉ / Confort": "قطار · الدرجة الأولى", "Votre voiture": "سيارتك",
    "Départ dès que le louage est plein": "ينطلق عند امتلاء اللواج", "Plusieurs départs par jour": "عدة رحلات في اليوم", "Horaires fixes": "مواعيد ثابتة", "Quand vous voulez": "متى شئت",
    "Départs fréquents": "رحلات متكررة", "Stations en centre-ville": "محطات وسط المدينة", "Place assise garantie": "مقعد مضمون", "Bagages en soute": "أمتعة في الصندوق", "Pas d'embouteillages": "دون اكتظاظ", "Bagages libres": "أمتعة حرة", "Sièges confort": "مقاعد مريحة", "Climatisation": "تكييف", "Porte-à-porte": "من الباب إلى الباب", "Routes nationales": "طرقات وطنية",
    "Assurance voyage ": "تأمين السفر", "Conforme visa Schengen": "مطابق لتأشيرة شنغن", "Site de l'assureur": "موقع شركة التأمين", "Frais médicaux": "المصاريف الطبية", "Rapatriement": "الترحيل الصحي", "Resp. civile": "المسؤولية المدنية", "Sports & loisirs": "الرياضة والترفيه",
    "Durée (jours)": "المدة (بالأيام)", "Âge du voyageur": "عمر المسافر", "Europe / Schengen": "أوروبا / شنغن", "Monde hors USA/Canada": "العالم دون أمريكا/كندا", "Monde entier": "كل العالم",
    "Et le Hajj ?": "وماذا عن الحج؟", "Période": "الفترة", "Hors Ramadan": "خارج رمضان", "Pendant le Ramadan": "في رمضان", "Chambre": "الغرفة", "Quadruple": "رباعية", "Triple": "ثلاثية", "Double": "ثنائية", "Pèlerins": "المعتمرون",
    "Formule économique": "الصيغة الاقتصادية", "Formule standard": "الصيغة العادية", "Formule courte": "الصيغة القصيرة", "Formule confort": "الصيغة المريحة", "Formule premium": "الصيغة الممتازة", "Formule longue": "الصيغة الطويلة",
    "Visa inclus": "التأشيرة مشمولة", "Transferts inclus": "النقل مشمول", "Accompagnateur": "مرافق", "Vol": "الرحلة", "Repas": "الأكل", "Avec escale": "مع توقف", "Bientôt disponible": "قريبًا",
    "Produit": "المنتج", "Comparer les boutiques": "قارن المتاجر", "En stock": "متوفر", "Sur commande": "حسب الطلب", "Livraison": "التوصيل", "Garantie": "الضمان", "Facilités": "التسهيلات", "Voir en boutique": "شاهد في المتجر",
    "Mon panier": "قفتي", "Vider": "إفراغ", "Mettre à jour": "تحديث", "Produits frais": "منتجات طازجة", "Épicerie": "مواد غذائية", "Boissons": "مشروبات", "Hygiène": "نظافة شخصية", "Bébé": "رضيع", "Détail par produit": "التفاصيل حسب المنتج", "Produit ": "المنتج",
    "Votre panier est vide": "قفّتك فارغة", "Ajoutez des produits avec les boutons +.": "أضف منتجات بأزرار +.", "Tous les produits disponibles": "كل المنتجات متوفرة",
    "Facture d'électricité (DT / 2 mois)": "فاتورة الكهرباء (د.ت / شهرين)", "Surface de toit libre (m²)": "مساحة السطح المتاحة (م²)", "Paramètres avancés (aides, tarif)": "إعدادات متقدمة (المنح، التعريفة)",
    "Aide publique estimée (%)": "المنحة العمومية التقديرية (%)", "Plafond de l'aide (DT)": "سقف المنحة (د.ت)", "Prix moyen du kWh (DT)": "متوسط سعر الكيلواط ساعة (د.ت)", "reste à payer après aide": "المتبقي للدفع بعد المنحة",
    "Coût de l'installation": "كلفة التركيب", "Aide estimée": "المنحة التقديرية", "Production": "الإنتاج", "Économie sur la facture": "التوفير في الفاتورة", "Remboursé en": "مسترجع في", "Gain net sur 20 ans": "الربح الصافي على 20 سنة",
    "Meilleur gain sur 20 ans": "أفضل ربح على 20 سنة", "Entrée de gamme": "الصنف الأساسي", "Standard": "عادي", "Premium": "ممتاز",
    "Prix d'achat en Europe (€)": "سعر الشراء في أوروبا (€)", "Carburant": "الوقود", "Essence": "بنزين", "Diesel": "ديزل", "Hybride": "هجينة", "Électrique": "كهربائية", "Cylindrée (cm³)": "سعة المحرك (سم³)", "Âge du véhicule (ans)": "عمر السيارة (سنوات)",
    "Prix du même modèle en Tunisie (DT)": "سعر نفس النوع في تونس (د.ت)", "Port d'embarquement": "ميناء الإبحار", "Taux utilisés (modifiables)": "النسب المستعملة (قابلة للتعديل)", "Droit de douane (%)": "المعلوم الديواني (%)",
    "Droit de consommation (%)": "معلوم الاستهلاك (%)", "TVA (%)": "الأداء على القيمة المضافة (%)", "Réduction FCR (%)": "تخفيض FCR (%)", "Frais divers (DT)": "مصاريف مختلفة (د.ت)",
    "Importer avec le régime FCR": "التوريد بنظام FCR", "Importer sans avantage (régime commun)": "التوريد دون امتياز (النظام العام)", "Acheter le même modèle en Tunisie": "شراء نفس النوع في تونس", "Si vous êtes éligible": "إن كنت معنيًا",
    "Détail des taxes (régime commun)": "تفاصيل المعاليم (النظام العام)", "Total des taxes": "مجموع المعاليم", "coût total estimé": "الكلفة الجملية التقديرية", "Important — simulation indicative.": "مهم — محاكاة تقريبية.",
    "Ping": "زمن الاستجابة", "Téléchargement": "التحميل", "Données": "المعطيات", "Lancer le test": "ابدأ الاختبار", "Relancer le test": "أعد الاختبار", "Test en cours…": "الاختبار جارٍ…", "Fournisseur": "المزوّد",
    "Débit de l'abonnement (Mbps)": "سرعة الاشتراك (ميغا)", "Enregistrer ma mesure": "سجّل قياسي", "Carte des débits moyens": "خريطة متوسط السرعات", "Tous": "الكل", "Mes mesures": "قياساتي", "Fournisseur ": "المزوّد",
    "Avion + voiture de location": "طائرة + كراء سيارة", "Avion + transferts": "طائرة + نقل", "Ferry avec votre voiture": "باخرة بسيارتك", "Récapitulatif": "ملخّص", "Meilleure valeur en vert.": "أفضل قيمة باللون الأخضر.",
    "Rapide": "سريع", "Liberté sur place": "حرية التنقل", "Bagages limités": "أمتعة محدودة", "Caution de location": "ضمان الكراء", "Le plus simple": "الأبسط", "Aucune conduite": "دون سياقة", "Peu mobile sur place": "تنقل محدود",
    "Excursions en supplément": "الجولات بمقابل", "Votre voiture sur place": "سيارتك معك", "Bagages sans limite": "أمتعة دون حدود", "Trajet long": "رحلة طويلة", "Réservation tôt l'été": "الحجز مبكرًا في الصيف",
    "Votre foyer": "عائلتك", "Personnes": "عدد الأفراد", "Usage Internet": "استعمال الإنترنت", "Data / ligne": "إنترنت / خط", "Votre voiture": "سيارتك", "Voiture à assurer": "سيارة للتأمين", "Puissance": "القوة", "Valeur (DT)": "القيمة (د.ت)",
    "Ce que vous payez aujourd'hui": "ما تدفعه اليوم", "(optionnel)": "(اختياري)", "Internet (DT/mois)": "الإنترنت (د.ت/شهر)", "Mobiles (DT/mois, total)": "الجوال (د.ت/شهر، المجموع)", "Assurance (DT/an)": "التأمين (د.ت/سنة)",
    "Web & réseaux sociaux": "الويب ومواقع التواصل", "Streaming HD, visio": "فيديو HD ومكالمات فيديو", "4K, jeux, télétravail": "4K، ألعاب، عمل عن بعد", "Meilleure combinaison": "أفضل تركيبة", "Multi-fournisseurs": "عدة مزوّدين", "Un seul opérateur": "مشغّل واحد",
    "Récapitulatif annuel": "الملخّص السنوي", "Total annuel": "المجموع السنوي", "Internet / an": "الإنترنت / سنة", "Mobiles / an": "الجوال / سنة",
    "Nos données & méthodologie": "معطياتنا ومنهجيتنا", "Statut des données par comparateur": "وضعية المعطيات حسب كل أداة", "Nos engagements": "التزاماتنا", "Comment les vrais prix seront intégrés": "كيف سيتم إدماج الأسعار الحقيقية", "Méthode de calcul": "طريقة الحساب",
    "Comparateur": "أداة المقارنة", "Statut": "الوضعية", "Origine actuelle": "المصدر الحالي", "Source prévue (légale)": "المصدر المبرمج (قانوني)", "Démo": "تجريبي",
    "Offres sauvegardées": "العروض المحفوظة", "Mes alertes prix": "تنبيهات الأسعار", "Revoir la recherche": "إعادة البحث", "Voir": "شاهد", "Aucun favori pour l'instant": "لا توجد عروض محفوظة بعد", "Commencer à comparer": "ابدأ المقارنة", "Atteint !": "تم بلوغه!", "En attente": "في الانتظار",
    "Page introuvable": "الصفحة غير موجودة", "Retour à l'accueil": "العودة إلى الرئيسية"
  });
  // noms de produits du panier
  (Q.D.products || []).forEach((p) => (AR[p.n] = p.ar));

  const NOUNS = { offres: "عرض", forfaits: "باقة", vols: "رحلة", "hébergements": "نزل", assureurs: "شركة تأمين", "véhicules": "سيارة", "traversées": "رحلة بحرية", banques: "بنك", services: "خدمة", options: "خيار", formules: "صيغة", boutiques: "متجر" };
  const T = (s) => AR[s] || s;
  const RX = [
    [/^(\d+) (offres|forfaits|vols|hébergements|assureurs|véhicules|traversées|banques|services|options|formules|boutiques)$/, (m, n, w) => `${n} ${NOUNS[w]}`],
    [/^disponibles à (.+)$/, (m, g) => "متوفرة في " + T(g)], [/^à (.+)$/, (m, g) => "في " + T(g)],
    [/^(\d+) % pour vous$/, "$1 % مناسب لك"], [/^sur (\d+) mois$/, "على $1 شهرًا"], [/^Coût (\d+) mois$/, "الكلفة على $1 شهرًا"],
    [/^Comparatif (.+)$/, (m, x) => "مقارنة: " + T(x)], [/^(\d) offres analysées selon vos priorités$/, "$1 عروض محلّلة حسب أولوياتك"], [/^(\d) offres prêtes$/, "$1 عروض جاهزة"],
    [/^Score ([\d.]+)\/10 · (\d+) % de correspondance$/, "التقييم $1/10 · توافق $2 %"],
    [/^Priorité actuelle : (.+) — ajustez pour recalculer le classement$/, (m, x) => "الأولوية الحالية: " + x.split(" et ").map((w) => T(w.charAt(0).toUpperCase() + w.slice(1))).join(" و") + " — عدّل لإعادة الترتيب"],
    [/^Abonnement (\d+) mois × (.+)$/, "الاشتراك $1 شهرًا × $2"], [/^Coût total sur (\d+) mois$/, "الكلفة الجملية على $1 شهرًا"], [/^Télécharger un film HD \(5 Go\)$/, "تحميل فيلم HD (5 جيغا)"], [/^Envoyer 1 Go de fichiers$/, "إرسال 1 جيغا من الملفات"],
    [/^Engagement (\d+) mois$/, "التزام $1 أشهر"], [/^(\d+) mois$/, "$1 أشهر"], [/^(\d+) min$/, "$1 دقيقة"], [/^(\d+) avis vérifiés$/, "$1 رأي موثّق"], [/^(\d+) avis$/, "$1 رأي"], [/^Couverture ([\d\s ]+) €$/, "تغطية $1 €"], [/^Frais médicaux ([\d\s ]+) €$/, "مصاريف طبية $1 €"],
    [/^Jusqu'à (.+) d'économie par an$/, "حتى $1 توفير في السنة"], [/^(\d) adultes$/, "$1 كهول"], [/^(\d+) étoiles$/, "$1 نجوم"], [/^(\d+) ans$/, "$1 سنوات"], [/^(\d+) jours$/, "$1 يومًا"],
    [/^(\d+) h de traversée$/, "$1 ساعة إبحار"], [/^Afficher plus d'offres \((\d+)\)$/, "عرض المزيد ($1)"], [/^Voir les vols$/, "شاهد الرحلات"], [/^Voir les traversées$/, "شاهد الرحلات البحرية"],
    [/^Disponibilités$/, "التوفر"], [/^Réserver$/, "احجز"], [/^Site de la banque$/, "موقع البنك"], [/^Site du service$/, "موقع الخدمة"],
    [/^par pers\. (aller-retour|aller simple)$/, (m, x) => "للشخص " + (x === "aller-retour" ? "ذهاب وإياب" : "ذهاب فقط")], [/^\/ nuit \/ pers\.$/, "/ ليلة / شخص"],
    [/\bDT\/mois\b/g, "د.ت/شهر"], [/\bDT\/an\b/g, "د.ت/سنة"], [/\bDT\/jour\b/g, "د.ت/يوم"], [/^DT$/, "د.ت"], [/(\d)\s?DT\b/g, "$1 د.ت"], [/(\d) Go\b/g, "$1 جيغا"], [/\/ mois$/, "/ شهر"], [/\/ pers\.$/, "/ شخص"], [/^\/ nuit$/, "/ ليلة"],
    [/^le séjour$/, "الإقامة"], [/^par an$/, "في السنة"], [/^par pèlerin$/, "لكل معتمر"], [/^livré$/, "مع التوصيل"], [/^Montant reçu$/, "المبلغ المستلم"]
  ];
  function tr(s) {
    const t = s.trim(); if (!t || /^[\d\s.,:%+−\-–/€×→]+$/.test(t)) return null;
    let out = AR[t];
    if (out == null) { out = t; let ch = false; for (const [re, rep] of RX) { const n = out.replace(re, rep); if (n !== out) { out = n; ch = true; } } if (!ch) return null; }
    return s.replace(t, out);
  }
  const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "svg", "SVG"]);
  function walk(root) {
    if (root.nodeType === 3) { one(root); return; }
    if (root.nodeType !== 1 || SKIP.has(root.nodeName)) return;
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) one(n);
    const els = root.matches && root.matches("[placeholder],[aria-label],[title]") ? [root] : [];
    els.concat(Array.from(root.querySelectorAll("[placeholder],[aria-label],[title]"))).forEach((el) => ["placeholder", "aria-label", "title"].forEach((a) => {
      const v = el.getAttribute(a); if (!v || el["__ar_" + a] === v) return; const r = tr(v); if (r) { el["__fr_" + a] = v; el["__ar_" + a] = r; el.setAttribute(a, r); }
    }));
  }
  function one(n) {
    if (!n.parentNode || SKIP.has(n.parentNode.nodeName) || n.parentNode.closest && n.parentNode.closest("svg")) return;
    if (n.__ar !== undefined && n.nodeValue === n.__ar) return;
    const r = tr(n.nodeValue); if (r != null) { n.__fr = n.nodeValue; n.__ar = r; n.nodeValue = r; }
  }
  function restore(root) {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) if (n.__fr !== undefined && n.nodeValue === n.__ar) { n.nodeValue = n.__fr; delete n.__ar; }
    root.querySelectorAll("[placeholder],[aria-label],[title]").forEach((el) => ["placeholder", "aria-label", "title"].forEach((a) => { if (el["__fr_" + a] && el.getAttribute(a) === el["__ar_" + a]) { el.setAttribute(a, el["__fr_" + a]); delete el["__ar_" + a]; } }));
  }
  let lang = Q.LS.get("qarin-lang", null) || ((navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "fr");
  const obs = new MutationObserver((ms) => { if (lang !== "ar") return; ms.forEach((m) => m.addedNodes.forEach(walk)); });
  function apply(first) {
    const h = document.documentElement; h.lang = lang; h.dir = lang === "ar" ? "rtl" : "ltr";
    const b = document.getElementById("langBtn"); if (b) { b.textContent = lang === "ar" ? "FR" : "ع"; b.setAttribute("aria-label", lang === "ar" ? "Version française" : "النسخة العربية"); b.title = lang === "ar" ? "Français" : "العربية"; }
    if (!first) Q.router(); // ré-affiche la page (dates localisées), puis traduction automatique
    if (lang === "ar") walk(document.body); else restore(document.body);
  }
  obs.observe(document.body, { childList: true, subtree: true });
  document.getElementById("langBtn").addEventListener("click", () => { lang = lang === "ar" ? "fr" : "ar"; Q.LS.set("qarin-lang", lang); apply(false); });
  // la page initiale est rendue au DOMContentLoaded par app.js ; on applique la langue juste après
  const init = () => apply(true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(init, 0)); else setTimeout(init, 0);
})(window.Q);
