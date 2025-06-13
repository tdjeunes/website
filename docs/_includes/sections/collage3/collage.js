class MyCollage3Card {
  constructor(data) {
    this._data = data;
  }
  cardHtml() {
    throw "Please use subclass";
  }
  modalHtml() {
    return null;
  }
  id() {
    return this._data.id;
  }
  modal() {
    const modal_html = this.modalHtml();
    if (modal_html) {
      var new_elem = document.createElement('div');
      new_elem.innerHTML = modal_html;
      return new_elem;
    }
    return null;
  }
  card() {
    var new_html = this.cardHtml();
    var new_elem = document.createElement('div');
    // .html(new_html)
    new_elem.classList.add('my-collage-3-card');
    new_elem.classList.add('col-12');
    new_elem.classList.add('col-md-6');
    new_elem.classList.add('col-lg-4');
    new_elem.classList.add('mb-4');
    new_elem.style.position = 'absolute';
    new_elem.style.left = '0%';
    new_elem.style.top = '0px';
    new_elem.innerHTML = new_html;
    return new_elem;
  }
}

class MyCollage3VideoCard extends MyCollage3Card {
  cardHtml() {
    const antenne = this._data.antenne;
    const flag = this._data.flag;
    const pays = this._data.pays;
    const title = this._data.title;
    const video = this._data.video;
    const poster = video + '.jpg';

    return `<div class="card">
      <video controls="controls" preload="none" poster="${poster}">
        <source src="${video}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="card-body">
        <div class="pays-sur-article pays-sur-article-hero">
          <img src="${flag}" alt="Drapeau: Sénégal" class="img-fluid rounded-circle" style="object-fit: cover;">
          <div class="antenne">${pays}</div>
        </div>
        <p class="card-text">${title}</p>
      </div>
    </div>
    `;
  }
}

class MyCollage3TextCard extends MyCollage3Card {
  cardHtml() {
    const antenne = this._data.antenne;
    const flag = this._data.flag;
    const pays = this._data.pays;
    const title = this._data.title;
    const text = this._data.content;
    return `<div class="card">
      <div class="card-body">
        <div class="pays-sur-article pays-sur-article-hero">
          <img src="${flag}" alt="Drapeau: ${pays}" class="img-fluid rounded-circle" style="object-fit: cover;">
          <div class="antenne">${antenne}</div>
        </div>
        <h5 class="card-title">${title}</h5>
        ${text}
      </div>
    </div>
    `;
  }
}

class MyCollage3ImgCard extends MyCollage3Card {
  cardHtml() {
    const antenne = this._data.antenne;
    const flag = this._data.flag;
    const pays = this._data.pays;
    const title = this._data.title;
    const img = this._data.img;
    const id = this.id();

    return `<div class="card" data-bs-toggle="modal" data-bs-target="#${id}">
      <img src="${img}" class="card-img-top" alt="${title}">
      <div class="card-body">
        <div class="pays-sur-article pays-sur-article-hero">
          <img src="${flag}" alt="Drapeau: ${pays}" class="img-fluid rounded-circle" style="object-fit: cover;">
          <div class="antenne">${antenne}</div>
        </div>
        <h5 class="card-title">${title}</h5>
      </div>
    </div>
    `;
  }
  modalHtml() {
    const antenne = this._data.antenne;
    const flag = this._data.flag;
    const pays = this._data.pays;
    const title = this._data.title;
    const img = this._data.img;
    const id = this.id();
    return `<div class="modal fade" id="${id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">${title}</h5>
          <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">
          <img src="${img}" class="card-img-top" alt="${title}">
          <div class="pays-sur-article pays-sur-article-hero">
            <img src="${flag}" alt="Drapeau: ${pays}" class="img-fluid rounded-circle" style="object-fit: cover;">
            <div class="antenne">${antenne}</div>
          </div>
          <h3>${title}</h3>
        </div>
      </div>
    </div>
  </div>
    `;
  }
}

class MyCollage3RandomColorCard extends MyCollage3Card {
  rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  cardHtml() {
    const title = JSON.stringify(this._data || 'No title');
    const random = this.rand(200, 400);
    const randomcindex = this.rand(1, 3);
    const randomc = ['red', 'yellow', 'green'][randomcindex - 1];
    return `<div class="card">
      <div class="card-body" style="background: ${randomc}; height: ${random}px">
        ${title}
      </div>
    </div>
    `;
  }
}


