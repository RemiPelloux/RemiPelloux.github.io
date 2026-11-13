// French copy for security/index.html, keyed by data-i18n.
export default {
  "skip": "Aller au contenu",
  "nav-home": "Portfolio",
  "foot-nav": "<a href=\"/work/\">Archive</a>, <a href=\"/security/\">Sécurité</a>, <a href=\"/toolbox/\">Boîte à outils</a>, <a href=\"/lab/\">Labo</a>",
  "title": "Rémi Pelloux, signalements de sécurité",
  "crumb": "sécurité",
  "h1": "Sécurité",
  "lede": "Ce que j'ai signalé, et ce que je peux en dire aujourd'hui.",
  "cve": "<h2>CVE-2026-45753, Symfony HtmlSanitizer</h2><p>Le HtmlSanitizer de Symfony nettoie le HTML non fiable. Une classe, <code>UrlAttributeSanitizer</code>, vérifie le schéma de chaque attribut contenant une URL. Sa liste d'attributs contenait <code>src</code>, <code>href</code>, <code>lowsrc</code>, <code>background</code> et <code>ping</code>. Elle oubliait <code>action</code>, <code>formaction</code>, <code>poster</code> et <code>cite</code> : une URI <code>javascript:</code> placée dans l'un de ces quatre passait sans contrôle et pouvait s'exécuter en XSS.</p><p>La configuration par défaut <code>allowSafeElements()</code> n'est pas touchée. Le bug demande une configuration qui autorise exprès l'un de ces attributs, par exemple un formulaire avec son <code>action</code>.</p><dl class=\"facts mono\"><div><dt>Versions touchées</dt><dd>symfony/html-sanitizer à partir de 6.1.0, avant 6.4.40, 7.4.12 et 8.0.12</dd></div><div><dt>Corrigé dans</dt><dd>6.4.40, 7.4.12, 8.0.12</dd></div><div><dt>Classe</dt><dd>CWE-79, cross-site scripting. Gravité : faible</dd></div><div><dt>Publication</dt><dd>28 mai 2026</dd></div><div><dt>Avis</dt><dd><a href=\"https://github.com/symfony/symfony/security/advisories/GHSA-hhg7-c65m-h7ff\">GHSA-hhg7-c65m-h7ff</a></dd></div></dl><p>Je l'ai signalé et l'équipe Symfony l'a corrigé.</p>",
  "ts": "<h2>Tailscale, en cours de tri</h2><p>J'ai envoyé des rapports à l'équipe sécurité de Tailscale en 2026. L'un des points était nouveau pour eux et est en cours de correction, avec crédit dans le correctif. Un autre correspondait à un problème qu'ils avaient déjà corrigé. Les détails restent privés jusqu'à la sortie du correctif, et cette page en portera alors le récit.</p>",
  "more": "<h2>Recherche publique</h2><p>Les analyses et outils que je publie, sur PHP, Samsung Galaxy et Google Home Mini, sont listés sur la <a href=\"/#security\">page d'accueil</a>.</p>",
  "pager": "<a href=\"/work/\"><span class=\"mono\">Précédent</span><span>Archive</span></a><a href=\"/toolbox/\"><span class=\"mono\">Suivant</span><span>Boîte à outils</span></a>",
};
