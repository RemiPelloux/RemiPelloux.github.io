// French copy for cv.html, keyed by data-i18n.
const list = (...items) => items.map((item) => `<li>${item}</li>`).join("");
const job = (title, when, ...items) =>
  `<div class="job"><h3>${title}</h3><p class="mono when">${when}</p><ul>${list(...items)}</ul></div>`;
const pairs = (...entries) => entries.map(([term, text]) => `<dt>${term}</dt><dd>${text}</dd>`).join("");

export default {
  skip: "Aller au contenu",
  title: "Rémi Pelloux, CV",
  back: "Retour au portfolio",
  export: "Exporter en PDF",
  hint: "L'export ouvre la fenêtre d'impression : choisissez « Enregistrer au format PDF ». Changez d'abord de langue pour obtenir l'autre version. Pour imprimer des coordonnées privées, ajoutez ?email=vous@exemple.fr&amp;tel=0600000000 à l'adresse. Elles restent dans votre navigateur.",
  role: "CTO et cofondateur. Product engineer, SaaS, IA et sécurité.",
  city: "Nice, France",
  "h-profile": "Profil",
  profile: "CTO orienté produit. Je conçois, développe et mets en production des plateformes SaaS complètes, de l'architecture au déploiement. Dix ans de développement full-stack, de systèmes d'IA et de LLM, de sécurité applicative et d'infrastructure cloud, pour une startup que j'ai cofondée et pour des clients comme Dassault Aviation, la DGA, Thales et Decathlon.",
  "h-exp": "Expérience",
  exp: [
    job("CTO et cofondateur, OpenPro", "Fév. 2023 à aujourd'hui · Nice, à distance",
      "Plateforme de recrutement par IA : conception produit et architecture technique, jusqu'à la production.",
      "Cœur PHP et Symfony, web en React et TypeScript, applications iOS et Android, couche IA en Python avec recherche documentaire et MCP.",
      "Présentations à des entreprises et à de grands groupes RH. Conformité RGPD sur une infrastructure cloud en UE."),
    job("Software engineer, lead sécurité et full-stack, SaaS Office", "Sept. 2024 à fév. 2025 · Valbonne",
      "Outil de gestion des vulnérabilités en Python.",
      "Framework de simulation d'attaques automatisées sur le réseau, le DNS et le cloud.",
      "Développement full-stack avec Symfony, React et TypeScript, testé avec Cypress."),
    job("Lead developer R&amp;D, MOABI", "Juil. 2023 à sept. 2024 · Valbonne",
      "Pilotage du développement produit et de la R&amp;D. Recherche sur la dépendance énergétique du logiciel.",
      "Migration d'un backend C, Symfony 5.3 vers 6.4, audits de sécurité.",
      "Clients : Dassault Aviation, DGA, Thales, Decathlon. Sur site à Rennes et à Hengelo, aux Pays-Bas."),
    job("Lead developer full-stack, Therascience", "Oct. 2020 à juil. 2023 · Monaco",
      "Outils internes de logistique, de CRM et d'automatisation. API, supervision et interfaces e-commerce.",
      "Gestion de prestataires externes et déploiements sécurisés."),
    job("CTO et lead developer, Votre-marketing.fr et AdWatch", "Mars 2019 à juil. 2020 · Sophia Antipolis",
      "CRM internes et applications métier. Campagnes Facebook et Google Ads."),
    job("Consultant et formateur en développement web", "Oct. 2016 à mars 2019 · Pôle Emploi, Orsys, SoftTeam",
      "Formations HTML, CSS, JavaScript, PHP, Symfony, Node.js et Python, à Lille, Paris, Lyon, Clermont-Ferrand, Bordeaux et Poitiers."),
  ].join(""),
  "h-skills": "Compétences",
  skills: pairs(
    ["Langages", "TypeScript, Rust, Python, PHP, C"],
    ["Web et applications", "React, Next.js, Vue, Symfony, Node.js, Tauri, Electron"],
    ["IA", "Agents LLM, recherche documentaire, serveurs MCP, modélisation multi-agents"],
    ["Sécurité", "Sécurité applicative, audits, simulation d'attaques, rétro-ingénierie"],
    ["Infrastructure", "AWS, Docker, PostgreSQL, Redis, CI/CD, hébergement UE et RGPD"],
  ),
  "h-sec": "Sécurité",
  sec: list(
    "CVE-2026-45753, XSS dans Symfony HtmlSanitizer, signalée et corrigée en 2026.",
    "Découverte acceptée par l'équipe sécurité de Tailscale, correctif en cours.",
    "Recherche publique : HackoogleMini, php-upload-rce, GalaxyCrash.",
  ),
  "h-oss": "Open source",
  oss: list(
    "OpenVision, atelier de code avec IA et vos propres modèles.",
    "OpenPlod, coffre pour enregistrements Plaud, 39 étoiles.",
    "Modelly, modélisation multi-agents pour Python.",
    "Containust, runtime de conteneurs en Rust, sans démon.",
    "SmarttyTest, analyse d'impact des tests.",
  ),
  "h-products": "Produits",
  products: list(
    "OpenWhistle, de l'audio aux données structurées, hébergé en UE.",
    "LeadsIt, génération de prospects B2B depuis Google Maps.",
    "OpenCM, SaaS pour agences de réseaux sociaux.",
  ),
  "h-edu": "Formation",
  edu: list(
    "Master en informatique, SophiaTech, Sophia Antipolis.",
    "Licence en informatique, Université de Nice.",
  ),
  "h-lang": "Langues",
  langs: "Français, langue maternelle. Anglais, professionnel. Italien, intermédiaire.",
};
