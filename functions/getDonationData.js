/* eslint-disable consistent-return */
import { google } from 'googleapis';
import { promisify } from 'util';
import config from '../config-donation.json';
import authorize from '../utils/googleSheetUtility-donation';

async function getDonationData(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const getSheetValues = promisify(sheets.spreadsheets.values.get);
  const range = 'Donations!C2:C999'; // Donation amount column

  const res = await getSheetValues({
    spreadsheetId: config.spreadsheetId,
    range,
  });
  return res;
}

export const handler = async (event, context, callback) => {
  console.log('getDonationData handler triggered');

  try {
    // Load client secrets from a local file.
    // const content = fs.readFileSync('../credentials/sheet-credentials.json');
    // if (!content) return console.log('Error loading client secret file');
    // Authorize a client with credentials, then call the Google Sheets API.
    const sheetResponse = await authorize(
      auth => getDonationData(auth),
    );
    const { sheetStatus, sheetStatusText, data } = sheetResponse;
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Donations data gathered succesfully!',
        sheetStatus,
        sheetStatusText,
        values: data.values,
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

  console.log('getDonationData handler ended');
};
