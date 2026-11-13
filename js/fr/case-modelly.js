// French copy for work/modelly/index.html, keyed by data-i18n.
export default {
  "skip": "Aller au contenu",
  "nav-home": "Portfolio",
  "foot-nav": "<a href=\"/work/\">Archive</a>, <a href=\"/security/\">Sécurité</a>, <a href=\"/toolbox/\">Boîte à outils</a>, <a href=\"/lab/\">Labo</a>",
  "title": "Modelly, étude de cas par Rémi Pelloux",
  "crumb": "étude de cas / Modelly",
  "kicker": "Étude de cas",
  "facts": "<div><dt>Rôle</dt><dd>Auteur et mainteneur</dd></div><div><dt>Technologies</dt><dd>Python, numpy, pandas, Solara</dd></div><div><dt>Version</dt><dd>1.5.1, <code>pip install modelly-abm</code></dd></div><div><dt>Site</dt><dd><a href=\"https://remipelloux.github.io/Modelly/\">remipelloux.github.io/Modelly</a></dd></div><div><dt>Source</dt><dd><a href=\"https://github.com/RemiPelloux/Modelly\">github.com/RemiPelloux/Modelly</a></dd></div>",
  "nav": "<a href=\"/#work\">Tous les projets choisis</a> <a href=\"/work/openplod/\">Suivant : OpenPlod</a>",
  "lede": "Un framework Python de modélisation multi-agents, où un résultat obtenu une fois peut être obtenu de nouveau.",
  "cap": "Le site de documentation, avec un modèle d'épidémie qui tourne derrière la page.",
  "problem": "<h2>Problème</h2><p>Les modèles multi-agents servent aux chercheurs à étudier des marchés, des épidémies ou des villes. Ils sont faciles à décrire et difficiles à garder justes, reproductibles et rapides. Modelly fournit les pièces qui portent la charge sous forme de petits objets, pour que le fichier du modèle se lise comme une description du système.</p>",
  "built": "<h2>Ce que j'ai construit</h2><ul class=\"built\"><li>Les scénarios : les paramètres d'une exécution dans une seule classe typée, avec une graine.</li><li>Des agents dotés d'un <code>step()</code>, regroupés en ensembles ordonnés, et des colonnes qui rangent leurs attributs dans des tableaux numpy.</li><li>Les espaces : grilles carrées et hexagonales, réseaux, maillages de Voronoï et espace continu.</li><li>Un seul ordonnanceur pour les pas, les événements, les générateurs et les priorités.</li><li>Des collecteurs qui écrivent dans pandas, une vue navigateur construite sur Solara, et un codemod pour les modèles écrits pour Mesa.</li></ul>",
  "how": "<h2>Fonctionnement</h2><p>Le moteur garde un objet Python par agent, ce qui laisse les modèles faciles à écrire, et déplace le gros du travail dans des tableaux. L'espace continu répond aux recherches de voisins de toute la population avec un seul arbre k-d, et les phases d'un pas peuvent agir sur tous les agents à la fois. Les fichiers restent sous 300 lignes et les fonctions sous 25, et un script le vérifie. Une version en 100 lignes de la même idée tourne dans le <a href=\"/lab/\">labo</a>.</p>",
  "limits": "<h2>Limites</h2><p>Il demande Python 3.12 ou plus récent. Les noms stables suivent le versionnage sémantique, et les paquets les plus récents sont encore marqués provisoires.</p>",
};
