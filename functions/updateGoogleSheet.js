/* eslint-disable consistent-return */
import { google } from 'googleapis';
import { promisify } from 'util';
import config from '../config.json';
import authorize from '../utils/googleSheetUtility';

async function updateDonationsSheet(name, email, donationAmount, anonymous, notes, auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const updateSheet = promisify(sheets.spreadsheets.values.append);

  const resource = {
    majorDimension: 'ROWS',
    values: [
      [name, email, donationAmount, anonymous, notes],
    ],
  };

  const res = await updateSheet({
    spreadsheetId: config.spreadsheetId,
    resource,
    range: 'Donations',
    valueInputOption: 'USER_ENTERED',
  });
  return res;
}


export const handler = async (event, context, callback) => {
  console.log('UpdateGoogleSheet handler triggered');
  const requestBody = JSON.parse(event.body);
  console.log('requestBody: ', requestBody);
  const name = requestBody.name;
  const email = requestBody.email;
  const donationAmount = requestBody.donationAmount;
  const anonymous = requestBody.anonymous;
  const notes = requestBody.notes;
  const stripeMode = requestBody.stripeMode;

  try {
    // Load client secrets from a local file.
    // const content = fs.readFileSync('../credentials/sheet-credentials.json');
    // if (!content) return console.log('Error loading client secret file');
    // Authorize a client with credentials, then call the Google Sheets API.
    const sheetResponse = await authorize(
      auth => updateDonationsSheet(name, email, donationAmount, anonymous, notes, stripeMode, auth),
    );
    const { sheetStatus, sheetStatusText, data } = { sheetResponse };
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Donations sheet updated succesfully!',
        sheetResponse,
        sheetStatus,
        sheetStatusText,
        data,
      }),
    };
    callback(null, response);
  } catch (e) {
    console.log(e);
    const response = {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: e.message,
      }),
    };
    callback(null, response);
  }

  console.log('UpdateGoogleSheet handler ended');
};
