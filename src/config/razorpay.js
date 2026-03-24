import Razorpay from "razorpay";

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

if (!razorpay) {
    console.warn("[RAZORPAY] Razorpay keys missing in .env. Payment features will be disabled.");
}

export default razorpay;
