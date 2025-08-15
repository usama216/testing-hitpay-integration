const axios = require("axios");

const hitpayClient = axios.create({
  baseURL: process.env.HITPAY_API_URL,
  headers: {
    "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY,
    "Content-Type": "application/json" 
  }
});

console.log(process.env.HITPAY_API_URL);

exports.createPayment = async (req, res) => {
  try {
    const {
      amount,
      currency,
      email,
      name,
      purpose,
      reference_number,
      redirect_url,
      webhook,
      payment_methods = ["paynow_online"],
      phone,
      send_email = false,
      send_sms = false,
      allow_repeated_payments = false,
    } = req.body;

    const payload = {
      amount,
      currency,
      email,
      name,
      purpose,
      reference_number,
      redirect_url,
      webhook,
      payment_methods,
      phone,
      send_email,
      send_sms,
      allow_repeated_payments,
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    const response = await hitpayClient.post("/v1/payment-requests", payload);
    
    res.json(response.data);
  } catch (error) {
    console.error("HitPay createPayment error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data || error.message,
      details: error.response?.status ? `HTTP ${error.response.status}` : 'Network Error'
    });
  }
};

exports.handleWebhook = async (req, res) => {
  const event = req.body;
  console.log("Received HitPay webhook:", event);
    
  res.status(200).send("OK");
};