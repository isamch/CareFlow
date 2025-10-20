import crypto from 'crypto';

// ---------------- OTP ----------------
export const generateOTP = (length = 6, expiresInMinutes = 10) => {
  const otp = crypto.randomInt(
    Math.pow(10, length - 1),
    Math.pow(10, length) - 1
  ).toString();

  const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  return { otp, expires };
};



// ---------------- Crypto Token ----------------
export const generateCryptoToken = (length = 32, expiresInMinutes = 10) => {
  const token = crypto.randomBytes(length).toString('hex');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000); // default 15 دقيقة

  return { token, hashedToken, expires };
}

