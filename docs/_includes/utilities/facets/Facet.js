class Facet extends Service {

  constructor(services) {
    super(services);
    // Values are not sanitized.
    this._value = [];
  }

  addToHashObject(obj) {
    if (this._value.length === 0) {
      delete obj[this.id()];
    }
    else if (this.toHashValue()) {
      obj[this.id()] = this.toHashValue();
    }
    return obj;
  }

  armFacetController(onChangeCallback) {
  }

  add(value) {
    this.addSanitized(value);
  }

  toggleAndRemoveOthers(value) {
    if (this._value.includes(value.raw())) {
      this._value = [];
    }
    else {
      this._value = [value.raw()];
    }
  }

  toggle(value) {
    if (this._value.includes(value)) {
      this.remove(value);
    }
    else {
      this.add(value);
    }
  }

  remove(value) {
    this.removeSanitized(value);
  }

  addSanitized(value) {
    throw "please use subclass";
  }

  putInButtons(filtered) {
  }

  removeSanitized(value) {
    throw "please use subclass";
  }

  hide(article) {
    if (this._value.length === 0) {
      return false;
    }
    return !this.articleMatches(article);
  }

  partialTextSelector() {
    return '.my-some-articles-' + this.id();
  }

  valueAsString() {
    return this._value.join(', ');
  }

  setPartialText() {
    if (this._value.length === 0) {
      $(this.partialTextSelector()).hide();
    }
    else {
      $(this.partialTextSelector()).show();
    }
    $(this.partialTextSelector() + ' .my-some-articles-value').text(
      this.valueAsString(),
    );
  }

  articleMatches(article) {
    throw "please use subclass";
  }

  filter(articles) {
    return articles;
  }

  toHashValue() {
    if (this._value.length === 0) {
      return '';
    }
    return this.preprocessHashValue(this._value);
  }

  preprocessHashValue(value) {
    throw "please use subclass";
  }

  fetchFromUrl() {
    const raw = this.s('url').var(this.id());
    this._value = this.postProcess(raw);
  }

  id() {
    throw "please use subclass";
  }

  postProcess(raw) {
    throw "please use subclass";
  }

}
