require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const paymentRoutes = require("./routes/payment");


const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
app.use("/api/hitpay", paymentRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
