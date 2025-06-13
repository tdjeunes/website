/** Interact with the URL */
class Url extends Service {
  setHash(hash = '') {
    this.s('urlBar').setHash(hash);
  }

  getHash() {
    return this.s('urlBar').getHash();
  }

  /** convert a hash a/b to an object {a: b} */
  hashToObject(hash) {
    if (typeof hash === 'undefined') {
      return {};
    }
    let ret = {};
    let index = 0;
    let currentKey = '';
    const parts = hash.split('/');
    for (const part of parts) {
      if (index % 2 == 0) {
        currentKey = decodeURIComponent(part);
      }
      else {
        if (currentKey !== '') {
          ret[currentKey] = decodeURIComponent(part);
        }
      }
      index++;
    }
    return ret;
  }

  /** convert an object {a: b} to a hash a/b */
  objectToHash(obj) {
    let retComponents = [];
    for (const key in obj) {
      retComponents.push(encodeURIComponent(key) + '/' + encodeURIComponent(obj[key]));
    }
    return retComponents.join('/');
  }

  /** Normalize the hash by removing extra slashes */
  cleanHash(hash) {
    return this.objectToHash(this.hashToObject(hash));
  }

  /** If hash is a/b/c/d, then a is b, c is d, b is undefined.
   * If the hash is %2F/%2F/a/b, then a is b and / is /.
   * If the hash is a/b/a/c/a/d, it wil return b (the first occurrence).
   */
  var(name, defaultValue = '') {
    const hash = this.getHash();
    if (this.hashToObject(hash)[name]) {
      return this.hashToObject(hash)[name];
    }
    return defaultValue;
  }

  /** Set param and value to hash
   * Example 1: adding param a and value b will cause the hash to contain
   * a/b.
   * Example 2: adding param / and value / will cause the hash to contain
   * %2F/%2F.
   * If the param already exists, it will be replaced.
   */
  setParam(param, value) {
    const hash = this.getHash();
    let hashObj = this.hashToObject(hash);
    hashObj[param] = value;
    return this.objectToHash(hashObj);
  }

}
