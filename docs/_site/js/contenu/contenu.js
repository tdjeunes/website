class Service {
  constructor(services) {
    if (typeof services === 'undefined') {
      throw new Error('Services must be passed to the constructor in ' + this.constructor.name);
    }
    if (typeof services.get === 'undefined') {
      throw new Error('Valid services must be passed to the constructor in ' + this.constructor.name);
    }
    this.services = services;
  }
  /** Preload this service and return itself. */
  async preload() {
    return this;
  }
  /** Get another service. */
  s(name) {
    return this.services.get(name);
  }
  setCallbackOnInit(callback) {
    this._callback = callback;
  }
  init2(settings) {
    // subclasses will override.
  }
}

/**
 * Pour tester ce code:
 *
 * * Aller à /articles/
 * * Ouvrir la console
 * * services.get('facets').addToFacet('categories', 'Eau');
 */
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

class ListFacet extends Facet {

  postProcess(raw) {
    if (!raw.startsWith('(')) {
      return [];
    }
    if (!raw.endsWith(')')) {
      return [];
    }
    return raw
      .substring(1, raw.length - 1)
      .split(')(');
  }

  armFacetController(onChangeCallback) {
    const that = this;
    $('.my-facet-not-new-page[data-facet=' + this.id() + ']').off().on('click', function(e) {
      e.preventDefault();
      that.toggleAndRemoveOthers(
        that.s('textUtilities').strFromUriEncoded($( this ).attr('data-add-category')),
      );
      onChangeCallback();
    });
    $('.my-facet-new-page[data-facet=' + this.id() + ']').each(function() {
      $( this ).attr(
        'href',
        '/actualites/#' + that.id() + '/(' + that.s('textUtilities').strFromUriEncoded($( this ).attr('data-add-category')).toUriEncodedAndSanitized() + ')',
      );
    });
  }

  addSanitized(value) {
    if (!this._value.includes(value)) {
      this._value.push(value);
    }
  }

  addBadges(filtered) {
    const info = this.getBadgeInfo(filtered);

    $('.my-category[data-facet=' + this.id() + ']').each(function() {
      const value = decodeURI($( this ).attr('data-add-category'))
        .replace(/\+/g, " ");;
      const count = typeof info[value] !== 'undefined' ? info[value] : 0;
      const disabled = count === 0 ? true : false;
      $( this ).find('.badge').text(count).show();
      if (disabled) {
        $( this ).addClass('my-disabled');
      }
    });
  }

  getBadgeInfo(filtered) {
    let ret = {};

    for (const article of filtered) {
      const articleValues = article.getFacetValues(this.id());
      for (const value of articleValues) {
        if (!ret[value]) {
          ret[value] = 0;
        }
        ret[value]++;
      }
    }

    return ret;
  }

  putInButtons(filtered) {
    const that = this;

    this.addBadges(filtered);

    if (!that._value.length) {
      $('.my-category[data-facet=' + that.id() + ']').removeClass('my-selected');
    }

    $('.my-category').each(function() {
      if ($( this ).attr('data-facet') == that.id()) {
        const category = $( this ).attr('data-add-category');
        const decoded = decodeURI(category);
        for (const value of that._value) {
          const sVal = that.s('textUtilities').sanitizeString(value);
          const sCat = that.s('textUtilities').sanitizeString(decoded);
          console.log('1534', sVal, sCat);
          if (sVal == sCat) {
            $( this ).addClass('my-selected');
          }
          else {
            $( this ).removeClass('my-selected');
          }
        }
      }
    });
  }

  removeSanitized(value) {
    // https://stackoverflow.com/a/66956107/1207752
    this._value.includes(value) && this._value.splice(this._value.indexOf(value), 1);
  }

