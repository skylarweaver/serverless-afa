/* eslint-disable consistent-return */
import { google } from 'googleapis';
import { promisify } from 'util';
import config from '../config-location.json';
import authorize from '../utils/googleSheetUtility-location';

// Takes array of all public data and filters based on anonymity desire
function obfuscateLocation(locationArray) {
  const obfLocationArray = locationArray.slice();
  const obfuscatedLat = Math.round(locationArray[1]);
  const obfuscatedLong = Math.round(locationArray[2]);
  obfLocationArray[1] = obfuscatedLat.toString();
  obfLocationArray[2] = obfuscatedLong.toString();
  return obfLocationArray;
}


async function getLocationData(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const getSheetValues = promisify(sheets.spreadsheets.values.get);
  // const range = 'Locations!C2:C999'; // Location amount column
  const range = 'MostRecentLocation!A2:G2'; // Location amount column

  const res = await getSheetValues({
    spreadsheetId: config.spreadsheetId,
    range,
  });
  return res;
}

export const handler = async (event, context, callback) => {
  try {
    // Load client secrets from a local file.
    // const content = fs.readFileSync('../credentials/sheet-credentials.json');
    // if (!content) return 
    // Authorize a client with credentials, then call the Google Sheets API.
    const sheetResponse = await authorize(
      auth => getLocationData(auth),
    );
    const { sheetStatus, sheetStatusText, data } = sheetResponse;
    // Obfuscate location data so skylar is safe
    const obfuscatedLocationData = obfuscateLocation(data.values[0]);
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Location data gathered succesfully!',
        sheetStatus,
        sheetStatusText,
        values: [obfuscatedLocationData],
      }),
    };
    callback(null, response);
  } catch (e) {
    
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

  
};
