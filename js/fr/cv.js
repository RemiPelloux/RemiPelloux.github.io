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
  role: "CTO et cofondateur. Ingénieur IA : agents LLM, MCP et systèmes multi-agents.",
  city: "Nice, France",
  "h-profile": "Profil",
  profile: "Ingénieur IA et CTO, dix ans de full-stack, de sécurité et de cloud. Je conçois des systèmes LLM et les fais tourner en production : agents à appels d'outils, serveurs MCP, RAG, voix, routage entre fournisseurs avec bascule, cache et maîtrise des coûts. J'écris les règles des agents de code IA de mes dépôts et les fais respecter en CI. Anciens clients : Dassault Aviation, DGA, Thales, Decathlon.",
  "h-exp": "Expérience",
  exp: [
    job("CTO et cofondateur, OpenPro", "Fév. 2023 à aujourd'hui · Nice, à distance",
      "J'ai conçu OpenPro, réseau professionnel français avec CV vidéo et matching par IA, mis en production (Laravel, React, Flutter, AWS) et présenté à de grands groupes RH.",
      "J'ai construit Mia, son assistante : un agent à appels d'outils en streaming avec 87 outils, et un mode vocal temps réel sur OpenAI Realtime, Gemini Live et Grok en secours.",
      "Le serveur MCP hébergé, mcp.openpro.ai : Streamable HTTP, OAuth 2.1 avec PKCE, outils filtrés par rôle et par scope, une MCP App pour les brouillons d'offres.",
      "Une couche LLM sur 10 fournisseurs : bascule Claude, Mistral, OpenAI, cache de prompt, coût par appel, plafond mensuel. Voxtral, Whisper, ElevenLabs.",
      "Rédacteur d'offres multi-agents (OpenAI Agents SDK) : un agent de tri et quatre spécialistes, sortie validée par schéma, exécuté sur Claude."),
    job("Software engineer, lead sécurité et full-stack, SaaS Office", "Sept. 2024 à fév. 2025 · Valbonne",
      "Un outil de gestion des vulnérabilités en Python et un framework qui simule des attaques sur le réseau, le DNS et le cloud. Symfony, React, TypeScript, Cypress."),
    job("Lead developer R&amp;D, MOABI", "Juil. 2023 à sept. 2024 · Valbonne",
      "R&amp;D produit sur la dépendance énergétique du logiciel. Migration d'un backend C, Symfony 5.3 vers 6.4, et audits de sécurité pour Dassault Aviation, la DGA, Thales et Decathlon, sur site à Rennes et à Hengelo."),
    job("Avant", "2016 à 2023 · Monaco, Sophia Antipolis, France",
      "Lead developer full-stack, Therascience (2020 à 2023). CTO, Votre-marketing.fr et AdWatch (2019 à 2020). Formateur en développement web pour Pôle Emploi, Orsys et SoftTeam (2016 à 2019)."),
  ].join(""),
  "h-ai": "Systèmes IA",
  ai: list(
    "OpenOS, orchestrateur en Rust : le LLM planificateur rend un graphe de tâches sans cycle, exécuté par des agents de code en worktrees git isolés jusqu'à une PR en brouillon.",
    "OpenBrain, une couche de connaissance d'entreprise : un routeur Mistral fine-tuné qui bascule vers Claude, sur des embeddings Weaviate et un graphe Neo4j.",
    "LeadsIt IA, un agent intégré avec 18 outils, une confirmation avant chaque écriture, la bascule entre fournisseurs et un serveur MCP hébergé.",
    "Céos, assistant RAG en ligne sur apdp.mc (autorité monégasque de protection des données) : Mistral et LanceDB derrière une API Rust, violations et AIPD dans le chat.",
    "OpenWhistle et OpenPlod, de la voix aux données structurées : cinq moteurs de transcription, sortie JSON stricte, anonymisation, recherche hybride.",
  ),
  "h-practice": "Comment je travaille avec les agents",
  practice: list(
    "Les Pelloux Guidelines, mes règles open source pour agents de code IA : dix règles, des limites de taille strictes, neuf profils de langage, et un audit avec ratchet de baseline dans la boucle de l'agent, en pre-commit et en CI. Dans 32 dépôts.",
    "Claude Code, Codex, Cursor, Gemini CLI et Copilot au quotidien, agents en parallèle dans des worktrees git. 25 skills Claude Code de ma main (graphes de tâches, points de décision, contrôles qualité), 306 règles Cursor, 23 AGENTS.md.",
    "13 serveurs MCP, plus de 260 outils : OpenPro 87, OpenCRM 41, OpenPlod 30, OpenTicket 20, Obsidian 15, OpenBrain, OpenWhistle et OpenRec 13 chacun, et d'autres.",
  ),
  "h-skills": "Compétences",
  skills: pairs(
    ["Ingénierie LLM", "Agents à appels d'outils, relais multi-agents, MCP, RAG, recherche hybride, sorties structurées, cache de prompt, bascule entre fournisseurs, budgets de coût, voix temps réel"],
    ["Modèles et SDK", "Claude, Anthropic SDK, OpenAI Agents SDK et Realtime, Mistral, Voxtral, Gemini, Grok, Ollama, whisper.cpp"],
    ["Recherche", "pgvector, Weaviate, LanceDB, FAISS, Chroma, Neo4j, SQLite FTS5, LangChain"],
    ["Agents de code", "Skills, plugins et hooks Claude Code, Codex, règles Cursor, orchestration en worktrees, contrôles qualité"],
    ["Langages", "TypeScript, Python, PHP, Rust, Swift, Kotlin, Dart, Go, C, C++, SQL"],
    ["Applications et infrastructure", "React, Next.js, Laravel, Symfony, Tauri, Flutter, PostgreSQL, Redis, AWS, Docker, Terraform"],
    ["Tests", "Playwright, Cypress, PHPUnit, pytest, Vitest"],
  ),
  "h-sec": "Sécurité",
  sec: list(
    "CVE-2026-45753, XSS dans Symfony HtmlSanitizer, signalée et corrigée en 2026.",
    "Une découverte acceptée par l'équipe sécurité de Tailscale.",
    "BurpHunterTK, chasse aux bugs par LLM dans Burp Suite. HackoogleMini, un LLM local dans un Google Home Mini.",
  ),
  "h-oss": "Open source",
  oss: list(
    '<a href="https://github.com/RemiPelloux/pelloux-guidelines">Pelloux Guidelines</a>, règles et audit pour agents de code IA.',
    "OpenPlod, coffre audio local avec MCP. <span data-stars='OpenPlod'>40 étoiles</span>.",
    "kill-my-idea, un plugin Claude Code aux verdicts sourcés sur les idées de startup.",
    "Modelly, modélisation multi-agents en Python. Containust, un runtime de conteneurs en Rust.",
  ),
  "h-edu": "Formation",
  edu: list(
    "Master en informatique, SophiaTech, Sophia Antipolis.",
    "Licence en informatique, Université de Nice.",
  ),
  "h-lang": "Langues",
  langs: "Français, langue maternelle. Anglais, professionnel. Italien, intermédiaire.",
};
