$( document ).ready(function() {
  $('.my-show-only-these-country-buttons .my-show').each(function() {
    const country = $(this).html();
    $('.my-country-button[data-country="' + country + '"]').show();
    $('.my-show-only-if-there-is-a-country').show();
  });
});
