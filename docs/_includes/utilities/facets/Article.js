class Article extends Service {

  constructor(services, struct) {
    super(services);
    this._struct = struct;
  }

  articleId() {
    return this._struct.url;
  }

  matchesSearchWord(searchWord) {
    const needle = this.s('textUtilities').sanitizeString(searchWord);
    const haystack = ' ' + this.unaccentedTextToSearch() + ' ';

    for (const word of needle.split(' ')) {
      if (word) {
        if (haystack.includes(' ' + word + ' ')) {
          return true;
        }
      }
    }
    return false;
  }

  unaccentedTextToSearch() {
    const countries = this.countries();
    const categories = this.categories();
    const title = this.title();
    const content = this.content();

    const countriesAsPlainText =
      this.s('textUtilities').sanitizeString(countries.join(' '));
    const categoriesAsPlainText =
      this.s('textUtilities').sanitizeString(categories.join(' '));
    const titleAsPlainText =
      this.s('textUtilities').sanitizeString(title);
    const contentAsPlainText =
      this.s('textUtilities').sanitizeString(content);

    return [
      countriesAsPlainText,
      categoriesAsPlainText,
      titleAsPlainText,
      contentAsPlainText,
    ].join(' ');
  }

  content() {
    return this._struct.content ? this._struct.content : '';
  }

  title() {
    return this._struct.title ? this._struct.title : '';
  }

  antennes() {
    if (!this._struct.antenne2) {
      return [];
    };
    return this._struct.antenne2;
  }

  getFacetValues(facet) {
    if (facet === 'pays') {
      return this.countries();
    }
    else if (facet === 'categories') {
      return this.categories();
    }
    else if (facet === 'antennes') {
      return this.antennes();
    }
    else {
      return [];
    }
  }

  categories() {
    const toRemove = 'jekyll_blogposts';
    let categories = this._struct.categories ? this._struct.categories : [];

    categories.includes(toRemove) && categories.splice(categories.indexOf(toRemove), 1);

    return categories
  }

  countries() {
    let ret = [];
    for (const antenne of this.antennes()) {
      ret = ret.concat(this.s('antennes').getPaysAsArray(antenne));
    }
    return ret;
  }

  categoriesOverlap(categories) {
    return this.overlap(this.categories(), categories);
  }

  countriesOverlap(countries) {
    return this.overlap(this.countries(), countries);
  }

  overlap(arr1, arr2) {
    if (arr1.length === 0 || arr2.length === 0) {
      return false;
    }

    const asciiArr1 = this.s('textUtilities').sanitizeArray(arr1);
    const asciiArr2 = this.s('textUtilities').sanitizeArray(arr2);

    for (const item of asciiArr1) {
      if (asciiArr2.includes(item)) {
        return true;
      }
    }
    return false;
  }

  selector() {
    return '[data-url-for-filtering="' + this.articleId() + '"]';
  }

  visible() {
    return $(this.selector()).is(':visible');
  }

  setVisible(visible) {
    $(this.selector()).each(function() {
      if (visible) {
        $( this ).show();
      }
      else {
        $( this ).hide();
      }
    });
  }

}
