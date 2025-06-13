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
