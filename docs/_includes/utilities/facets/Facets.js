class Facets extends Service {

  constructor(services) {
    super(services);
    this._facets = {
      categories: new CategoryFacet(services),
      pays: new CountryFacet(services),
      recherche: new SearchWordFacet(services),
    };
  }

  init2(addOrRemoveFilter = '') {
    this.armReinitButton();
    this
      .fetchFromUrl()
      .broadcast();
    this.armFacetControllers();
  }

  armFacetControllers() {
    const that = this;
    Object.keys(that._facets).forEach(key => {
      that._facets[key].armFacetController(function() {
        that.broadcast();
      });
    });
  }

  resetAll() {
    const that = this;
    Object.keys(that._facets).forEach(key => {
      that._facets[key]._value = [];
    });
    this.broadcast();
  }

  armReinitButton() {
    const that = this;
    $('.my-init-all-facets').off().on('click', function(e) {
      e.preventDefault();
      that.resetAll();
    });
  }

  fetchFromUrl() {
    const that = this;
    Object.keys(that._facets).forEach(key => {
      that._facets[key].fetchFromUrl();
    });
    return this;
  }

  addToFacet(facet, value) {
    if (this._facets[facet]) {
      this._facets[facet].add(value);
    }
    this.broadcast();
  }

  removeFromFacet(facet, value) {
    if (this._facets[facet]) {
      this._facets[facet].remove(value);
    }
    this.broadcast();
  }

  showOrHideReinitButton() {
    let hasValues = false;
    const that = this;
    Object.keys(that._facets).forEach(key => {
      if (that._facets[key]._value.length > 0) {
        hasValues = true;
      };
    });

    if (hasValues) {
      $('.my-init-all-facets').show();
    }
    else {
      $('.my-init-all-facets').hide();
    }
  }

  broadcast() {
    this.showOrHideReinitButton();
    this.putInUrl();
    this.putInDom();
    this.putInButtons();
    this.setPartialText();
  }

  putInUrl() {
    const that = this;
    const hash = this.s('url').getHash();
    let obj = this.s('url').hashToObject(hash);
    Object.keys(that._facets).forEach(key => {
      obj = that._facets[key].addToHashObject(obj);
    });
    this.s('url').setHash(this.s('url').objectToHash(obj));
  }

  putInDom() {
    this.showOrHideArticles();
    this.showOrHideReinitButton();
    this.fillSearchField();
  }

  fillSearchField() {
    $('.my-article-search').val(this._facets['recherche']._value.join(' '));
  }

  showOrHideArticles() {
    const articles = this.articles();

    for (const article of articles) {
      const that = this;
      let visible = true;

      Object.keys(that._facets).forEach(key => {
        if (that._facets[key].hide(article)) {
          visible = false;
        };
      });

      article.setVisible(visible);
    }
  }

  callIfFacetsSelected(
    valuesAndResultsCallback,
    valuesNoResultsCallback,
    noValuesCallback = () => {},
  ) {
    let hasValues = false;
    const that = this;
    Object.keys(that._facets).forEach(key => {
      if (that._facets[key]._value.length > 0) {
        hasValues = true;
      };
    });

    if (hasValues) {
      if (this.atLeastOneArticleVisible(this.filtered())) {
        valuesAndResultsCallback();
      }
      else {
        valuesNoResultsCallback();
      }
    }
    else {
      noValuesCallback();
    }
  }

  setPartialText() {
    const that = this;
    this.callIfFacetsSelected(function() {
      $('.my-some-articles').show();
      $('.my-no-articles').hide();
    }, function() {
      $('.my-some-articles').hide();
      $('.my-no-articles').show();
    }, function() {
      $('.my-some-articles').hide();
      $('.my-no-articles').hide();
    });
    Object.keys(that._facets).forEach(key => {
      that._facets[key].setPartialText();
    });
  }

  atLeastOneArticleVisible(articles) {
    for (const article of articles) {
      if (article.visible()) {
        return true;
      }
    }
    return false;
  }

  putInButtons() {
    const that = this;
    Object.keys(that._facets).forEach(key => {
      that._facets[key].putInButtons(this.filtered());
    });
  }

  filtered() {
    const that = this;
    let articles = this.articles();

    Object.keys(that._facets).forEach(key => {
      articles = that._facets[key].filter(articles);
    });

    return articles;
  }

  articles() {
    let ret = [];
    for (const struct of this.s('articles')._data) {
      ret.push(new Article(this.services, struct));
    }
    return ret;
  }

}
