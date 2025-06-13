class TDJ {
  constructor() {
    this._data = null;
    this._callbacks = [];
  }
  static instance() {
    if (!TDJ._instance) {
      TDJ._instance = new TDJ();
    }
    return TDJ._instance;
  }
  dataAvailable() {
    return this._data !== null;
  }
  init() {
    const that = this;
    loadJSON('/api/v2/all.json',
      function(data) {
        that._data = data;
        that._callbacks.forEach(callback => callback(data));
      },
      function(xhr) {
        console.error(xhr);
      },
    );
  }
  getData(callback) {
    if (this.dataAvailable()) {
      callback(this._data);
    }
    else {
      this._callbacks.push(callback);
    }
  }
}
