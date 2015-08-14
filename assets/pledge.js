/*

Copyright 2015 Lessig Equal Citizens Exploratory Committee 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/


// Part of this function modified from here:
// http://stackoverflow.com/a/2880929/1569632
//
// NOTE: This could be made more efficient by caching the result (and then
// killing the cache on URL changes, but we only call it once, so meh.


// ******************************************************************************
//   BE CAREFUL WITH THIS FILE. IT IS INCLUDED IN teams and website repositories
// ******************************************************************************

var getUrlParams = function() {
  var match,
  pl     = /\+/g,  // Regex for replacing addition symbol with a space
  search = /([^&=]+)=?([^&]*)/g,
  decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
  query  = window.location.search.substring(1);

  urlParams = {};
  while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);

  return urlParams;
};

var readCookie = function(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
};

var validateEmail = function(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
};

var paymentConfig = null;
var stripeHandler = null;

var getAmountCents = function() {
  return Math.floor($('#amount_input').val() * 100);
};

var validateForm = function() {
    var email = $('#email_input').val() || null;
    var occ = $('#occupation_input').val() || null;
    var emp = $('#employer_input').val() || null;
    var amount = $('#amount_input').val() || null;
    
	if (!$('#accept-rules').is(':checked') )
	{
		$('#pledgeButton').prop('disabled',true);
		$('label.rules').addClass('highlight-checkbox');
		
		return false;
	}

    if (!email) {
      showError( "Please enter email");
      return false;
    } else if (!validateEmail(email)) {
      showError("Please enter a valid email");
      return false;
    } else if (!occ) {
      showError( "Please enter occupation");
      return false;
    } else if (!emp) {
      showError( "Please enter employer");
      return false;
    } else if (!amount) {
      showError( "Please enter an amount");
      return false;
    } else if (amount < 1) {
      showError( "Please enter an amount of $1 or more");
      return false;
    } else if (amount > 5400) {
		  showError( "Please enter an amount less than $5400");
      return false;
	}

    return true;
};

var validateBitcoinForm = function() {
  var amount = $('#amount_input').val() || null;
  var firstName = $('#first_name_input').val() || null;  
  var lastName = $('#last_name_input').val() || null;  
  var address = $('#address_input').val() || null;
  var city = $('#city_input').val() || null;
  var state = $('#state_input').val() || null;
  var zip = $('#zip_input').val() || null;
    
  if (amount > 100) {
    showError( "Thank you for your generosity, but we are only able to accept Bitcoin donations of $100 or less");
    return false;
  } else if ($("#requiredConfirmation").is(':checked') == false ) {
    showError( "We are only able to accept donations from US citizens or green card holders, and you may only donate your own bitcoin.");
    return false;
  } else if (!firstName) {
    showError( "Please enter your first name");
    return false;
  } else if (!lastName) {
    showError( "Please enter your last name");
    return false;
  } else if (!address) {
    showError( "Please enter your address");
    return false;
  } else if (!city) {
    showError( "Please enter your address");
    return false;
  } else if (!state) {
    showError( "Please enter your state");
    return false;
  } else if (!zip) {
    showError( "Please enter your zip code");
    return false;
  } else {  
    return true;
  }
}

var bitcoinPledge = function() {
    if (validateForm() && validateBitcoinForm()) {
        var amount = $('#amount_input').val() || null;

        setLoading(true);
        createPledge("Bitcoin", { BITCOIN: {} });
    }
    return false;
};

var paypalPledge = function() {
    if (validateForm()) {
        setLoading(true);
        createPledge("Paypal", { PAYPAL: { step : 'start' } });
    }
    return false;
};
var pledge = function() {
  if (validateForm()) {
    var cents = getAmountCents();
    stripeHandler.open({
      email: $('#email_input').val(),
      amount: cents
    });
  }
};

var showError = function(errorText) {
  $('#formError').text(errorText);
  $('#formError').show();
}

var setLoading = function(loading) {
  if (loading) {
    $('#pledgeButton .pledgeText').hide();
    $('#pledgeButton').off('click');  
    $('#pledgeButton .spinner').show();
    $('#paypalButton').hide();
  } else {
    $('#pledgeButton .pledgeText').show();
    $('#pledgeButton').on('click', pledge);      
    $('#pledgeButton .spinner').hide();
    $('#paypalButton').show();
  }
}

var onTokenRecv = function(token, args) {
  setLoading(true);
  createPledge(args.billing_name, { STRIPE: { token: token.id } });
};

var createPledge = function(name, payment) {
  var urlParams = getUrlParams();
  var pledgeType = null;
  var request_url = null;

  if ('STRIPE' in payment) {
      request_url = PLEDGE_URL + '/r/pledge';
  }

  if ('PAYPAL' in payment) {
      request_url = PLEDGE_URL + '/r/paypal_start';
  }

  if ('BITCOIN' in payment) {
      request_url = PLEDGE_URL + '/r/bitcoin_start';
  }
  // ALL PAYPAL PAYMENTS AND BITCOIN PAYMENTS ARE DONATIONS
  if($("#directDonate_input").is(':checked') || ('PAYPAL' in payment) || ('BITCOIN' in payment) ) {
    pledgeType = 'DONATION';
  } else {
    pledgeType = 'CONDITIONAL';
  }

  var firstName = $('#first_name_input').val() || null;  
  var lastName = $('#last_name_input').val() || null;  
  var address = $('#address_input').val() || null;
  var city = $('#city_input').val() || null;
  var state = $('#state_input').val() || null;
  var zip = $('#zip_input').val() || null;
  var recurring = $("input[name=monthly][value=yes]").prop('checked') ? true : false;
  var recurrence_period = $('#recurrence_period_input').val() || null;
  var enddate = $('enddate_input').val() || null;
  var keep_donation = $('#keep_donation').prop('checked');
  
  if (($("#requiredConfirmation").prop('checked') == false) && ('BITCOIN' in payment) ) {
    console.log('Trying to pay with BITCOIN without a confirmation') 
    return;
  }
  
  var pledge_data = {
    email: $('#email_input').val(),
    phone: $('#phone_input').val(),
    name: name,
    occupation: $('#occupation_input').val(),
    employer: $('#employer_input').val(),
    target: $('#targeting_input').val(),      
    subscribe: $('#emailSignupInput').is(':checked') ? true : false,
    amountCents: getAmountCents(),
    pledgeType: pledgeType,
    team: urlParams['team'] || readCookie("last_team_key") || '',
    payment: payment
  };
  if (recurring) {
    pledge_data['recurring'] = recurring;
  }
  if(recurrence_period) {
    pledge_data['recurrence_period'] = recurrence_period;
  }
  if(enddate) {
    pledge_data['enddate'] = enddate;
  }
  if ($("#requiredConfirmation").is(':checked')) {
    pledge_data['bitcoinConfirm'] = true;
  }  
  
  if (firstName) {
    pledge_data['firstName'] = firstName;
  }

  if (lastName) {
    pledge_data['lastName'] = lastName;
  }

  if (address) {
    pledge_data['address'] = address;
  }

  if (zip) {
    pledge_data['zip'] = zip;
  }

  if (city) {
    pledge_data['city'] = city;
  }

  if (state) {
    pledge_data['state'] = state;
  }
  
  pledge_data['keep_donation'] = keep_donation;
  
  //CAB: we can probably delete the next three lines
  //$("input[name='thingname']").each(function(index) {
  //  data[$(this).data()['nationbuildername']] =  $(this).val();
  //});
  
  $.ajax({
      type: 'POST',
      url: request_url,
      data: JSON.stringify(pledge_data),
      contentType: "application/json",
      dataType: 'json',
      success: function(response_data) {
        if ('paypal_url' in response_data) {
          location.href = response_data.paypal_url
        } else if ('bitpay_url' in response_data) {
          location.href = response_data.bitpay_url
        } else {
          location.href = RECEIPT_URL + response_data.receipt_url + 
            '&full_name=' + name +
            '&customer_id=' + response_data.customer_id +
            '&amount=' + response_data.pledge_amount + 
            '&email=' + encodeURIComponent(pledge_data['email']) +
            '&phone=' + pledge_data['phone'] +
            '&occupation=' + encodeURIComponent(pledge_data['occupation']) +
            '&employer=' + encodeURIComponent(pledge_data['employer']) +
            '&target=' + encodeURIComponent(pledge_data['target']) +
            '&subscribe=' + pledge_data['subscribe'] +
            '&amountCents=' + pledge_data['amountCents'] +
            '&pledgeType=' + pledge_data['pledgeType'] +
            '&team=' + encodeURIComponent(pledge_data['team']) +
            '&card_token=' + response_data.card_token +
            '&recurring=' + recurring +
            '&recurrence_period=' + recurrence_period +
            '&keep_donation=' + keep_donation
        }
      },
      error: function(data) {
        setLoading(false);
        responseJSON = data.responseJSON || null        
        if (responseJSON && ('paymentError' in responseJSON)) {
          showError("We're having trouble charging your card: " + responseJSON.paymentError);
        } else if ('validationError' in responseJSON) {
          if (responseJSON['validationError'].indexOf('maximum') > 0) {
            showError("The donation amount cannot exceed $5,400 per person");
          } else {
            showError(responseJSON['validationError']);
          }
        } else {
          $('#formError').text('Oops, something went wrong. Try again in a few minutes');
          $('#formError').show();
        }
      },
  });
};

$(document).ready(function() {
  var urlParams = getUrlParams();
  var passedEmail = urlParams['email'] || '';
  var header = urlParams['header'] || '';

  //choose the frequency type
  $('input[name=monthly]').click('click',function(){  
    $('#recurrence_period_input').val('monthly');
  });

  $('#email_input').val(passedEmail);

  $('#pledgeButton').on('click', pledge);

  $('#paypalButton').on('click', paypalPledge);
  
  $('#bitcoinButton').on('click', bitcoinPledge);
  
  $.get(PLEDGE_URL + '/r/payment_config', {}, function(){}, "json").done(function(pConf) {    
      paymentConfig = pConf;
      stripeConfig = {
        key: paymentConfig.stripePublicKey,
        name: 'Lessig Equal Citizens Exploratory Committee',
        panelLabel: 'Pledge',
        billingAddress: true,
        image: PLEDGE_URL + '/static/lessig-logo-128.png',
        token: function(token, args) {
          onTokenRecv(token, args);
        }
      };
    stripeHandler = StripeCheckout.configure(stripeConfig);
  });
});
