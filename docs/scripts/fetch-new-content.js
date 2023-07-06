class TDJNewBlogPostFetcher {
  baseUrl() {
    return 'https://contenu.terredesjeunes.org';
  }

  fetch() {
    // Changes every 5 minutes.
    const cachebuster = Math.floor(Date.now()/300000);
    const that = this;
    const url = this.baseUrl() + '/api/v1/all.json?cache-buster=' + cachebuster;

    const xhr = new XMLHttpRequest();

    // Making our connection
    xhr.open("GET", url, true);

    // function execute after request is successful
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        that.fetchResponse(this.responseText);
      }
    }
    // Sending our request
    xhr.send();
  }

  fetchResponse(response) {
    this.fetchResponseParsed(JSON.parse(response));
  }

  fetchResponseParsed(response) {
    const that = this;
    response.forEach((node) => {
      that.fetchResponseSingle(node);
    });
  }

  random() {
    return 'rand' + Math.round(Math.random()*1000000000000);
  }

  fetchResponseSingle(node) {
    this.fetchResponseSingleParsed(node.title, node.antenne, node.url, node.img, node.date, node.excerpt);
  }

  fetchResponseSingleParsed(title, antenne, url, img, date, excerpt) {
    if (typeof img !== 'undefined' && img.length) {
      this.insertByTemplate('carousel', title, antenne, url, [img[0]], date, excerpt);
    }
    this.insertByTemplate('main', title, antenne, url, img, date, excerpt);
  }

  insertByTemplate(name, title, antenne, url, img, date, excerpt) {
    console.log('inserting by template on ' + name);
    const rand = this.random();

    const antenneFilter = $('.tdj-template-' + name).attr('data-antenne');

    if (antenneFilter && antenneFilter != antenne) {
      console.log('Aborting because ' + antenneFilter + ' is not ' + antenne);
      return;
    }

    $('.tdj-template-' + name)
      .clone()
      .removeClass('tdj-template-' + name)
      .addClass(rand)
      .insertBefore('.tdj-placeholder-' + name);

    console.log('Created .' + rand);

    $('.' + rand)
      .find('.tdj-template-antenne')
      .html(antenne);

    $('.' + rand)
      .find('.tdj-template-title')
      .html(title);

    $('.' + rand)
      .find('.tdj-template-excerpt')
      .html(excerpt);

    $('.' + rand)
      .find('.tdj-template-date')
      .html(this.humanDate(date));

    $('.' + rand)
      .find('.tdj-template-url')
      .attr('href', this.baseUrl() + url);

    this.insertImages(rand, img);
  }

  humanDate(date) {
    return date.slice(0, 10);
  }

  insertImages(parentClass, images) {
    if (typeof images === 'undefined' || !images.length) {
      return;
    }
    // Extract the first image
    const first = images.shift();

    // Find the image container
    const image_wrapper = $('.' + parentClass)
      .find('.tdj-template-image');

    // Set the first image.
    image_wrapper.find('img').attr('src', this.baseUrl() + first);

    const that = this;

    // Set other images.
    images.forEach((i) => {
      image_wrapper
        .clone()
        .find('img')
        .attr('src', that.baseUrl() + i)
        .insertAfter(image_wrapper);
    });
  }

}

$(function() {
  fetcher = new TDJNewBlogPostFetcher();

  fetcher.fetch();
});
