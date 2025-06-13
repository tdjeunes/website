class Str extends Service {
  constructor(services, str) {
    super(services);
    this.str = str;
  }

  toString() {
    return this.str;
  }

  toUriEncodedAndSanitized() {
    return encodeURI(
      this.s('textUtilities').sanitizeString(this.str),
    );
  }

  raw() {
    return this.str;
  }
}

class TextUtilities extends Service {

  sanitizeString(str) {
    let ret = str;
    ret = this.removeTags(ret);
    ret = ret.toLowerCase();
    ret = ret.replace(/\+/g, " ");
    ret = this.cleanUpSpecialChars(ret);
    ret = ret.trim();
    return ret;
  }

  strFromUriEncoded(str) {
    return new Str(this.services, decodeURIComponent(str));
  }

  sanitizeArray(arr) {
    const sanitized = [];
    for (let i = 0; i < arr.length; i++) {
      const sanitizedString = this.sanitizeString(arr[i]);
      if (sanitizedString.length > 0) {
        sanitized.push(sanitizedString);
      }
    }
    return sanitized;
  }

  removeTags(str) {
    // https://stackoverflow.com/a/41756926/1207752
    return str.replace(/<style[^>]*>.*<\/style>/g, '')
      // Remove script tags and content
      .replace(/<script[^>]*>.*<\/script>/g, '')
      // Remove all opening, closing and orphan HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove leading spaces and repeated CR/LF
      .replace(/([\r\n]+ +)+/g, '');
  }

  cleanUpSpecialChars(str){
    // https://stackoverflow.com/a/18123682/1207752
    return str
      .replace(/[àâ]/g,"a")
      .replace(/[éèê]/g,"e")
      .replace(/[ï]/g,"i")
      .replace(/[ô]/g,"o")
      .replace(/[ç]/g,"c")
      .replace(/[^a-z0-9 ]/gi,'');
  }

}
