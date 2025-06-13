class UrlBar extends Service {
  getHash() {
    const ret = window.location.hash;
    if(ret.charAt(0) === '#') {
       return ret.substring(1);
    }

    return ret;
  }
  setHash(hash = '') {
    window.location.hash = hash;
  }
  refreshPage() {
    location.reload();
  }
}
