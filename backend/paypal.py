"""Helpers for retriving data from Paypal."""

import logging
import model
import urlparse
import urllib
import pprint
import copy

from google.appengine.api import urlfetch


def send_request(fields):
  config = model.Config.get()

  fields["VERSION"] = "113"
  fields["USER"] = config.paypal_user
  fields["PWD"] = config.paypal_password
  fields["SIGNATURE"] = config.paypal_signature

  form_data = urllib.urlencode(fields)

  urlfetch.set_default_fetch_deadline(30)
  result = urlfetch.fetch(url=config.paypal_api_url, payload=form_data, method=urlfetch.POST,
                          headers={'Content-Type': 'application/x-www-form-urlencoded'})
  result_map = urlparse.parse_qs(result.content)

  if 'ACK' in result_map:
    if result_map['ACK'][0] == "Success" or result_map['ACK'][0] == "SuccessWithWarning":
      return (True, result_map)

    logging.warning("Paypal returned an error:")
    logging.warning(pprint.pformat(result_map))
    return (False, result_map)

  logging.warning("Could not contact Paypal:")
  logging.warning(result.content)
  return False, result.content


def encode_data(data):
  d = copy.copy(data)

  # Trim out a few items we don't need to transmit
  del d['amountCents']
  del d['name']
  del d['payment']


def SetExpressCheckout(host_url, amount_cents, email, data_key):
  amount_dollars = amount_cents / 100

  form_fields = {
      "METHOD": "SetExpressCheckout",
      "RETURNURL": host_url + '/r/paypal_return',
      "CANCELURL": host_url + '/donate',
      "EMAIL": email,
      "PAYMENTREQUEST_0_PAYMENTACTION": "Sale",
      "PAYMENTREQUEST_0_DESC": "Lessig Equal Citizens Exploratory Committee",
      "PAYMENTREQUEST_0_AMT":  "%d.00" % amount_dollars,
      "PAYMENTREQUEST_0_ITEMAMT":  "%d.00" % amount_dollars,
      "PAYMENTREQUEST_0_CUSTOM": data_key,
      "L_PAYMENTREQUEST_0_NAME0": "Lessig Equal Citizens Exploratory Committee",
      "L_PAYMENTREQUEST_0_AMT0":  "%d.00" % amount_dollars,
      "ALLOWNOTE":  "0",
      "SOLUTIONTYPE":  "Sole",
      "BRANDNAME":  "Lessig Equal Citizens Exploratory Committee",
      # TODO FIXME - LOGOIMG trumps if given; it's a different look with HDRIMG
      "LOGOIMG":  host_url + '/static/lessig-logo-128.png',
      #"HDRIMG":   self.request.host_url + '/static/paypal_hdrimg.png',
      #"PAYFLOWCOLOR":    "00FF00",
      #"CARTBORDERCOLOR": "0000FF",
      # TODO FIXME Explore colors.  Seems like either color has same result, and
      # cart trumps
  }

  rc, results = send_request(form_fields)
  if rc:
    config = model.Config.get()
    return rc, config.paypal_url + "?cmd=_express-checkout&token=" + results['TOKEN'][0]

  return False, ""


def DoExpressCheckoutPayment(token, payer_id, amount, custom):

  form_fields = {
      "METHOD": "DoExpressCheckoutPayment",
      "TOKEN": token,
      "PAYERID": payer_id,
      "PAYMENTREQUEST_0_PAYMENTACTION": "Sale",
      "PAYMENTREQUEST_0_DESC": "Non-refundable donation to Lessig2016.us",
      "PAYMENTREQUEST_0_AMT":  amount,
      "PAYMENTREQUEST_0_ITEMAMT":  amount,
      "PAYMENTREQUEST_0_CUSTOM": custom,
  }

  rc, results = send_request(form_fields)

  return rc, results
