class Service {
  constructor(services) {
    if (typeof services === 'undefined') {
      throw new Error('Services must be passed to the constructor in ' + this.constructor.name);
    }
    if (typeof services.get === 'undefined') {
      throw new Error('Valid services must be passed to the constructor in ' + this.constructor.name);
    }
    this.services = services;
  }
  /** Preload this service and return itself. */
  async preload() {
    return this;
  }
  /** Get another service. */
  s(name) {
    return this.services.get(name);
  }
  setCallbackOnInit(callback) {
    this._callback = callback;
  }
  init2(settings) {
    // subclasses will override.
  }
}
