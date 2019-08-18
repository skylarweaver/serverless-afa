import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import token from '../token-donation.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(callback) {
  const clientSecret = process.env.DONATION_SHEET_CLIENT_ID;
  const clientId = process.env.DONATION_SHEET_CLIENT_SECRET;
  const redirectUri = process.env.DONATION_SHEET_REDIRECT_URI_1;
  const oAuth2Client = new google.auth.OAuth2(
    clientSecret,
    clientId,
    redirectUri,
  );

  // Check if we have previously stored a token.
  if (!token) console.log('Token has expired! Need to run the getNewToken file');
  oAuth2Client.setCredentials(token);
  console.log('token: ', token);

  console.log('OAuth Authentication successful!');
  const callbackRes = await callback(oAuth2Client);
  return callbackRes;
}

export default authorize;
