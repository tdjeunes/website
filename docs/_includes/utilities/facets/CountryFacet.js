class CountryFacet extends ListFacet {

  id() {
    return "pays";
  }

  articleMatches(article) {
    return article.countriesOverlap(this._value);
  }

}
