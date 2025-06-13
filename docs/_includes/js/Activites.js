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
    // Voir l'URL pour détais. Sont dans template, par exemple {{nom}}
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
