require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Global configurations
const RUN_MODE = process.env.RUN_MODE || 'sandbox'; // Default to sandbox

const PAYPAL_API_BASE =
  RUN_MODE === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

const CLIENT_ID =
  RUN_MODE === 'sandbox'
    ? process.env.SANDBOX_CLIENT_ID
    : process.env.PRODUCTION_CLIENT_ID;

const CLIENT_SECRET =
  RUN_MODE === 'sandbox'
    ? process.env.SANDBOX_CLIENT_SECRET
    : process.env.PRODUCTION_CLIENT_SECRET;

const GOAL = 10000; // Donation goal
let totalDonations = 0; // Maintain total donations state

// Get PayPal access token
async function getAccessToken() {
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET,
      },
    }
  );
  return response.data.access_token;
}

// Fetch transactions and update total donations
async function fetchAndUpdateDonations() {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/reporting/transactions`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          start_date: new Date(
            new Date().setDate(new Date().getDate() - 7)
          ).toISOString(), // Fetch transactions from the last 7 days
          end_date: new Date().toISOString(),
          transaction_status: 'S', // Only successful transactions
        },
      }
    );

    const transactions = response.data.transaction_details;

    // Calculate total donations
    totalDonations = transactions.reduce((sum, txn) => {
      const amount = parseFloat(txn.transaction_info.transaction_amount.value);
      return sum + amount;
    }, 0);

    console.log(`Updated Total Donations: ILS ${totalDonations}`);
  } catch (error) {
    console.error('Error fetching PayPal transactions:', error.response?.data || error.message);
  }
}

// Poll PayPal API every 5 minutes
setInterval(fetchAndUpdateDonations, 0.1 * 60 * 1000);
fetchAndUpdateDonations(); // Initial fetch on server start

// API Endpoint to get total donations
app.get('/balance', (req, res) => {
  res.json({ balance: totalDonations, goal: GOAL });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} in ${RUN_MODE} mode`);
});