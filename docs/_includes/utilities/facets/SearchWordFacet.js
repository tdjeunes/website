class SearchWordFacet extends Facet {

  id() {
    return "recherche";
  }

  postProcess(raw) {
    return raw ? [raw] : [];
  }

  preprocessHashValue(value) {
    return value.join(' ')
  }

  addSanitized(value) {
    if (value) {
      this._value = [value];
    }
    else {
      this._value = [];
    }
  }

  acceptChange(value, callback) {
    this.add(value);
    callback();
  }

  armFacetController(onChangeCallback) {
    const that = this;
    $('.my-article-search').off().on('input', function() {
      if ($(this).val() == '') {
        that.acceptChange($(this).val(), onChangeCallback);
      }
    });

    $('.my-article-search').on('blur', function() {
      that.acceptChange($(this).val(), onChangeCallback);
    });

    $('.my-article-search').keypress(function (e) {
      // "Enter"
      if (e.which == 13) {
        that.acceptChange($(this).val(), onChangeCallback);
      }
    });
  }

  removeSanitized(value) {
    // Regardless of the value, reset the search word.
    this._value = [];
  }

  articleMatches(article) {
    return article.matchesSearchWord(this._value.join(' '));
  }

}
