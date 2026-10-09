# Invicius — site complet V28

Accueil : `index.html`. Calculatrice : `tools/loan-calculator/index.html`.
Politique de confidentialité : `privacy.html`, avec onze langues.

La publication utilise GitHub Actions, via `.github/workflows/pages-v18.yml`.
Dans Settings > Pages, la source est GitHub Actions.
Le workflow publie uniquement les pages et ressources actuelles.
`scripts/inject-adsense.mjs` charge AdSense uniquement sur la calculatrice.
La variable du dépôt `ADSENSE_CLIENT` doit contenir votre identifiant ca-pub.
Le fichier ads.txt est généré à la publication.
Aucun code publicitaire n'est chargé par ce système sur l'accueil ou la politique.
Le message de consentement Google dépend du code AdSense sur la calculatrice.

Consultez LEIA-ME.txt pour le remplacement complet et les fichiers à supprimer.
