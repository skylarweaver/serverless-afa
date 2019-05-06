import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import token from '../token.json';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = '../token.json';

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, async (err, newToken) => { // TODO test if async breaks getNewToken function
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(newToken);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (error) => {
        if (error) console.error(error);
        console.log('Token stored to', TOKEN_PATH);
      });
      const callbackRes = await callback(oAuth2Client);
      return callbackRes; // May not need to return callbackRes
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(callback) {
  const clientSecret = process.env.SHEET_CLIENT_ID;
  const clientId = process.env.SHEET_CLIENT_SECRET;
  const redirectUri = process.env.SHEET_REDIRECT_URI_1;
  const oAuth2Client = new google.auth.OAuth2(
    clientSecret,
    clientId,
    redirectUri,
  );

  // Check if we have previously stored a token.
  if (!token) return getNewToken(oAuth2Client, callback);
  oAuth2Client.setCredentials(token);
  console.log('token: ', token);

  console.log('OAuth Authentication successful!');
  const callbackRes = await callback(oAuth2Client);
  return callbackRes;
}

export default authorize;