  preprocessHashValue(value) {
    let sanitized = [];

    for (const unsanitized of value) {
      const sanitizedValue = this.s('textUtilities').sanitizeString(decodeURI(unsanitized));
      if (sanitizedValue) {
        sanitized.push(decodeURI(sanitizedValue));
      }
    }

    return '(' + sanitized.join(')(') + ')';
  }

}

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

class CategoryFacet extends ListFacet {

  id() {
    return "categories";
  }

  articleMatches(article) {
    return article.categoriesOverlap(this._value);
  }

}

class CountryFacet extends ListFacet {

  id() {
    return "pays";
  }

  articleMatches(article) {
    return article.countriesOverlap(this._value);
  }

}

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



class Alerts extends Service {

  preload() {
    const that = this;
    $('.my-build-error-to-display-with-js').each(function () {
      that.add('danger', $( this ).html());
    });
    return this;
  }

  add(type, message) {
    // https://getbootstrap.com/docs/4.0/components/alerts/
    $('.mettre-alertes-ici').append(`
<div class="alert alert-${type}" role="alert">
  ${message}
</div>
`);
  }

}

/** Interact with the URL */
class Url extends Service {
  setHash(hash = '') {
    this.s('urlBar').setHash(hash);
  }

  getHash() {
    return this.s('urlBar').getHash();
  }

  /** convert a hash a/b to an object {a: b} */
  hashToObject(hash) {
    if (typeof hash === 'undefined') {
      return {};
    }
    let ret = {};
    let index = 0;
    let currentKey = '';
    const parts = hash.split('/');
    for (const part of parts) {
      if (index % 2 == 0) {
        currentKey = decodeURIComponent(part);
      }
      else {
        if (currentKey !== '') {
          ret[currentKey] = decodeURIComponent(part);
        }
      }
      index++;
    }
    return ret;
  }

  /** convert an object {a: b} to a hash a/b */
  objectToHash(obj) {
    let retComponents = [];
    for (const key in obj) {
      retComponents.push(encodeURIComponent(key) + '/' + encodeURIComponent(obj[key]));
    }
    return retComponents.join('/');
  }

  /** Normalize the hash by removing extra slashes */
  cleanHash(hash) {
    return this.objectToHash(this.hashToObject(hash));
  }

  /** If hash is a/b/c/d, then a is b, c is d, b is undefined.
   * If the hash is %2F/%2F/a/b, then a is b and / is /.
   * If the hash is a/b/a/c/a/d, it wil return b (the first occurrence).
   */
  var(name, defaultValue = '') {
    const hash = this.getHash();
    if (this.hashToObject(hash)[name]) {
      return this.hashToObject(hash)[name];
    }
    return defaultValue;
  }

  /** Set param and value to hash
   * Example 1: adding param a and value b will cause the hash to contain
   * a/b.
   * Example 2: adding param / and value / will cause the hash to contain
   * %2F/%2F.
   * If the param already exists, it will be replaced.
   */
  setParam(param, value) {
    const hash = this.getHash();
    let hashObj = this.hashToObject(hash);
    hashObj[param] = value;
    return this.objectToHash(hashObj);
  }

}

class UrlBar extends Service {
  getHash() {
    const ret = window.location.hash;
    if(ret.charAt(0) === '#') {
       return ret.substring(1);
    }

    return ret;
  }
  setHash(hash = '') {
    window.location.hash = hash;
  }
  refreshPage() {
    location.reload();
  }
}

class Infos extends Service {
  init(options) {
    this.fetchData(options);
  }

  getStruct(title) {
    let ret = {};
    this._data.forEach((node) => {
      if (node.title == title) {
        ret = node;
      }
    });
    return ret;
  }

  async preload() {
    const that = this;
    $.ajaxSetup({
      async: false
    });
    $.getJSON(this.url(), (data) => {
      if (that.key() == '') {
        that._data = data;
      }
      else {
        that._data = data[that.key()];
      }
    });
    return this;
  }

  key() {
    return '';
  }

  url() {
    throw new Error('SVP utiliser une sous-classe comme Membres.');
  }

