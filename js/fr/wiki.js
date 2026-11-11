// French copy for wiki.html, keyed by data-i18n.
const qa = (...entries) => entries.map(([question, answer]) => `<dt>${question}</dt><dd>${answer}</dd>`).join("");
const log = (...entries) => entries.map(([version, text]) => `<dt class="mono">${version}</dt><dd>${text}</dd>`).join("");
const gh = (repo, label) => `<a href="https://github.com/RemiPelloux/${repo}">${label}</a>`;
const toc = (...entries) => entries.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join("");

export default {
  title: "Rémi docs, le manuel non officiel",
  version: "v2026.11, stable en semaine",
  "nav-home": "Portfolio",
  toc: toc(["start", "Premiers pas"], ["reference", "Référence"], ["troubleshooting", "Dépannage"], ["faq", "FAQ"], ["changelog", "Journal des versions"]),
  h1: "Rémi docs",
  intro: "Le manuel de Rémi Pelloux, écrit par Rémi Pelloux. Je pose les questions et j'y réponds, ce qui raccourcit les tickets de support.",
  edit: 'Une erreur dans ma personne ? <a href="https://github.com/RemiPelloux/RemiPelloux.github.io/edit/main/wiki/index.html">Ouvrez une pull request</a>.', // unslop-ignore: the question is the joke
  "h-start": "Premiers pas",
  start: qa(
    ["C'est quoi, Rémi ?", "Un CTO chez OpenPro, basé à Nice. Et un processus qui transforme les soirées libres en dépôts GitHub. Les deux tournent en production."],
    ["Comment installer Rémi ?", "Impossible. Je suis en source disponible, pas en open source. Vous pouvez cloner mes dépôts publics, c'est déjà l'essentiel de moi."],
    ["Quelle est la configuration requise ?", `Du café. J'ai rétro-conçu le protocole de ma machine De'Longhi et écrit ${gh("delonghi-coffee-api", "une API REST pour elle")}, donc cette dépendance est au moins documentée.`],
  ),
  "h-reference": "Référence",
  reference: qa(
    ["Pourquoi tous les projets commencent par Open ?", "Nommer est difficile et j'ai trouvé un préfixe qui marche. OpenPro, OpenVision, OpenPlod, OpenNative, OpenSw, OpenAgents. Si j'ouvre une boulangerie, ce sera OpenBread."],
    ["470 contributions le 24 octobre 2026. C'est un bug ?", "Non. C'était un samedi et personne n'avait posé de réunion."],
    ["Quelles langues parlez-vous ?", "TypeScript, Rust, Python et PHP presque tous les jours. Français et anglais avec les humains. Italien avec les serveurs de restaurant, niveau intermédiaire."],
    ["Vous êtes plutôt produit ou plutôt sécurité ?", `Oui. Je construis des produits le jour et je démonte ceux des autres le soir. Symfony y a gagné la <a href="https://github.com/symfony/symfony/security/advisories/GHSA-hhg7-c65m-h7ff">CVE-2026-45753</a>. Mon Google Home Mini y a gagné un nouveau cerveau.`],
    ["Quelle est votre limite de débit ?", "Une question sérieuse par message. Les rafales sont acceptées si elles viennent avec un cas de reproduction."],
  ),
  "h-troubleshooting": "Dépannage",
  troubleshooting: qa(
    ["Rémi ne répond pas à mon message.", 'Vérifiez que vous avez écrit sur <a href="https://www.linkedin.com/in/remipelloux/">LinkedIn</a>. Vérifiez ensuite que votre message ne vend pas une équipe de développement offshore. Réessayez avec une vraie question.'],
    ["Rémi a dit « ça marche sur ma machine ».", `C'est vrai. Mon téléphone est aussi ${gh("android-hid-kb", "un clavier USB")} et mon enceinte fait tourner ${gh("HackoogleMini", "un LLM local")}, donc ma machine n'est pas une référence honnête.`],
    ["Rémi a réécrit mes 200 lignes en 50.", "Comportement attendu. Voir les guidelines, section 2 : le minimum de code qui résout le problème."],
    ["Puis-je passer root sur Rémi ?", `Seulement en ${gh("GalaxyCrash", "root éphémère")}. Un redémarrage annule tout.`],
    ["Rémi a nommé une variable « x ».", "C'est impossible. Merci de joindre le hash du commit, que je puisse nier correctement."],
  ),
  "h-faq": "FAQ",
  faq: qa(
    ["Tabulations ou espaces ?", "Ce que dit le formateur. Je débats d'architecture, pas d'espaces."],
    ["Vous dormez ?", "Le registre de la page d'accueil montre 49 jours sans contribution sur un an. Le sommeil a eu lieu là."],
    ["Cette documentation est-elle officielle ?", "Aussi officielle que peut l'être une documentation écrite par le produit lui-même."],
    ["Pourquoi y a-t-il une simulation sur votre portfolio ?", "Parce que j'ai écrit un framework de modélisation, et qu'une page sur les exécutions reproductibles qu'on ne peut pas exécuter, ce serait du marketing."],
    ["Y a-t-il un shiba caché sur ce site ?", "Non. Ne tapez pas shiba au clavier. Ne cliquez pas non plus sur le carré rouille du registre de commits."],
  ),
  "h-changelog": "Journal des versions",
  changelog: log(
    ["v2023.02", "Ajout : rôle de CTO et cofondateur chez OpenPro. Toujours la version courante."],
    ["v2024.09", "Ajout : simulation d'attaques réseau, DNS et cloud chez SaaS Office. Tournait en parallèle de la v2023.02."],
    ["v2023.07", "Ajout : R&amp;D chez MOABI. Migration d'un backend C et de Symfony 5.3 vers 6.4, sans interruption de service côté sommeil."],
    ["v2020.10", "Ajout : outils de logistique, de CRM et d'e-commerce chez Therascience, à Monaco."],
    ["v2019.03", "Ajout : premier titre de CTO. Découverte du prix des campagnes publicitaires."],
    ["v2016.10", "Version initiale. Changement cassant : début de l'enseignement de PHP à des adultes."],
  ),
  foot: "Sans garantie. Les réponses sont presque toutes vraies. Les dates le sont toutes.",
};
