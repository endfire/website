const stripePublicKey = window.__env.STRIPE_PK;
const apiUrl = window.__env.API_URL;
Stripe.setPublishableKey(stripePublicKey);

$(function($) {
  // wake up heroku
  $.ajax({
    url: `${apiUrl}`,
    type: 'GET',
    dataType: 'json'
  }).then(res => {
    console.log('Heroku has awaken!');
  });

  $('#register form').submit((e) => {
    e.preventDefault();

    const $form = $(this);
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, (status, response) => {
      const $register = $('#register');

      if (response.error) {
        $form.find('.payment-errors').text(response.error.message);
        $form.find('button').prop('disabled', false);
        $register.find('.error').removeClass('hidden');

        setTimeout(() => {
          $register.find('.error').addClass('hidden');
        }, 2000);
      } else {
        const token = response.id;
        const email = $form.find('.email');
        const name = $form.find('.name');
        const coupon = $form.find('.coupon');
        const meta = {
          frontend: $form.find('.meta-frontend').prop('checked'),
          backend: $form.find('.meta-backend').prop('checked'),
          database: $form.find('.meta-database').prop('checked'),
          experience: $form.find('.meta-experience').prop('checked')
        };
        const data = {
          token: token,
          email: email.val(),
          name: name.val(),
          coupon: coupon.val(),
          meta: meta
        };

        $.ajax({
          url: `${apiUrl}/payment`,
          type: 'POST',
          dataType: 'json',
          data: data
        }).then(res => {
          if (res.paid) {
            window.location = '/receipt';

            email.val('');
            name.val('');
            coupon.val('');
          } else {
            $form.find('button').prop('disabled', false);
            $register.find('.error').removeClass('hidden');

            setTimeout(() => {
              $register.find('.error').addClass('hidden');
            }, 2000);
          }
        });
      }
    });
  });

  $('#register .coupon').on('blur', (e) => {
    const $this = $(this);
    const $form = $('#register');
    const coupon = $form.find('.coupon');

    if (coupon.val()) {
      $.ajax({
        url: `${apiUrl}/coupon`,
        type: 'GET',
        dataType: 'json',
        data: {
          coupon: coupon.val()
        }
      }).then(res => {
        $form.find('.price').html(`${res.amount / 100}`);

        if (res.isValid) {
          $form.find('.coupon-success').removeClass('hidden');
        } else {
          $form.find('.coupon-success').addClass('hidden');
        }
      });
    }
  });
});