  variables() {
    throw new Error('SVP utiliser une sous-classe comme Membres.');
  }

  template() {
    throw new Error('SVP utiliser une sous-classe comme Membres.');
  }

  selecteur() {
    throw new Error('SVP utiliser une sous-classe comme Membres.');
  }

  /** voir https://github.com/tdjeunes/website/blob/master/docs/scripts/fetch-new-content.js  */
  fetchData(options) {
    const that = this;
    this.fetch((response) => {
      that.fetchResponseParsed(JSON.parse(response), options);
    });
  }

  /** voir https://github.com/tdjeunes/website/blob/master/docs/scripts/fetch-new-content.js  */
  fetchResponseParsed(response, options) {
    response.forEach((node) => {
      this.fetchResponseSingle(node);
    });
  }

  getResponseSingle(node) {
    let template = this.template();
    const obj = this.variables();
    const that = this;
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        template = that.replaceVariable(template, prop, node[prop], obj[prop]);
      }
    }
    return template;
  }
  fetchResponseSingle(node) {
    $(this.selecteur()).append(this.getResponseSingle(node));
  }

  replaceVariable(template, prop, value, type) {
    let prefix = '';
    if (type == 'image') {
      prefix = '';
    }
    const valueAndPrefix = prefix + value;
    return template.replace(new RegExp('__' + prop + '__', 'g'), valueAndPrefix);
  }

  /** voir https://github.com/tdjeunes/website/blob/master/docs/scripts/fetch-new-content.js  */
  cacheBuster() {
    return Math.floor(Date.now()/300000);
  }

  /** voir https://github.com/tdjeunes/website/blob/master/docs/scripts/fetch-new-content.js  */
  fetch(callback) {
    if (typeof this._data !== 'undefined') {
      callback(JSON.stringify(this._data));
      return;
    }
    // Changes every 5 minutes.
    const cachebuster = this.cacheBuster();
    const that = this;
    const url = that.url() + '?cache-buster=' + cachebuster;


    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);

    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        callback(this.responseText);
      }
    }
    xhr.send();
  }

}

class Antennes extends Infos {
  url() {
    // Voir /api/v1 pour détais.
    return '/api/v1/antennes.json';
  }

  getPays(antenne) {
    antenne = this.getStruct(antenne);

    if (typeof antenne.country2 != 'undefined') {
      return antenne.country2[0];
    }
    return '';
  }

  getPaysAsArray(antenne) {
    antenne = this.getStruct(antenne);

    if (typeof antenne.country2 != 'undefined') {
      return antenne.country2;
    }

    return [];
  }

  getDrapeau(antenne) {
    const pays = this.getPays(antenne);
    return this.s('pays').getFlag(pays);
  }

  init2() {
    $('.mettre-nbre-pays-ici').html(this.nbrePays());
  }

  nbrePays() {
    let pays = [];
    this._data.forEach((node) => {
      if (node.active && node.country2.length > 0) {
        node.country2.forEach((pays2) => {
          if (!pays.includes(pays2)) {
            pays.push(pays2);
          }
        });
      }
    });
    return pays.length - 1; // -1 pour le pays "modial"
  }

  activeForCountry(country) {
    let ret = [];
    this._data.forEach((node) => {
      if (node.active && node.country2.includes(country)) {
        ret.push(node);
      }
    });
    return ret;
  }

}

class Pays extends Infos {
  url() {
    // Voir /api/v1 pour détais.
    return '/api/v1/pays.json';
  }

  init2() {
    this.init();
  }

  getFlag(country) {
    country = this.getStruct(country);

    if (typeof country.drapeau != 'undefined') {
      return country.drapeau;
    }
    return '';
  }

