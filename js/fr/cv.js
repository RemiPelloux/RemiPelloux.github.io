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
  role: "CTO et cofondateur. Lead engineer en IA, SaaS et sécurité.",
  city: "Nice, France",
  "h-profile": "Profil",
  profile: "CTO orienté produit et lead engineer. Dix ans de développement full-stack, d'IA appliquée, de sécurité applicative et d'infrastructure cloud, du schéma d'architecture à la production. Chez OpenPro, j'ai construit la couche IA : matching, recherche documentaire et un assistant branché en MCP. Avant cela, des clients comme Dassault Aviation, la DGA, Thales et Decathlon.",
  "h-exp": "Expérience",
  exp: [
    job("CTO et cofondateur, OpenPro", "Fév. 2023 à aujourd'hui · Nice, à distance",
      "J'ai conçu OpenPro et l'ai mis en production : un réseau professionnel français avec CV vidéo, matching par IA, messagerie et une assistante nommée Mia. Je le présente à des entreprises et à de grands groupes RH.",
      "J'ai écrit la couche IA en Python : matching entre candidats et offres, recherche documentaire et Mia, branchés en MCP. Des connecteurs ATS synchronisent les offres via un SDK public en HTTP et en MCP.",
      "Cœur PHP et Symfony, web en React et TypeScript, applications iOS et Android. PostgreSQL et Redis sur AWS, Docker, CI/CD, hébergement en UE conforme au RGPD."),
    job("Software engineer, lead sécurité et full-stack, SaaS Office", "Sept. 2024 à fév. 2025 · Valbonne",
      "J'ai construit un outil de gestion des vulnérabilités en Python et un framework qui simule des attaques sur le réseau, le DNS et le cloud. Full-stack en Symfony, React et TypeScript, testé avec Cypress."),
    job("Lead developer R&amp;D, MOABI", "Juil. 2023 à sept. 2024 · Valbonne",
      "J'ai piloté le développement produit et la R&amp;D sur la dépendance énergétique du logiciel. Migration d'un backend C, Symfony 5.3 vers 6.4 et audits de sécurité pour Dassault Aviation, la DGA, Thales et Decathlon, sur site à Rennes et à Hengelo."),
    job("Lead developer full-stack, Therascience", "Oct. 2020 à juil. 2023 · Monaco",
      "Outils internes de logistique, de CRM et d'automatisation, API et interfaces e-commerce. J'ai géré des prestataires externes."),
    job("CTO et lead developer, Votre-marketing.fr et AdWatch", "Mars 2019 à juil. 2020 · Sophia Antipolis",
      "CRM internes et applications métier. Campagnes Facebook et Google Ads."),
    job("Consultant et formateur en développement web", "Oct. 2016 à mars 2019 · Pôle Emploi, Orsys, SoftTeam",
      "J'ai enseigné JavaScript, PHP, Symfony, Node.js et Python à des adultes dans huit villes françaises."),
  ].join(""),
  "h-ai": "Travaux en IA",
  ai: list(
    "LeadsIt IA, un agent qui appelle 18 outils sur les leads, note chaque lead d'après le site du client et bascule entre modèles. Serveur MCP hébergé.",
    "Céos, le chatbot RAG en ligne sur apdp.mc pour l'autorité monégasque de protection des données, en français et en anglais, avec déclaration de violation et analyse d'impact intégrées.",
    "Les Pelloux Guidelines, une norme de code pour agents IA appliquée dans 38 dépôts et vérifiée à chaque commit, et 24 skills Claude Code.",
    "Un flux multi-agents : graphe de tâches, agents en parallèle dans des worktrees git, sur mes serveurs MCP (OpenPro avec 57 outils, Obsidian, Android).",
  ),
  "h-skills": "Compétences",
  skills: pairs(
    ["IA et LLM", "Agents LLM, appels d'outils, RAG, serveurs MCP, flux multi-agents, bascule entre modèles, Ollama, Mistral, bases vectorielles, skills Claude Code"],
    ["Langages", "TypeScript, Python, PHP, Rust, C, C++, Swift, Kotlin, Go, SQL, Shell"],
    ["Web et applications", "React, Next.js, Vue, Symfony, Node.js, Tauri, Electron, Flutter, iOS, Android"],
    ["Données et infrastructure", "PostgreSQL, Redis, AWS, Docker, Terraform, GitHub Actions, hébergement UE et RGPD"],
    ["Sécurité", "Sécurité applicative, audits, simulation d'attaques, Burp Suite, IDA, Ghidra"],
    ["Tests", "Cypress, Playwright, pytest, Jest, Vitest"],
  ),
  "h-sec": "Sécurité",
  sec: list(
    "CVE-2026-45753, XSS dans Symfony HtmlSanitizer, signalée et corrigée en 2026.",
    "L'équipe sécurité de Tailscale a accepté une de mes découvertes.",
    "HackoogleMini place un LLM local dans un Google Home Mini. Aussi php-upload-rce, GalaxyCrash.",
  ),
  "h-oss": "Open source",
  oss: list(
    "OpenVision, atelier de code avec IA.",
    "OpenPlod, audio et chats sourcés. <span data-stars='OpenPlod'>39 étoiles</span>.",
    "Modelly, modélisation multi-agents en Python.",
    "Containust, un runtime de conteneurs en Rust, sans démon.",
  ),
  "h-products": "Produits",
  products: list(
    "OpenWhistle, de l'audio aux données structurées.",
    "LeadsIt, solution de recherche de leads B2B automatisée.", // unslop-ignore: wording chosen by the owner
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
