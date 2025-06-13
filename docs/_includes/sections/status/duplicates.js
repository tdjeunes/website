class MyStatusDuplicates {
  constructor() {
    this._urls = [];
    this._duplicates = [];
  }
  static instance() {
    if (!MyStatusDuplicates._instance) {
      MyStatusDuplicates._instance = new MyStatusDuplicates();
    }
    return MyStatusDuplicates._instance;
  }
  init(data) {
    const that = this;
    Object.keys(data).forEach(key => {
      that.checkContent(data[key]);
    });
    this.finish();
  }
  finish() {
    const len = this._urls.length;
    let dupes = this._duplicates.join(', ');
    if (!dupes) {
      dupes = 'none';
    }
    window.top.document.querySelectorAll('.my-status-duplicate-desc')
      .forEach((el) => {
        el.innerHTML = `Found ${this._duplicates.length} duplicate URLs out of ${len} total URLs. Duplicates: ${dupes}`;
      });
    window.top.document.querySelectorAll('.my-status-duplicates')
      .forEach((el) => {
        el.classList.remove('my-status-in-progress');
        if (this._duplicates.length > 0) {
          el.classList.add('my-status-error');
        }
        else {
          el.classList.add('my-status-ok');
        }
      });

    console.log('urls', this._urls);
    console.log('dupes', this._duplicates);
  }
  checkContent(content) {
    const that = this;
    content.forEach((item) => {
      that.addUrl(item.url)
    });
  }
  addUrl(url) {
    if (this._urls.includes(url)) {
      console.warn('Duplicate URL found:', url);
      this.addDuplicate(url);
    }
    this._urls.push(url);
  }
  addDuplicate(url) {
    this._duplicates.push(url);
  }
}

TDJ.instance().getData(function(data) {
  MyStatusDuplicates.instance().init(data);
});
