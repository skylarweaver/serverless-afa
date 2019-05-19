/* eslint-disable consistent-return */
import { google } from 'googleapis';
import { promisify } from 'util';
import config from '../config.json';
import authorize from '../utils/googleSheetUtility';

async function updateDonationsSheet(requestBody, auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const updateSheet = promisify(sheets.spreadsheets.values.append);

  // Cleanse sheet input so no functions can be added
  const date = requestBody.date.replace('=', '');
  const name = requestBody.name.replace('=', '');
  const email = requestBody.email.replace('=', '');
  const donationAmount = requestBody.donationAmount.replace('=', '');
  const anonymous = requestBody.anonymous.replace('=', '');
  const notes = requestBody.notes.replace('=', '');
  const stripeMode = requestBody.stripeMode.replace('=', '');

  const resource = {
    majorDimension: 'ROWS',
    values: [
      [date, name, donationAmount, notes, anonymous, stripeMode, email],
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

  try {
    // Load client secrets from a local file.
    // const content = fs.readFileSync('../credentials/sheet-credentials.json');
    // if (!content) return console.log('Error loading client secret file');
    // Authorize a client with credentials, then call the Google Sheets API.
    const sheetResponse = await authorize(
      auth => updateDonationsSheet(requestBody, auth),
    );

    const { sheetStatus, sheetStatusText, data } = sheetResponse;
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Donations sheet updated succesfully!',
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
      message: e.message,
    };
    callback(null, response);
  }

  console.log('UpdateGoogleSheet handler ended');
};
