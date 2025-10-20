import User from "./../models/User.js";
import Patient from "./../models/Patient.js";
import PatientRecord from "./../models/PatientRecord.js";
import Token from "./../models/Token.js";

import { hashPassword, comparePassword } from "./../utils/hashing.js";
import { generateOTP, generateCryptoToken } from "../utils/generateTokens.js";
import { sendCookies, clearCookie } from "./utils/Cookies.js";

import { generateAccessToken, generateRefreshToken, decode } from "./../utils/jwt.js";
import { successResponse } from "./../utils/apiResponse.js";
import * as ApiError from "./../utils/ApiError.js";
import asyncHandler from "./../utils/asyncHandler.js";
import { sendEmail } from "./../utils/email.js";



// --- Helper Functions --- 
const saveToken = async (userId, refreshToken) => {
  await Token.deleteOne({ userId })
  await Token.create({ userId, token: refreshToken })
}


// --- Controllers ---

export const register = asyncHandler(async (req, res, next) => {
  const { email, fullName, password } = req.body
  if (await User.findOne({ email })) {
    return next(ApiError.conflict('User already exists with this email'))
  }

  const hashedPassword = await hashPassword(password)
  const { token, hashedToken, expires } = generateCryptoToken(6, 10)

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: 'Patient',
    status: 'pending_verification',
    emailVerificationToken: hashedToken,
    emailVerificationExpires: expires
  })

  const newPatientRecord = await PatientRecord.create({})

  await Patient.create({
    patientRecord: newPatientRecord._id,
    userId: user._id
  })

  
  // (Send Email Logic)
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${token}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    templateName: "verification",
    templateData: {
      name: user.fullName,
      link: verificationUrl
    }
  });

  return successResponse(res, 201, 'Registration successful. Please check your email.', { userId: user.id })
})





export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')

  if (!user || !user.password || !(await comparePassword(password, user.password))) {
    return next(ApiError.unauthorized('Invalid email or password'))
  }
  if (!user.isEmailVerified) {
    return next(ApiError.forbidden('Please verify your email before logging in.'))
  }
  if (user.status === 'suspended') {
    return next(ApiError.unauthorized('Your account is suspended'))
  }

  let profile = null
  if (user.role !== 'Admin') {
    profile = await mongoose.model(user.role).findOne({ userId: user._id })
  }
  if (!profile && user.role !== 'Admin') {
    return next(ApiError.unauthorized('Profile not found for this user. Contact admin.'))
  }

  const payload = {
    id: user.id,
    role: user.role,
    profileId: profile ? profile.id : null
  }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  sendCookies(res, {
    name: "Authorization",
    value: accessToken,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000 // 15 minutes
    }
  });

  sendCookies(res, {
    name: "refreshToken",
    value: refreshToken,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  });

  await saveToken(user.id, refreshToken)
  const accessTokenData = decode(accessToken)

  return successResponse(res, 200, 'Login successful', {
    accessToken,
    refreshToken,
    expiresIn: accessTokenData.exp * 1000 - Date.now()
  })
})



export const logout = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(ApiError.unauthorized('User not authenticated'));
  }

  // remove token from database
  await Token.deleteOne({ userId });

  // remove cookies
  clearCookie(res, 'Authorization');
  clearCookie(res, 'refreshToken');

  return successResponse(res, 200, 'Logout successful');
});






export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  })
  if (!user) return next(ApiError.badRequest('Token is invalid or has expired'))

  user.isEmailVerified = true
  user.status = 'active'
  user.emailVerificationToken = undefined
  user.emailVerificationExpires = undefined
  await user.save()
  return successResponse(res, 200, 'Email verified successfully.')
})











// // email verify :

// export const sendCodeVerifyEmail = async (req, res) => {

//   const existingUser = await User.findById(req.user.id);

//   if (!existingUser) {
//     throw { statusCode: 404, message: "User not found" };
//   }

//   if (existingUser.verified) {
//     return apiResponse(res, "success", "Email already verified", { email: existingUser.email }, 200);
//   }

//   const code = generateOTP(6);

//   existingUser.verificationCode = code;
//   existingUser.verificationCodeValidationTime = Date.now() + 10 * 60 * 1000;
//   await existingUser.save();


//   successResponse(res, 200, { email: existingUser.email }, "Verification code saved, email will be sent shortly");

//   const info = await sendMail({
//     to: existingUser.email,
//     subject: "Verify your email",
//     templateName: "verification",
//     templateData: { name: existingUser.name, code }
//   });

//   if (!info.accepted.includes(existingUser.email)) {
//     throw { statusCode: 500, message: "Failed to send verification email" };
//   }

// };




// export const VerifyCodeEmail = async (req, res) => {
//   const { code } = req.body;

//   const existingUser = await User.findById(req.user.id).select("+verificationCode +verificationCodeValidationTime");;


//   if (!existingUser) {
//     throw { statusCode: 404, message: "User not found" };
//   }

//   if (existingUser.verified) {
//     return apiResponse(res, "success", "Email already verified", { email: existingUser.email }, 200);
//   }

//   if (!existingUser.verificationCode || !existingUser.verificationCodeValidationTime) {
//     throw { statusCode: 400, message: "Verification code not generated" };
//   }

//   if (Date.now() > existingUser.verificationCodeValidationTime) {
//     throw { statusCode: 400, message: "Verification code expired" };
//   }

//   if (existingUser.verificationCode !== code.toString()) {
//     throw { statusCode: 400, message: "Invalid verification code" };
//   }

//   existingUser.verified = true;
//   existingUser.verificationCode = null;
//   existingUser.verificationCodeValidationTime = null;
//   await existingUser.save();

//   return successResponse(res, 200, { email: existingUser.email }, "Email verified successfully");

// };