  getResponseSingle(node) {
    const contenu = '';
    const activeAntennes = this.s('antennes').activeForCountry(node.title);
    let url = contenu + node.url;
    switch (activeAntennes.length) {
      case 0:
        return;
      case 1:
        url = activeAntennes[0].url;
        break;
      default:
        break;
    }
    let ret = super.getResponseSingle(node);
    ret = ret.replace(new RegExp('__url__', 'g'), url);
    ret = ret.replace(new RegExp('__num__', 'g'), activeAntennes.length);
    return ret;
  }

  selecteur() {
    return '.mettre-pays-ici';
  }

  variables() {
    // Voir l'URL pour détais. Sont dans template, par exemple 
    return {
      'title': 'string',
      'drapeau': 'image',
    };
  }

  template() {
    return `
<li>
  <img src="__drapeau__" alt="Drapeau: __title__" width="30">
  <a href="__url__">__title__ (__num__)</a>
</li>
`;
  }

}

/** Services singleton. Contains all other singletons. */
class Services {
  /** Init all the singletons. */
  async init(settings) {
    this.antennes = await new Antennes(this).preload();
    this.alerts = await new Alerts(this).preload();
    this.membres = await new Membres(this).preload();
    this.activites = await new Activites(this).preload();
    this.pays = await new Pays(this).preload();
    this.articles = await new Articles(this).preload();
    this.vars = await new Vars(this).preload();
    this.facets = await new Facets(this).preload();
    this.url = await new Url(this).preload();
    this.urlBar = await new UrlBar(this).preload();
    this.textUtilities = await new TextUtilities(this).preload();

    const that = this;

    Object.keys(that).forEach(key => {
      that[key].init2(settings[key]);
    });
    return this;
  }
  /** Get a singleton. */
  get(name) {
    if (typeof this[name] == 'undefined') {
      throw new Error('Unknown service or services has not been initalized: ' + name);
    }
    return this[name];
  }
}

class Articles extends Infos {
  url() {
    return '/api/v2/all.json';
  }

  key() {
    return 'actualites';
  }

  init2(options) {
    this.populateArticles(
      options.callback,
      options,
    )
  }

  populateArticles(callback, options) {
    this._callback = callback;
    this.init(options);
  }

  getAntennePays(node) {
    let ret = {
      'pays': '',
      'antenne': '',
      'drapeau': '',
    };
    if (typeof node.antenne2[0] != 'undefined') {
      ret.antenne = node.antenne2[0];
      ret.pays = this.s('antennes').getPays(ret.antenne);
      ret.drapeau = this.s('antennes').getDrapeau(ret.antenne);
    }
    return ret;
  }

  fetchResponseParsed(response, options) {
    const callback = this._callback;
    let articles = [];

    response.forEach((node) => {
      let show = true;

      if (typeof options !== 'undefined' && typeof options.not !== 'undefined') {
        node.categories.forEach((category) => {
          options.not.forEach((not) => {
            if (category === not) {
              show = false;
            }
          });
        });
      }

      if (typeof options !== 'undefined' && typeof options.onlyantenne !== 'undefined') {
        node.antenne2.forEach((antenne) => {
          options.onlyantenne.forEach((only) => {
            if (antenne !== only) {
              show = false;
            }
          });
        });
      }

      if (!show) {
        return;
      }
      let article = {
        title: node.title,
        description: node.excerpt,
        position: node.position ? node.position : '',
      }

      if (typeof node.img[0] != 'undefined') {
        article.image = '' + node.img[0];
      }
      if (typeof node.url != 'undefined') {
        article.url = '' + node.url;
      }
      article.pays = this.getAntennePays(node);

      if (typeof node.img[0] != 'undefined') {
        article.image = '' + node.img[0];
      }

      articles.push(article);
    });

    callback(articles);
  }
}

class Membres extends Infos {
  url() {
    return '/api/v2/all.json';
  }

  key() {
    return 'bios';
  }

  init2(options) {
    this.populateTeamMembers(
      options.callback,
      options,
    )
  }

