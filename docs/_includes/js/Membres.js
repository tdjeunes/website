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
