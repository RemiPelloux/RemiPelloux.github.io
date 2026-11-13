// French copy for work/containust/index.html, keyed by data-i18n.
export default {
  "skip": "Aller au contenu",
  "nav-home": "Portfolio",
  "foot-nav": "<a href=\"/work/\">Archive</a>, <a href=\"/security/\">Sécurité</a>, <a href=\"/toolbox/\">Boîte à outils</a>, <a href=\"/lab/\">Labo</a>",
  "title": "Containust, étude de cas par Rémi Pelloux",
  "crumb": "étude de cas / Containust",
  "kicker": "Étude de cas",
  "facts": "<div><dt>Rôle</dt><dd>Auteur et mainteneur</dd></div><div><dt>Technologies</dt><dd>Rust, nom, petgraph, espaces de noms Linux, cgroups v2, QEMU</dd></div><div><dt>Hôtes</dt><dd>Linux x86_64 et aarch64, macOS, Windows</dd></div><div><dt>Source</dt><dd><a href=\"https://github.com/RemiPelloux/Containust\">github.com/RemiPelloux/Containust</a></dd></div>",
  "nav": "<a href=\"/#work\">Tous les projets choisis</a> <a href=\"/work/modelly/\">Suivant : Modelly</a>",
  "lede": "Un runtime de conteneurs en Rust sans démon en arrière-plan, pensé pour les machines où un démon, un registre ou un état caché posent problème.",
  "cap": "La bannière du projet : pas de démon, des stacks déclaratives, prêt pour les machines isolées du réseau.",
  "problem": "<h2>Problème</h2><p>Docker a besoin d'un démon root qui doit rester en vie, et suppose qu'un registre est joignable. Sur une machine isolée du réseau ou critique pour la sécurité, les deux gênent. Containust supprime le démon et fait du hors-ligne le cas imposé.</p>",
  "built": "<h2>Ce que j'ai construit</h2><ul class=\"built\"><li>Une commande, <code>ctst plan</code>, qui montre ce qui serait créé, remplacé, démarré, gardé ou supprimé avant toute exécution.</li><li>Un petit langage typé pour décrire les stacks, <code>.ctst</code>, validé avant l'exécution.</li><li>Une option <code>--offline</code> qui refuse le réseau avant toute connexion, avec des images épinglées par empreinte.</li><li>Des réglages sûrs par défaut : espaces de noms utilisateur et PID, toutes les capacités retirées, <code>no_new_privs</code>, système de fichiers racine en lecture seule.</li><li>Un SDK Rust qui expose l'analyseur, le graphe de dépendances, le planificateur et le runtime.</li></ul>",
  "how": "<h2>Fonctionnement</h2><p>Une grammaire <code>nom</code> lit le fichier de stack et <code>petgraph</code> trie les services pour démarrer d'abord ceux dont les autres dépendent. Le planificateur compare l'état voulu aux conteneurs en cours. Sous Linux, le runtime se duplique dans des espaces de noms utilisateur, PID, montage, réseau, IPC et UTS, applique les limites cgroups v2 et bascule dans le système de fichiers racine. Sous macOS et Windows, les mêmes requêtes passent en JSON RPC vers un agent dans une machine virtuelle QEMU Alpine épinglée.</p>",
  "limits": "<h2>Limites</h2><p>Il ne construit pas d'image depuis un Dockerfile : il importe un système de fichiers racine, une archive tar ou une image OCI. Il ne télécharge que depuis Docker Hub et GHCR, et n'a pas d'orchestration. Linux demande un noyau 5.10 ou plus récent, les autres hôtes QEMU 7.</p>",
};
