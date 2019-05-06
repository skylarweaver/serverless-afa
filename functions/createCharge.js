const stripe = require('stripe');

export const handler = (event, context, callback) => {
  console.log('createCharge');
  console.log(event);
  const requestBody = JSON.parse(event.body);
  console.log(requestBody);

  const stripeKey = (requestBody.environment === 'production' ? process.env.STRIPE_LIVE_SECRET_KEY : process.env.STRIPE_TEST_SECRET_KEY);
  console.log('requestBody.environment: ', requestBody.environment);
  console.log('stripeKey: ', stripeKey);
  const stripeInstance = stripe(stripeKey);
  console.log('stripeInstance: ', stripeInstance);
  const token = requestBody.tokenId;
  const amount = requestBody.charge.amount;
  const currency = requestBody.charge.currency;
  // eslint-disable-next-line camelcase
  const receipt_email = requestBody.charge.receipt_email;

  return stripeInstance.charges.create({ // Create Stripe charge with token
    amount,
    currency,
    receipt_email,
    description: 'Thank you for your tax-deductible donation to support people with Alopecia!',
    source: token,
  })
    .then((charge) => { // Success response
      console.log(charge);
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'Charge processed succesfully!',
          charge,
        }),
      };
      callback(null, response);
    })
    .catch((err) => { // Error response
      console.log(err);
      const response = {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        message: err.message,
      };
      callback(null, response);
    });
};
