class Alerts extends Service {

  preload() {
    const that = this;
    $('.my-build-error-to-display-with-js').each(function () {
      that.add('danger', $( this ).html());
    });
    return this;
  }

  add(type, message) {
    // https://getbootstrap.com/docs/4.0/components/alerts/
    $('.mettre-alertes-ici').append(`
<div class="alert alert-${type}" role="alert">
  ${message}
</div>
`);
  }

}
