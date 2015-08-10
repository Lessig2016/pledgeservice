var RECEIPT_URL = '/';

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var recurring_pledge = function() {
  var request_url = PLEDGE_URL + '/r/pledge';
  
  var recurring_pledge_post_data = {
    email: getParameterByName('email'),
    phone: getParameterByName('phone'),
    name: getParameterByName('full_name'),
    occupation: getParameterByName('occupation'),
    employer: getParameterByName('employer'),
    recurrence_period: getParameterByName('recurrence_period'),
    target: getParameterByName('target'),
    subscribe: getParameterByName('subscribe') ? true : false,
    amountCents: parseInt(getParameterByName('amountCents')),
    recurrence_period: getParameterByName('recurrence_period'),
    recurring: true,
    team: getParameterByName('team') || readCookie("last_team_key") || '',
    keep_donation: getParameterByName('keep_donation'),
    payment: { STRIPE: { token: getParameterByName('card_token') } },
    customer_id: getParameterByName('customer_id'),
    upsell: true
  };

  $.ajax({
      type: 'POST',
      url: request_url,
      data: JSON.stringify(recurring_pledge_post_data),
      contentType: "application/json",
      dataType: 'json',
      success: function(response_data) {
        $('#ask-again-overlay').hide();
        $('#ask-again-popup').fadeOut();
      },
      error: function(response_data) {
        responseJSON = response_data.responseJSON || null
        
        if (responseJSON && ('paymentError' in responseJSON)) {
          showError("We're having trouble charging your card: " + responseJSON.paymentError);
        } else {
          $('#formError').text('Oops, something went wrong. Try again in a few minutes');
          $('#formError').show();
        }
      },
  });  
};

$(document).ready(function() {
  if getParameterByName('recurring') {
    $('#ask-again-popup').show();
    $('#ask-again-overlay').show();
  }
  $('#make_it_monthly').on('click', recurring_pledge);  
});