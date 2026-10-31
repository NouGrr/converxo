# Converxo

**Tous vos formats, une seule solution.**

🌐 **[Ouvrir Converxo sur GitHub Pages](https://nougrr.github.io/converxo/)**

Convertisseur de fichiers en français, statique et compatible avec GitHub Pages. Aucun fichier utilisateur n’est envoyé à un serveur. Aucun compte, clé API ou backend requis.

## Fonctionnalités

- Glisser-déposer, sélection multiple et file de conversion (20 fichiers, 100 Mo par fichier).
- Images : PNG, JPG, WebP, SVG, AVIF, GIF et BMP en entrée selon le navigateur ; PNG, JPG, WebP et SVG en sortie. Les images animées sont aplaties. Le SVG exporté contient un bitmap intégré, sans vectorisation.
- Vidéos : MP4, WebM, MOV en sortie avec FFmpeg WebAssembly, selon les codecs du fichier source.
- Audio : MP3, WAV, AAC et OGG en sortie.
- Documents : PDF, DOCX, TXT, HTML, Markdown en entrée ; PDF, DOCX, TXT, HTML en sortie. Extraction et reconstruction du texte : pas de conservation de mise en page, d’images ni d’OCR. L’ancien format DOC n’est pas pris en charge. PDF exporté avec la police Helvetica (alphabet latin).
- Téléchargement individuel et archive ZIP avec noms uniques.
- Traitement séquentiel des fichiers pour maîtriser la mémoire. Délai maximum de cinq minutes par conversion multimédia.

## Développement

Aucune compilation nécessaire :

```sh
python3 -m http.server 8080
```

Ouvrir http://localhost:8080. Utiliser un serveur HTTP : les workers ne fonctionnent pas avec une URL `file://`.

## GitHub Pages

Le workflow `.github/workflows/pages.yml` publie le site après chaque push sur `main`. Dans **Settings → Pages → Build and deployment**, choisir **GitHub Actions** comme source.

Seuls `index.html`, `styles.css`, `app.js`, `assets/` et `vendor/` sont publiés.

## Confidentialité et dépendances

Les fichiers sont traités en mémoire dans le navigateur. Aucune télémétrie et aucun stockage persistant. Les moteurs sont chargés à la demande depuis jsDelivr ou esm.sh ; Google Fonts fournit DM Sans et Space Mono, les polices de la suite NEXO, avec repli sur les polices système. Ces services reçoivent les requêtes réseau habituelles, jamais les fichiers à convertir. Une connexion est requise au premier chargement des moteurs. FFmpeg nécessite environ 32 Mo de téléchargement et peut consommer beaucoup de mémoire sur mobile.

Bibliothèques : FFmpeg WASM 0.12.15 / core 0.12.10, Mammoth 1.9.1, PDF.js 3.11.174, jsPDF 2.5.2, docx 9.5.1 et fflate 0.8.2. Voir `vendor/README.md` pour les licences. Le cœur FFmpeg est chargé depuis un CDN et n’est pas distribué dans ce dépôt.

## Charte graphique NEXO

Identité de la suite NEXO, harmonisée avec Pixo, Doxo et Vixo : fond `#10131d`, panneaux `#1b2030`, panneaux secondaires `#293047`, bordures `#3b4560`, texte `#f5f7ff` et texte secondaire `#a9b1c7`. Typographies DM Sans et Space Mono, dégradés et trame de points du portail NEXO.

Couleurs des catégories : images/Pixo `#c28cff`, documents/Doxo `#83d9ff`, vidéos/Vixo `#79a8ff`, audio `#61dce5`. Les couleurs associées aux applications sur le portail sont reprises sur les cartes, onglets, icônes et fichiers ; la zone de dépôt et le bouton de conversion suivent la catégorie sélectionnée. Liens vers le portail NEXO dans la navigation et le pied de page.