  populateTeamMembers(callback, options) {
    this._callback = callback;
    this.init(options);
  }

  fetchResponseParsed(response, options) {
    let teamMembers = [];
    response.forEach((node) => {
      teamMembers.push({
        name: node.title,
        role: node.fonction,
        image: node.image,
        url: node.url,
        reseaux: node.reseaux,
      });
    });

    const callback = this._callback;
    if (callback) {
      callback(teamMembers);
    }
  }

}

class Activites extends Infos {
  url() {
    return '/api/v1/activites.json';
  }

  init2() {
    this.init();
  }

  selecteur() {
    return '.mettre-activites-ici';
  }

  variables() {
    // Voir l'URL pour détais. Sont dans template, par exemple 
    return {
      'title': 'string',
      'image': 'image',
      'url': 'url',
    };
  }

  template() {
    return `
<div class="col-lg-4 col-md-6 col-12 mb-4">
    <div class="custom-block-wrap shadow">
        <img src="__image__"
            class="custom-block-image img-fluid" alt="Children Education" style="object-fit: cover; height: 200px; transition: transform 0.3s;">

        <div class="custom-block">
            <div class="custom-block-body">
                <h5 class="mb-3" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">__title__</h5>

            </div>
            <a href="__url__" class="custom-btn btn">En savoir plus</a>
        </div>
    </div>
</div>
`;
}

}

class Vars extends Infos {
  url() {
    // Voir /api/v1 pour détais.
    return '/api/v1/vars.json';
  }

  init2() {
    this.init();
  }

  fetchResponseParsed(response, options) {
    if(typeof response.variable == 'undefined') {
      console.log('No variables found in response');
      return;
    }
    response.variable.forEach((elem) => {
      const selector = '[data-var="' + elem.title + '"]';
      $(selector).text(elem.val);
    });
  }

}

class Str extends Service {
  constructor(services, str) {
    super(services);
    this.str = str;
  }

  toString() {
    return this.str;
  }

  toUriEncodedAndSanitized() {
    return encodeURI(
      this.s('textUtilities').sanitizeString(this.str),
    );
  }

  raw() {
    return this.str;
  }
}

class TextUtilities extends Service {

  sanitizeString(str) {
    let ret = str;
    ret = this.removeTags(ret);
    ret = ret.toLowerCase();
    ret = ret.replace(/\+/g, " ");
    ret = this.cleanUpSpecialChars(ret);
    ret = ret.trim();
    return ret;
  }

  strFromUriEncoded(str) {
    return new Str(this.services, decodeURIComponent(str));
  }

  sanitizeArray(arr) {
    const sanitized = [];
    for (let i = 0; i < arr.length; i++) {
      const sanitizedString = this.sanitizeString(arr[i]);
      if (sanitizedString.length > 0) {
        sanitized.push(sanitizedString);
      }
    }
    return sanitized;
  }

  removeTags(str) {
    // https://stackoverflow.com/a/41756926/1207752
    return str.replace(/<style[^>]*>.*<\/style>/g, '')
      // Remove script tags and content
      .replace(/<script[^>]*>.*<\/script>/g, '')
      // Remove all opening, closing and orphan HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove leading spaces and repeated CR/LF
      .replace(/([\r\n]+ +)+/g, '');
  }

  cleanUpSpecialChars(str){
    // https://stackoverflow.com/a/18123682/1207752
    return str
      .replace(/[àâ]/g,"a")
      .replace(/[éèê]/g,"e")
      .replace(/[ï]/g,"i")
      .replace(/[ô]/g,"o")
      .replace(/[ç]/g,"c")
      .replace(/[^a-z0-9 ]/gi,'');
  }

}

$( document ).ready(function() {
  $('.my-show-only-these-country-buttons .my-show').each(function() {
    const country = $(this).html();
    $('.my-country-button[data-country="' + country + '"]').show();
    $('.my-show-only-if-there-is-a-country').show();
  });
});

