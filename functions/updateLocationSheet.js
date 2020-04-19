/* eslint-disable consistent-return */
import { google } from 'googleapis';
import { promisify } from 'util';
import config from '../config-location.json';
import authorize from '../utils/googleSheetUtility-location';

async function updateLocationsSheet(requestBody, auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const appendSheet = promisify(sheets.spreadsheets.values.append);
  const updateSheet = promisify(sheets.spreadsheets.values.update);

  // Cleanse sheet input so no functions can be added
  const date = requestBody.date.toString().replace('=', '');
  const lat = requestBody.lat.toString().replace('=', '');
  const long = requestBody.long.toString().replace('=', '');
  const speed = requestBody.speed.toString().replace('=', '');
  const alt = requestBody.alt.toString().replace('=', '');
  const temp = requestBody.temp.toString().replace('=', '');
  const head = requestBody.head.toString().replace('=', '');


  const resource = {
    majorDimension: 'ROWS',
    values: [
      [date, lat, long, speed, alt, temp, head],
    ],
  };

  const appendSheetRes = await appendSheet({
    spreadsheetId: config.spreadsheetId,
    resource,
    range: 'Locations',
    valueInputOption: 'USER_ENTERED',
  });
  await updateSheet({
    spreadsheetId: config.spreadsheetId,
    resource,
    range: 'MostRecentLocation!A2:G2',
    valueInputOption: 'USER_ENTERED',
  });
  return appendSheetRes;
}


export const handler = async (event, context, callback) => {
  console.log('updateLocationSheet handler triggered');
  const requestBody = JSON.parse(event.body);
  console.log('requestBody: ', requestBody);

  try {
    // Load client secrets from a local file.
    // const content = fs.readFileSync('../credentials/sheet-credentials.json');
    // if (!content) return console.log('Error loading client secret file');
    // Authorize a client with credentials, then call the Google Sheets API.
    const sheetResponse = await authorize(
      auth => updateLocationsSheet(requestBody, auth),
    );

    const { sheetStatus, sheetStatusText, data } = sheetResponse;
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Locations sheet updated succesfully!',
        sheetStatus,
        sheetStatusText,
        data,
      }),
    };
    callback(null, response);
  } catch (e) {
    console.log('updateGoogleSheet Error', e);
    const response = {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      message: e.message,
    };
    callback(null, response);
  }

  console.log('updateLocationSheet handler ended');
};
