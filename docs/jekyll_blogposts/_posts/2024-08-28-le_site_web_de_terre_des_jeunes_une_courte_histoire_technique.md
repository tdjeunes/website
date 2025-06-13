---
title: Le site web de Terre des jeunes, une courte histoire technique
antenne: Mondial
antenne2:
  - Mondial
categories:
  - Actions internes
layout: blog
img:
  - /media/screenshot_2024-08-27_at_22.13.58.jpg
---
## Un peu d'histoire

Le site web de Terre des jeunes, [terredesjeunes.org](https://www.terredesjeunes.org), était jadis connu sous le nom de Reforestation.net.

Terre des jeunes a acquis le nom de domaine reforestation.net en 2000, et la première version disponible sur archive.org [date de 2002](https://web.archive.org/web/20020105184208/http://www.colba.net/~spin/refnet/).

Les technologies utilisées à travers les années:

* HTML
* [Joomla!](https://www.joomla.org)
* [Drupal 6](https://www.drupal.org)
* [Jekyll](https://jekyllrb.com) avec [architecture headless](https://www.sitecore.com/fr-fr/resources/content-management/headless-cms/what-is-a-headless-cms) de type [JamStack](https://jamstack.org).

La première version était très simple, sans base de données, mais le site était complexe à modifier car il fallait modifier le code source HTML directement, ce qui ressemble à ceci:

    <li>
      <p><img src="/web/20020105184208im_/http://www.colba.net/~spin/refnet/images/stbar90.jpg" width="90" height="67" align="right" alt="Comité haïtien"><a href="participez.html">Comment
        participer</a>. Terre des jeunes vous intéresse&nbsp;?
        Voulez-vous participer en tant que groupe ou individu&nbsp;?
        Vous désirez participer en nous octroyant un don&nbsp;?</p>
    </li>

Pas très agréable!

Joomla! et Drupal sont des systèmes similaires l'un à l'autre de type dits "CMS LAMP", ou système de gestion de contenu basé sur Linux, Apache, MySQL et PHP, une famille de systèmes largement utilisés dont fait partie aussi WordPress.

Ces systèmes ont l'avantage d'une interface administrative simple pour gérer le site, toutefois ils requierent un serveur de base de données et un serveur web avec PHP, qui prennent constamment de l'énergie et de la maintenance pour rester actifs et sécuritaires. De plus, ces systèmes sont souvent plus lents et deviennent vite désuets.

En octobre 2022, la version de Drupal que nous utilisions, Drupal 6, était désuète depuis longtemps, ce qui rendait les failles de sécurité et les bris de service plus probables.

Je cherchais une façon de mettre à jour l'architecture du site avec un budget relativement petit de zéro dollars.

J'ai vite écarté l'idée de migrer vers un autre CMS LAMP tel que Drupal 7 ou 8, ou WordPress, car je voulais un système assez simple pour ne pas nécessiter de mises à jour ou un serveur web.

J'ai aussi écarté un site en HTML brut, car trop difficile à mettre à jour.

Une architecture JAMStack marie parfaitement le meilleur du HTML avec le meilleur des CMS LAMP.

Étant donné le peu de budget, je cherchais:

* Un hébergement gratuit
* Un système ne nécessitant aucune maintenance

## Passage à JAMStack, avec Jekyll et Decap

N'ayant pas de budget (en temps ou en argent) pour faire une refonte graphique du site, j'ai "fossilisé" le site Drupal, c'est à dire je l'ai transforé en HTML brut avec un [clôneur de site](https://github.com/dcycle/docker-clone-site) sur [Docker](https://www.docker.com/#build).

J'ai ensuite créé un site secondaire basé sur Jekyll avec le CMS [Decap, précédemment connu sous le nom de NetlifyCMS](https://decapcms.org), pour gérer le contenu et produire du JSON qui est ensuite consommé par le site principal.

Par exemple, /api/v1/all.json contient les articles créés après le passage à Jekyll, et un script JavaScript, http://www.terredesjeunes.org/scripts/fetch-new-content.js, consomme ce contenu et l'affiche sur https://www.terredesjeunes.org.

J'en ai même fait une [courte vidéo sur YouTube](https://www.youtube.com/watch?v=Loj6AKme5JY).

Seules certaines pages du site sont mises à jour de cette façon; la majorité des pages de l'ancien site sont archivées et ont une bannière qui indique qu'il est possible qu'elles ne soient plus à jour, par exemmple: https://www.terredesjeunes.org/taxonomy/term/41.html.

Il était important pour moi de conserver l'ensemble des pages de l'ancien site pour éviter de contribuer au [pourrissement des liens](https://fr.wikipedia.org/wiki/Lien_mort), phénomène selon lequel des liens sur le web deviennent inactifs avec le temps. Dans notre cas, ma volonté est que l'ensemble de nos "anciens" liens restent actifs, mais avec un avertissement comme quoi les pages ne sont plus mises à jour. C'est comme l'équivalent d'une archive.

## Optimisation des images

Un des problèmes majeurs suite au passage de Drupal 6 à Jekyll est en lien avec l'optiisation d'images.

Sur Drupal 6, le stockage et l'affichage d'images se faisait de la façon suivante:

* L'utilisateur téléverse une image de 5Mo sur le site web.
* Dans le contexte d'un article, Drupal 6 utilisait [ImageCache](https://www.drupal.org/project/imagecache) pour transformer l'image originale en image plus légère (souvent autour de 100Ko) pour l'affichage sur le site web, rendant le site web plus rapide.
* Par exemple, [voici une image au hasard tirée de nos archives](https://www.terredesjeunes.org/sites/terredesjeunes.org/files/imagecache/images_sur_nodes/Screen%20shot%202010-09-08%20at%2011.20.02%20PM_0.png). Peu importe la taille originale de l'image, cette version de l'image est très légère. Si vous observez l'URL de l'image, vous verrez qu'elle contient `.../imagecache/images_sur_nodes/...`, ce qui indique qu'un "style d'image" nommé `images_sur_nodes` a été appliqué à l'image. Ce style d'image génère une version de très petite taille et donc qui se charge rapidement.

Le système ImageCache (actuellement nommé Image Styles) est très puissant et utile, mais puisque nous avons décidé de ne pas utiliser Drupal, il nous fallait un autre système.

Concrètement, nous avons cherché une solution qui n'est pas liée à la technologie que nous utilisons, mais qui pourrait être appliquée à n'importe quelle technologie.

Idéalement, nous aimerions que si `/image.jpg` fait 5Go, il soit possible de télécharger `/image.jpg?taille=petit` (par exemple) pour obtenir une version de l'image qui fait autour de 100ko.

Au départ, nous avons opté pour le système [Thumbor](https://www.thumbor.org/), qui ne fait qu'une seule chose: transformer des images en images plus légères. C'est un système très puissant; et nous en avons fait [une preuve de concept](https://github.com/dcycle/thumbor-example), avant de l'appliquer à notre site web.

Voir l'article [Use image CDNs to optimize images, sur web.dev, par Jeremy Wagner, Katie Hempenius, et Barry Pollard, le 2019-08-14](https://web.dev/articles/image-cdns) pour plus de détails techniques.

Voici comment ça fonctionne:

* Un serveur d'images, <https://images.terredesjeunes.org>, héberge des images optimisées, par exemple <https://images.terredesjeunes.org/m8H0yLvvuvCNpKkDv8ylFKTC_mY=/0x160/smart/contenu.terredesjeunes.org/media/whatsapp_image_2024-08-17_at_15.27.40.jpeg>.
* Pour éviter qu'on puisse inonder le serveur avec des requêtes pour des images de toutes sortes de tailles, seules certaines tailles sont possibles, tel que défini par <http://image-mapping.terredesjeunes.org/mapping.json>.
* Ce serveur est mis à jour chaque fois que le site web contenu.terredesjeunes.org est mis à jour; ceci est fait par [un serveur Jenkins](https://www.jenkins.io).

## Architecture 2.0

### Le site fossilisé

En octobre 2022, nous avons fossilisé le site web Drupal, que nous hébergeons en code source ouvert sur GitHub au <https://github.com/tdjeunes/website>. Nous utilisons ensuite GitHub Pages pour héberger ce site, qui est disponible au <https://www.terredesjeunes.org>. Par exemple vous y trouverez la page archivée <https://www.terredesjeunes.org/taxonomy/term/41.html>.

### Le nouveau contenu

Un autre site web, basé sur Jekyll et utilisant Decap, est aussi hébergé sur GitHub au <https://github.com/tdjeunes/website-content> et utilise GitHub Pages. Les membres du réseau Terre des jeunes peuvent utiliser l'interface conviviale de Decap, ou encore le code source directement, pour mettre à jour le contenu qui est ensuite disponible au <https://contenu.terredesjeunes.org>. Par exemple, vous y trouverez la page </jekyll_blogposts/2024/07/06/projet_jaden_fanm_jardin_des_femmes_a_jean-rabel_haiti.html> dont le code source est au <https://github.com/tdjeunes/website-content/blob/master/docs/jekyll_blogposts/_posts/2024-07-06-projet_jaden_fanm_jardin_des_femmes_a_jean-rabel_haiti.md>

### La page d'accueil du site fossilisé consomme le nouveau contenu

En utilisant un [script JavaScript](https://github.com/tdjeunes/website/blob/master/docs/scripts/fetch-new-content.js), la page d'accueil de l'ancien site consomme pour sa page d'accueil le nouveau contenu.

### Fonctionalités autre que le contenu statique

Lorsque le site web était hébergé sur Drupal, nous utilisions le système pour y héberger des procès verbaux du C.A. non-disponibles au public, ainsi qu'un systèem d'envoi massif par email et un système de formulaires.

Jekyll, GitHub Pages et Decap n'offrent pas cette fonctionalité; ainsi, nous l'avons migré ces fonctions vers des systèmes tiers:

* [MailChimp](https://mailchimp.com) pour l'envoi massif par email;
* [FormSpree](https://formspree.io) pour les formulaires.
* Des projets GitHub privés pour toute information confidentielle.

## Architecture 3.0

Au moment d'écrire ces lignes, une autre mouture du site web est prévue pour un moment futur encore à déterminer.

Les problèmes avec le système actuel sont:

* Plusieurs serveurs sont requis pour le fonctionnement du site: terredesjeunes.org, images.terredesjeunes.org, contenu.terredesjeunes.org, et image-mapping.terredesjeunes.org, ainsi qu'un serveur Jenkins.
* Le design du site date d'avant 2010 et n'est pas adapté aux appareils mobiles.

L'approche que nous envisageons s'inspire de l'article [Rebuilding a Solar Powered Website, par Kris De Decker Marie Otsuka Roel Roscam Abbing Marie Verdeil, le 13 juin 2023, sur Low Tech Magazine](https://solar.lowtechmagazine.com/2023/06/rebuilding-a-solar-powered-website/), et d'autres approches similaires.

L'architecture simpilfiée aurait les parties suivantes:

* Un répertoire git pour le contenu du site web, utilisant Decap pour la gestion du contenu. Ceci serait très similaire à <https://contenu.terredesjeunes.org> et hébergerait Decap mais pas le contenu lui-même. Ce site serait hébergé sur GitHub Pages.
* Notre serveur Jenkins resterait en place, mais aurait comme responsabilité d'emballer et d'optimiser le contenu provenant de <https://contenu.terredesjeunes.org> en un site web statique en HTML brut. (Nous appelons cette phase la phase de "construction" ou, en anglais, "build".)
* Le site web en HTML brut serait hébergé, lui aussi, sur GitHub pages.

Lors de la phase construction, une série de manipulations seraient effectuées pour optimiser le plus possible le site web:

* Retrait des commentaires dans le code source
* Retrait des espaces blancs dans le code source
* Aggrégation du CSS et je JavaScript
* Minification du CSS et du JavaScript (ainsi, une fonction JavaScript nommée "maFonction()" deviendrait, par exemple "a32()", incompréhensible par un être humain mais plus rapide à télécharger)
* Optimisation extrême des images
* Retrait du CSS et du Javascript non-utilisés

L'objectif du projet "Architecture 3.0" serait d'implémenter la philosophie "Chaque octet compte" et d'avoir un site web ultra-rapide à charger, avec le moins possible d'appels au serveur et le moins possible de contenu.

L'autre objectif serait de minimiser le nombre de serveurs utilisés. Par exemple, pour le moment, un serveur d'optimisation d'images est toujours en fonction, mais en fait une fois qu'une image est optimisée, elle peut être hébergée de façon statique.

Le prohaine étape, lorsque les ressources seront disponibles, sera de s'entendre parmi la communauté Terre des jeunes sur un gabarit de site qui nous représente et qui est rapide à télécharger et offre un code source le plus simple possible.
