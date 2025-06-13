/**
 * Pour tester ce code:
 *
 * * Aller à /articles/
 * * Ouvrir la console
 * * services.get('facets').addToFacet('categories', 'Eau');
 */
{% include utilities/facets/Facet.js %}
{% include utilities/facets/ListFacet.js %}
{% include utilities/facets/SearchWordFacet.js %}
{% include utilities/facets/CategoryFacet.js %}
{% include utilities/facets/CountryFacet.js %}
{% include utilities/facets/Article.js %}
{% include utilities/facets/Facets.js %}
