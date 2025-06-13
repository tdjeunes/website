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
