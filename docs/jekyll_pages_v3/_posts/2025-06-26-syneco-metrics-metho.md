---
title: "Synécoculture: méthodologie des métriques"
permalink: /synecoculture/metriques/methodologie/
sections:
  - structure: breadcrumb
    crumbs:
      - title: Accueil
        url: /
      - title: Activités
        url: /#activites
      - title: Synécoculture
        url: /synecoculture/
      - title: Métriques
        url: /synecoculture/metriques/
---
Dans le cadre d'un contrat signé entre Terre des jeunes et le CTCN le 24 juin 2024, Terre des jeunes s'engage à fournir des "données quantitatives ouvertes" sur la productivité des jardins de synécoculture vs. les jardins conventionnels (activié et livrable 6.4), que vous trouverez ci-joints.

### Méthodologie

Le projet compte douze (12) terrains, et chaque terrain est divisé en deux (2) parcelles, une suivant la méthode de production conventionnelle et l'autre suivant la méthode de production de synécoculture. Par méthode conventionnelle nous entendons une méthode de production qui est généralement utilisée dans la région, et qui est moins diversifiée que la synécoculture, et utilise plus d'intrants chimiques.

Chaque mois à partir du 18 mars 2025, l'équipe terrain envoie, sous forme de chiffrier Excel, à l'équipe de Terre des jeunes des résultats d'enquête auprès des productrices, des 24 parcelles (chacun des douze terrains est divisé en deux parcelles), avec les questions suivantes:

* M1: Dépense par semaine en CFA des intrants chimiques
* M2: Entretien des écosystèmes et de la biodiversité
* M3 : Inquiétude par rapport à l’utilisation durable de l’eau
* M4.1 : Inquiétude par rapport à la sécurité alimentaire
* M4.2: Inquiétude par rapport à la qualité nutritive de vos aliments
* M4.3: Vente (valeur approximative des denrées vendues) en CFA
* M4.4: Nombre de Récolte (démontrant que la synecoculture n’est pas saisonnier)
* M5: Attaque des plantes

Pour chaque métrique et chaque parcelle, on évalue uniquement des réponses chiffrées de 1 (très inquiet) à 5 (très satisfait). Des métriques qui ne correspondent pas à un chiffre de 1 à 5 sont exclues de l'analyse.

L'équipe de gestion entre ensuite les données dans un [chiffrier Google Docs qui est public](https://docs.google.com/spreadsheets/d/1mZhrxwnM2VhfynTstiIp-PTUitLaBz28DV9Pi4ffT_M/edit?gid=0#gid=0).

L'[onglet "overall"](https://docs.google.com/spreadsheets/d/1mZhrxwnM2VhfynTstiIp-PTUitLaBz28DV9Pi4ffT_M/edit?gid=860806845#gid=860806845) contient les données nettoyées, traçables et transformées.

Le projet Python [Google Sheets To CVS](https://github.com/dcycle/google-sheets-to-csv) est ensuite utilsé pour prouire un fichier CSV à partir de ces données. Ce CSV est ensuite stocké à https://www.terredesjeunes.org/data/syneco.csv.

Le projet [Starterkit CSV to D3](https://github.com/dcycle/starterkit-csv-to-d3) est utilisé pour convertir le CSV en graphiques D3.js.
