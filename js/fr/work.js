// French copy for work/index.html, keyed by data-i18n.
const gh = (repo) => `<a href="https://github.com/RemiPelloux/${repo}">${repo}</a>`;
const row = (repo, text, language) => `<tr><th scope="row">${gh(repo)}</th><td>${text}</td><td class="mono">${language}</td></tr>`;
const BARE = ["NEON", "dungeonia-manga-pages-assets", "ssrf-payload.github.io", "gallerie-ajax", "jstp", "auto-amazon-item-finder", "RemiPelloux", "RemiPelloux.github.io"];

export default {
  skip: "Aller au contenu",
  title: "Rémi Pelloux, archive des projets publics",
  crumb: "archive",
  "nav-home": "Portfolio",
  h1: "Archive",
  intro: 'Tout le reste de ce que j\'ai de public sur GitHub : essais, anciens projets et petits outils. Les projets choisis sont sur la <a href="/#work">page d\'accueil</a>.',
  caption: "Autres dépôts publics",
  head: '<th scope="col">Dépôt</th><th scope="col">Ce que c\'est</th><th scope="col">Langage</th>',
  body: [
    row("openterm", "Terminal pensé pour l'IA, basé sur Ghostty : commandes conscientes des tokens, preuves chiffrées, n'importe quel modèle.", "Rust"),
    row("AirFranceFilterScript", "Ratline, un comparateur de tarifs Air France en euros et en Miles. <span data-stars='AirFranceFilterScript'>2 étoiles</span>.", "TypeScript"),
    row("Sniper", "Outil de pentest assisté par apprentissage automatique. <span data-stars='Sniper'>2 étoiles</span>.", "Python"),
    row("lbc-api", "API REST au-dessus d'un client Leboncoin, en service FastAPI à couches. <span data-stars='lbc-api'>1 étoile</span>.", "Python"),
    row("modelly-hub", "Index des modèles Modelly publiés : fiches, DOI, sommes de contrôle.", "JSON"),
    row("rjs", "Une alternative à npm écrite en Rust.", "Rust"),
    row("RouteMaster", "Bibliothèque de routage pour applications TypeScript.", "TypeScript"),
    row("ThisNote", "Un bloc-notes en Rust.", "Rust"),
    row("TextRPG", "Un RPG textuel.", "TypeScript"),
    row("molt-official", "Configuration d'agent Hermes : opérations Pi et plugins cognitifs.", "Python"),
    row("Pokya", "Modèle hybride d'apprentissage par renforcement appliqué au poker.", "Python"),
    row("BlackJackAI", "Joueur de blackjack entraîné par renforcement avec Sarsa(λ).", "Python"),
    row("BlackJackAI_v2", "Deuxième version de BlackJackAI.", "Python"),
    row("InsideGPT", "Téléverser des documents, les vectoriser et les interroger avec GPT-3.", "Python"),
    row("JarvisCodeGPT", "Assistant de code basé sur GPT-3.", "Python"),
    row("Multi-Threaded-Prime-Number-Calculation", "Calcul de nombres premiers sur plusieurs threads.", "Python"),
    row("VoiceApp-MisterPizza", "Application de commande vocale pour une pizzeria.", "JavaScript"),
    row("alotaxi", "Service de localisation pour prestataires.", "JavaScript"),
    row("EatIt", "Maquette du site EatIt.", "PHP"),
    row("ObserverGeoIPRedirect", "Redirige les visiteurs vers la bonne langue et le bon pays d'après leur adresse IP.", "PHP"),
    row("createScrollToTopButton", "Bouton réutilisable de retour en haut de page.", "CSS"),
  ].join(""),
  bare: `Publics sans description : ${BARE.map(gh).join(", ")}.`,
  foot: "Relevé sur GitHub le 11 novembre 2026. Les forks ne sont pas listés.",
};
