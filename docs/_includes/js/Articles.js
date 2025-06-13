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
