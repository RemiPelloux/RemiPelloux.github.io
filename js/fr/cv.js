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
  role: "Ingénieur full-stack senior. Je construis des produits d'IA et je les fais tourner en production.",
  city: "Nice, France",
  "h-profile": "Profil",
  profile: "Je construis des logiciels depuis dix ans. Je suis CTO et cofondateur d'OpenPro, un réseau professionnel que j'ai construit et que je fais tourner en production, assistante IA comprise. Avant cela, j'ai fait de la sécurité et de la R&amp;D pour Dassault Aviation, la DGA, Thales et Decathlon, et j'ai passé trois ans à apprendre le code à des adultes. Je donne le meilleur de moi dans une petite équipe, au plus près des gens qui utilisent ce que je construis.",
  "h-exp": "Expérience",
  exp: [
    job("CTO et cofondateur, OpenPro", "Plein temps depuis fév. 2025 · cofondateur dès 2023 · Nice",
      "J'ai conçu le produit et son architecture, puis je l'ai mené jusqu'à la production : un backend Laravel, une application web React et TypeScript et une application Flutter pour iOS et Android, sur AWS, hébergées dans l'UE.",
      "J'ai construit Mia, l'assistante d'OpenPro. Elle cherche, rédige et agit pour l'utilisateur avec plus de 80 outils, et elle sait aussi parler à la voix.",
      "J'ai construit le serveur MCP hébergé, mcp.openpro.ai, pour utiliser OpenPro depuis Claude ou Codex. Il passe par OAuth 2.1 et chaque rôle ne voit que ses propres outils.",
      "Chaque appel de modèle passe par une seule couche qui change de fournisseur en cas de panne, note ce que l'appel a coûté et s'arrête à un budget mensuel.",
      "Conseil en IA pour nos clients. Pour l'autorité monégasque de protection des données (APDP), j'ai construit Céos, l'assistant en ligne sur apdp.mc, sur un modèle Mistral auto-hébergé. J'ai aussi préparé leur formation IA et sécurité de trois jours."),
    job("Ingénieur logiciel, responsable sécurité, SaaS Office", "Sept. 2024 à fév. 2025 · Valbonne",
      "J'ai construit un outil de gestion des vulnérabilités en Python et un outil qui simule des attaques sur le réseau, le DNS et le cloud. Je gérais aussi les tests de tous les projets."),
    job("Responsable front-end et ingénieur IA R&amp;D, MOABI", "Juil. 2023 à sept. 2024 · Valbonne",
      "Une société de cybersécurité. J'ai mené le front-end et la R&amp;D, migré un backend C, passé Symfony de 5.3 à 6.4 et réalisé des audits de sécurité pour Dassault Aviation, la DGA, Thales et Decathlon, sur site à Rennes et aux Pays-Bas."),
    job("Développeur web, Thérascience", "Oct. 2020 à juil. 2023 · Monaco",
      "J'étais le seul développeur. J'ai construit les outils internes de logistique et de CRM, les API et la partie e-commerce, et je travaillais avec les prestataires extérieurs."),
    job("Avant", "2016 à 2020 · Sophia Antipolis et partout en France",
      "CTO de Votre-marketing.fr et AdWatch (2019 à 2020). Avant cela, trois ans de formateur en développement web pour Pôle Emploi, Orsys, Softeam et M2I. Des adultes en reconversion, et pas de diapositives, uniquement de la pratique."),
  ].join(""),
  "h-ai": "Mes propres produits",
  ai: list(
    '<a href="https://leadsit.eu">LeadsIt</a>, un produit de recherche de leads B2B, en ligne avec des crédits payants. Son agent travaille sur les leads de l\'utilisateur et demande avant toute modification.',
    "OpenOS, un orchestrateur en Rust. Un LLM découpe le travail en tâches, puis des agents de code les traitent chacun dans son worktree git, jusqu'à une pull request.",
    "OpenPlod, un coffre local et open source pour les enregistrements vocaux.",
  ),
  "h-practice": "Comment je travaille avec les agents IA",
  practice: list(
    "J'utilise Claude Code, Codex et Cursor tous les jours, et je relis ce qu'ils écrivent comme je relirais le code d'un collègue.",
    'J\'ai écrit les <a href="https://github.com/RemiPelloux/pelloux-guidelines">Pelloux Guidelines</a>, des règles open source pour agents de code, vérifiées pendant leur travail, au commit et en CI.',
  ),
  "h-skills": "Compétences",
  skills: pairs(
    ["IA", "Agents LLM et appels d'outils, MCP, RAG, sorties structurées, bascule entre fournisseurs, maîtrise des coûts, voix"],
    ["Modèles", "Claude, OpenAI, Mistral, Gemini, Ollama"],
    ["Langages", "TypeScript, PHP, Python, Rust, Go, SQL"],
    ["Web et mobile", "React, Next.js, Node.js, Laravel, Symfony, Flutter"],
    ["Données et cloud", "PostgreSQL, Redis, pgvector, AWS, Docker, Terraform, CI/CD"],
    ["Tests", "Playwright, Cypress, PHPUnit, Vitest, pytest"],
  ),
  "h-sec": "Sécurité",
  sec: list(
    "CVE-2026-45753, une XSS dans Symfony HtmlSanitizer. Signalée à deux, corrigée en 2026.",
    "Une revue du code source de Tailscale, avec quatre problèmes envoyés à son équipe sécurité.",
    "HackerOne : 18 rapports, 2 récompensés.",
    "Coaching en sécurité pour des équipes de la DGA, de MBDA et de Thales.",
  ),
  "h-oss": "Open source",
  oss: list(
    '<a href="https://github.com/RemiPelloux/pelloux-guidelines">Pelloux Guidelines</a>, règles et audit pour agents de code IA.',
    '<a href="https://github.com/RemiPelloux/SmarttyTest">SmartTest</a>, ne lance que les tests qu\'un changement peut toucher.',
    "Containust, un runtime de conteneurs en Rust.",
  ),
  "h-edu": "Formation",
  edu: list(
    "Master en informatique, SophiaTech, Sophia Antipolis.",
    "Licence en informatique, Université de Nice.",
  ),
  "h-lang": "Langues",
  langs: "Français, langue maternelle. Anglais, professionnel. Italien, intermédiaire.",
};
