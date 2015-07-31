const stripePublicKey = 'pk_test_7Ud0jchdNbKU9qthAxdSSJlZ';
const apiUrl = window.__env.API_URL;
Stripe.setPublishableKey(stripePublicKey);

$(function($) {
  $('#register form').submit((e) => {
    e.preventDefault();

    const $form = $(this);
    $form.find('button').prop('disabled', true);

    Stripe.card.createToken($form, (status, response) => {
      const $form = $(this);

      if (response.error) {
        $form.find('.payment-errors').text(response.error.message);
        $form.find('button').prop('disabled', false);
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
