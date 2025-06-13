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
