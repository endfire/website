'use strict';

var stripePublicKey = 'pk_test_7Ud0jchdNbKU9qthAxdSSJlZ';
var apiUrl = window.__env.API_URL;
Stripe.setPublishableKey(stripePublicKey);

$(function ($) {
  var _this = this;

  $('#register form').submit(function (e) {
    e.preventDefault();

    var $form = $(_this);
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, function (status, response) {
      var $form = $(_this);

      if (response.error) {
        $form.find('.payment-errors').text(response.error.message);
        $form.find('button').prop('disabled', false);
      } else {
        var token = response.id;
        var email = $form.find('.email');
        var _name = $form.find('.name');
        var coupon = $form.find('.coupon');
        var meta = {
          frontend: $form.find('.meta-frontend').prop('checked'),
          backend: $form.find('.meta-backend').prop('checked'),
          database: $form.find('.meta-database').prop('checked'),
          experience: $form.find('.meta-experience').prop('checked')
        };
        var data = {
          token: token,
          email: email.val(),
          name: _name.val(),
          coupon: coupon.val(),
          meta: meta
        };

        $.ajax({
          url: apiUrl + '/payment',
          type: 'POST',
          dataType: 'json',
          data: data
        }).then(function (res) {
          if (res.paid) {
            window.location = '/receipt';
          }
        });
      }
    });
  });

  $('#register .coupon').on('blur', function (e) {
    var $this = $(_this);
    var $form = $('#register');
    var coupon = $form.find('.coupon');

    if (coupon.val()) {
      $.ajax({
        url: apiUrl + '/coupon',
        type: 'GET',
        dataType: 'json',
        data: {
          coupon: coupon.val()
        }
      }).then(function (res) {
        $form.find('.price').html('' + res.amount / 100);

        if (res.isValid) {
          $form.find('.coupon-success').removeClass('hidden');
        } else {
          $form.find('.coupon-success').addClass('hidden');
        }
      });
    }
  });
});