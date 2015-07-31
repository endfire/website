'use strict';

var stripePublicKey = window.__env.USE_TEST ? window.__env.STRIPE_TEST_PK : window.__env.STRIPE_LIVE_PK;

console.log(window.__env.USE_TEST);
console.log(window.__env.STRIPE_TEST_PK);
console.log(window.__env.STRIPE_LIVE_PK);
console.log(stripePublicKey);

var apiUrl = window.__env.API_URL;
Stripe.setPublishableKey(stripePublicKey);

$(function ($) {
  var _this = this;

  $('#register form').submit(function (e) {
    e.preventDefault();

    var $form = $(_this);
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, function (status, response) {
      var $register = $('#register');

      if (response.error) {
        $form.find('.payment-errors').text(response.error.message);
        $form.find('button').prop('disabled', false);
        $register.find('.error').removeClass('hidden');

        setTimeout(function () {
          $register.find('.error').addClass('hidden');
        }, 2000);
      } else {
        (function () {
          var token = response.id;
          var email = $form.find('.email');
          var name = $form.find('.name');
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
            name: name.val(),
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

              email.val('');
              name.val('');
              coupon.val('');
            } else {
              $form.find('button').prop('disabled', false);
              $register.find('.error').removeClass('hidden');

              setTimeout(function () {
                $register.find('.error').addClass('hidden');
              }, 2000);
            }
          });
        })();
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