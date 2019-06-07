/* eslint-disable consistent-return */
import { google } from 'googleapis';
import { promisify } from 'util';
import config from '../config.json';
import authorize from '../utils/googleSheetUtility';

// Takes array of all public data and filters based on anonymity desire
function filterPublicDonations(donationsArrays) {
  return donationsArrays.map((donationArray) => {
    const newDonationArray = donationArray.slice(0); // Copy array
    if (donationArray[4] === 'TRUE') { // Donor chose anonymous name
      newDonationArray[1] = 'Anonymous'; // Obscure name
    } else { // Convert last name to last initial
      const splitName = newDonationArray[1].trim().split(' ', 2); // Obscure name
      if (splitName.length > 1) { // If there is more than just first name in name field
        const firstName = splitName[0];
        const firstLetterOfLastName = splitName[1].slice(0, 1);
        newDonationArray[1] = `${firstName} ${firstLetterOfLastName}.`;
      }
    }
    if (donationArray[5] === 'TRUE') { // Donor chose anonymous donation notes
      newDonationArray[3] = ''; // Obscure notes
    } 
    return newDonationArray;
  });
}

async function getPublicDonationData(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const getSheetValues = promisify(sheets.spreadsheets.values.get);
  const range = 'Donations!A2:G999'; // Date	DonorName	DonationAmount	DonationNotes	AnonymousName AnonymousNotes

  const res = await getSheetValues({
    spreadsheetId: config.spreadsheetId,
    range,
  });
  console.log('res: ', res);
  res.data.values = filterPublicDonations(res.data.values);
  return res;
}

export const handler = async (event, context, callback) => {
  console.log('getPublicDonationData handler triggered');

  try {
    // Load client secrets from a local file.
    // const content = fs.readFileSync('../credentials/sheet-credentials.json');
    // if (!content) return console.log('Error loading client secret file');
    // Authorize a client with credentials, then call the Google Sheets API.
    const sheetResponse = await authorize(
      auth => getPublicDonationData(auth),
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

  console.log('getPublicDonationData handler ended');
};
