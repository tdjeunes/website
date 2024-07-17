class TDJBaseFetcher {
  baseUrl() {
    return 'https://contenu.terredesjeunes.org';
  }

  // The domain of the image server.
  imageProviderBaseUrl() {
    return 'https://images.terredesjeunes.org';
  }

  // The URL of the JSON file containing the image.
  imageMapFileUrl() {
    return 'http://image-mapping.terredesjeunes.org/mapping.json';
  }

  cacheBuster() {
    return Math.floor(Date.now()/300000);
  }

  fetch(callback) {
    // Changes every 5 minutes.
    const cachebuster = this.cacheBuster();
    const that = this;
    const url = this.baseUrl() + this.apiPath() + '?cache-buster=' + cachebuster;

    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);

    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        callback(this.responseText);
      }
    }
    xhr.send();
  }

  fetchData() {
    const that = this;
    this.fetch((response) => {
      that.fetchResponseParsed(JSON.parse(response));
    });
  }

  random() {
    return 'rand' + Math.round(Math.random()*1000000000000);
  }

  humanDate(date) {
    return date.slice(0, 10);
  }

}

class TDJNewBlogPostFetcher extends TDJBaseFetcher {
  apiPath() {
    return '/api/v1/all.json';
  }

  fetchResponseParsed(response) {
    response.forEach((node) => {
      this.fetchResponseSingle(node);
    });
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

  insertImages(parentClass, images) {

    if (typeof images === 'undefined' || !images.length) {
      return;
    }
    // Optimized Image mapping file.
    const imageMapFileUrl = this.imageMapFileUrl();
    // Fetch the JSON file once
    fetch(imageMapFileUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch JSON');
      }
      return response.json();
    })
    .then(mappingData => {

      // Extract the first image
      const first = images.shift();

      // Find the image container
      const image_wrapper = $('.' + parentClass)
        .find('.tdj-template-image');

      const image = image_wrapper.find('img');

      // Get the width and height attributes
      const width = image.attr('width');
      const height = image.attr('height');

      // Initialize variables for size components
      let imageSize = '';

      // Check conditions and construct the size string accordingly
      if (width && height) {
        // Both width and height are set
        imageSize = width + 'x' + height;
      } else if (width) {
        // Only width is set
        imageSize = width + 'x';
      } else if (height) {
        // Only height is set
        imageSize = 'x' + height;
      }

      const firstImgSrc = this.getMappedImageSrc(mappingData, first, imageSize);
      // Set the first image.
      image_wrapper.find('img').attr('src', firstImgSrc);

      const that = this;

      // Set other images.
      images.forEach(async (i) => {
        let otherImgSrc = that.getMappedImageSrc(mappingData, i, imageSize);
        image_wrapper
          .clone()
          .find('img')
          .attr('src', otherImgSrc)
          .insertAfter(image_wrapper);
      });

    }).catch(error => {
        console.error('Error fetching or processing JSON:', error);
        // Optionally handle error, e.g., set a fallback image for all images
    });

  }
  
/**
 * Function to find optimized image src path from image src and size.
 *
 * @param {object} mappingData - Secure Optimized image Json data which is generated for each image and sizes.
 * @param {string} img - Original image src.
 *  example:- /media/screenshot_2024-07-06_at_10.00.38.jpg 
 * @param {string} imageSize - Size of the optimized image to get from mappingData.
 *   example:- x200 , 500X200, 200x. 
 */
 getMappedImageSrc(mappingData, img, imageSize) {
    // Get base url of optimized image provider server.
    let imageProviderBaseUrl = this.imageProviderBaseUrl();
    // Get optimized image URL path from mapping data by passing original image path.
    let optimizedSrc = mappingData[img.replace('/media', '')];
    // Holds image src.
    let finalImageSrc = '';
    if (optimizedSrc && optimizedSrc[imageSize]) {
      const secureurlpart = optimizedSrc[imageSize]
      // Construct the optimized URL
      const optimizedURL = `${secureurlpart}`;

      // Update img src with optimized URL
      finalImageSrc = imageProviderBaseUrl + optimizedURL;
    }
    else {
      // using imageMapFileUrl, we cannot map the unoptimized image to
      // an optimized image. We will use the original image.
      console.log("Optimized image not found.");
      finalImageSrc = this.baseUrl() + img;
    }
    return finalImageSrc;
  }
}

class TDJAntennesFetcher extends TDJBaseFetcher {
  apiPath() {
    return '/api/v1/antennes.json';
  }

  fetchResponseParsed(response) {
    const that = this;
    const container = document.getElementById("antennes-by-country");

    if (container) {
      const groupedByCountry = this.groupItemsByCountry(response);
      const sortedCountries = this.sortCountries(Object.keys(groupedByCountry));

      sortedCountries.forEach((country) => {
        const countryItems = groupedByCountry[country];
        this.displayItemsByCountry(container, country, countryItems);
      });
    }
  }

  groupItemsByCountry(response) {
    const groupedByCountry = {};

    response.forEach((item) => {
      if (item.active && item.country) {
        if (!groupedByCountry[item.country]) {
          groupedByCountry[item.country] = [];
        }
        groupedByCountry[item.country].push(item);
      }
    });

    return groupedByCountry;
  }

  sortCountries(countries) {
    return countries.sort();
  }

  displayItemsByCountry(container, country, countryItems) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item-list');

    const heading = document.createElement('h3');
    heading.textContent = country;

    const ul = document.createElement('ul');
    countryItems.forEach((countryItem, index) => {
      const li = this.createListItem(countryItem, index);
      ul.appendChild(li);
    });

    itemDiv.appendChild(heading);
    itemDiv.appendChild(ul);

    container.appendChild(itemDiv);
  }

  createListItem(countryItem, index) {
    const li = document.createElement('li');
    li.classList.add('views-row', 'views-row-' + (index + 1), (index % 2 === 0 ? 'views-row-odd' : 'views-row-even'));

    if (index === 0) {
      li.classList.add('views-row-first');
    }

    const imageDiv = this.createImageDiv(countryItem);
    const titleDiv = this.createTitleDiv(countryItem);

    li.appendChild(imageDiv);
    li.appendChild(titleDiv);

    return li;
  }

  createImageDiv(countryItem) {
    const imageDiv = document.createElement('div');
    imageDiv.classList.add('views-field-field-image-fid');

    const img = document.createElement('img');
    img.src = this.baseUrl() + countryItem.logo_image;
    img.alt = countryItem.title;
    img.title = countryItem.title;
    img.classList.add('imagecache', 'imagecache-tdj_thumb_small_sidemenu', 'imagecache-default', 'imagecache-tdj_thumb_small_sidemenu_default');

    const imgLink = document.createElement('a');
    imgLink.href = countryItem.page_url;
    imgLink.appendChild(img);

    imageDiv.appendChild(imgLink);

    return imageDiv;
  }

  createTitleDiv(countryItem) {
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('views-field-title');

    const titleLink = document.createElement('a');
    titleLink.href = countryItem.page_url;
    titleLink.textContent = countryItem.title;

    const titleSpan = document.createElement('span');
    titleSpan.classList.add('field-content');
    titleSpan.appendChild(titleLink);

    titleDiv.appendChild(titleSpan);

    return titleDiv;
  }
}

$(function() {
  fetcher = new TDJNewBlogPostFetcher();
  fetcher.fetchData();
  fetcher = new TDJAntennesFetcher();
  fetcher.fetchData();
});
