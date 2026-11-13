// French copy for work/openplod/index.html, keyed by data-i18n.
export default {
  "skip": "Aller au contenu",
  "nav-home": "Portfolio",
  "foot-nav": "<a href=\"/work/\">Archive</a>, <a href=\"/security/\">Sécurité</a>, <a href=\"/toolbox/\">Boîte à outils</a>, <a href=\"/lab/\">Labo</a>",
  "title": "OpenPlod, étude de cas par Rémi Pelloux",
  "crumb": "étude de cas / OpenPlod",
  "kicker": "Étude de cas",
  "facts": "<div><dt>Rôle</dt><dd>Auteur et mainteneur</dd></div><div><dt>Technologies</dt><dd>Tauri, React, TypeScript, SQLite</dd></div><div><dt>Version</dt><dd>1.0.0, <span data-stars=\"OpenPlod\">39 stars</span></dd></div><div><dt>Plateformes</dt><dd>macOS, Linux, Windows, compagnon Android</dd></div><div><dt>Source</dt><dd><a href=\"https://github.com/RemiPelloux/OpenPlod\">github.com/RemiPelloux/OpenPlod</a></dd></div>",
  "nav": "<a href=\"/#work\">Tous les projets choisis</a> <a href=\"/work/containust/\">Suivant : Containust</a>",
  "lede": "Une application de bureau qui récupère les enregistrements d'un Plaud Note Pro en Bluetooth, les garde dans un coffre sur votre ordinateur et en tire des transcriptions et des documents Markdown.",
  "cap": "La bibliothèque d'enregistrements, dans la vraie application. Les titres privés sont masqués.",
  "problem": "<h2>Problème</h2><p>Un dictaphone ne sert que si l'on peut en sortir l'audio et travailler dessus. OpenPlod garde l'enregistrement, la transcription et le document sur votre machine, et vous laisse choisir qui transcrit.</p>",
  "built": "<h2>Ce que j'ai construit</h2><ul class=\"built\"><li>L'import direct en Bluetooth depuis l'enregistreur, la session restant intacte sur l'appareil.</li><li>La transcription avec Mistral, whisper.cpp en local, Deepgram, OpenAI ou AssemblyAI. Un échec ne supprime jamais l'enregistrement.</li><li>Des documents générés depuis une transcription : notes structurées, compte rendu de réunion ou note de projet, en Markdown, avec historique des versions.</li><li>Une API REST versionnée et un serveur MCP en lecture seule tant que vous n'activez pas l'écriture.</li><li>Une application Android compagnon qui s'appaire par QR code et garde sa copie jusqu'à ce que le bureau confirme le stockage.</li></ul>",
  "how": "<h2>Fonctionnement</h2><p>L'application de bureau possède le coffre : une base SQLite et les fichiers audio. Chaque client, téléphone et serveur MCP compris, passe par l'API du backend et n'ouvre jamais la base lui-même. L'audio, la transcription et le document sont trois ressources distinctes : modifier un document ne peut pas réécrire sa source.</p>",
  "limits": "<h2>Limites</h2><p>L'extraction Bluetooth est vérifiée sur un seul Note Pro autorisé. Le pont Windows compile mais n'est pas vérifié sur matériel. iOS ne peut pas parler à l'appareil. La version Mac est signée ad hoc, sans notarisation, et l'application ne chiffre pas elle-même le coffre.</p>",
};
