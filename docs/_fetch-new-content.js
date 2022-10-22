class TDJNewBlogPostFetcher {
  fetch() {
    const that = this;
    const url = 'http://contenu.terredesjeunes.org/api/v1/all.json';

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
    console.log(response);
  }
}

$(function() {
  fetcher = new TDJNewBlogPostFetcher();

  fetcher.fetch();
});