class MyCollage3DataSet {
  constructor(data) {
    this._data = this.randomizeData(data);
    this._pointer = 0;
  }

  randomizeData(data) {
    this.shuffle(data);

    const that = this;

    function shuffleInternal(item, index, arr) {
      let cards = arr[index].cards || [];
      that.shuffle(cards);
      arr[index].cards = cards;
    }

    data.forEach(shuffleInternal);

    return data;
  }

  // https://stackoverflow.com/a/2450976/1207752
  shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]
      ];
    }
  }

  getFromCurrentCountry() {
    const country = this._data[this._pointer];

    if (country.cards.length == 0) {
      return false;
    }

    return this.getCard(this._data[this._pointer].cards.shift());
  }

  getCard(card) {
    if (card.structure == 'video') {
      return new MyCollage3VideoCard(card);
    }
    if (card.structure == 'img') {
      return new MyCollage3ImgCard(card);
    }
    if (card.structure == 'text') {
      return new MyCollage3TextCard(card);
    }

    return new MyCollage3RandomColorCard(card);
  }

  incrementPointer() {
    const datalen = this._data.length;
    const candidate = this._pointer + 1;
    if (candidate >= datalen) {
      this._pointer = 0;
    } else {
      this._pointer = candidate;
    }
  }

  get() {
    const initialPointer = this._pointer;
    do {
      const candidate = this.getFromCurrentCountry();
      this.incrementPointer();
      if (candidate) {
        return candidate;
      }
    }
    while (this._pointer != initialPointer);
    return false;
  }

}
class MyCollage3 {
  constructor(data) {
    this._lastScolledHeight = 0;
    this._justScrolled = false;
    this._data = new MyCollage3DataSet(data);
  }
  static instance(data) {
    if (!MyCollage3._instance) {
      MyCollage3._instance = new MyCollage3(data);
    }
    return MyCollage3._instance;
  }
  masonryLibraryIsLoaded() {
    return typeof Masonry !== 'undefined' && document.querySelector('.my-collage-3-put-blocks-here');
  }
  showElement() {
    const new_elem = this._data.get();

    if (!new_elem) {
      return false;
    }

    const card = new_elem.card();

    // .append(element)
    const parent = document.querySelector('.my-collage-3-put-blocks-here');
    if (parent) {
      parent.appendChild(card);
    }

    const modal = new_elem.modal();

    if (modal) {
      const modalParent = document.querySelector('main');
      if (modalParent) {
        modalParent.appendChild(modal);
      }
    }

    new Masonry('.my-collage-3-put-blocks-here').layout();
    const elemtop = card.getBoundingClientRect().top;
    return elemtop < window.innerHeight;


  }
  scrolledToNewTerritory() {
    const previoslyScrolledHeight = this._lastScolledHeight;
    const currentWindowHeight = window.scrollY;

    return currentWindowHeight >= previoslyScrolledHeight;
  }
  addElementsWhileVisible() {
    const visible = this.showElement();
    if (visible) {
      this._justScrolled = true;
    }
  }
  addElementsWhileVisibleAndRecordLastWindowHeight() {
    // First, figure out if we have scrolled to new territory.
    if (this.scrolledToNewTerritory()) {
      // Remember where we have scrolle to, for next time.
      const height = window.scrollY;
      this._lastScolledHeight = Math.max(this._lastScolledHeight, height);
      // Add some elements until we run out of space.
      this.addElementsWhileVisible();
    }
  }
  scrollToTop() {
    // Otherwise some browsers get confused.
    window.scrollTo(0, 0);
  }
  monitorScroll() {
    if (this._justScrolled) {
      this._justScrolled = false;
      this.addElementsWhileVisibleAndRecordLastWindowHeight();
    }
    setTimeout(() => {
      this.monitorScroll();
    }, 300);
  }
  init() {
    const that = this;
    if (this.masonryLibraryIsLoaded()) {
      that._justScrolled = true;
      addEventListener("scroll", (event) => {
        that._justScrolled = true;
      });
      that.scrollToTop();
      that.monitorScroll();
    } else {
      setTimeout(function() {
        that.init()
      }, 1000);
    }
  }
}

loadJSON('/api/v2/cards.json', function(data) {
  MyCollage3.instance(data).init();
}, function(err) {
  console.error('Error loading cards:', err);
});
