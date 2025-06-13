class CategoryFacet extends ListFacet {

  id() {
    return "categories";
  }

  articleMatches(article) {
    return article.categoriesOverlap(this._value);
  }

}
