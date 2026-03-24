import axios from 'axios';

/**
 * Verifies a Google reCAPTCHA v3 token.
 * @param {string} token - The token received from the frontend.
 * @returns {Promise<boolean>} - True if verification is successful, false otherwise.
 */
export const verifyRecaptcha = async (token) => {
  if (!token) {
    console.error('reCAPTCHA token is missing');
    return false;
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    );

    const { success, score, action } = response.data;

    if (!success) {
      console.error('reCAPTCHA verification failed. Response data:', response.data);
      console.error('reCAPTCHA error codes:', response.data['error-codes']);
      return false;
    }

    // You can also check the score (v3 only) and the action
    // A score of 1.0 is very likely a human, 0.0 is very likely a bot.
    // Default threshold is usually around 0.5.
    if (score < 0.5) {
      console.warn(`Low reCAPTCHA score: ${score}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error.message);
    return false;
  }
};
