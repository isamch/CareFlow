import User from "./../models/User.js";
import { signToken } from "./../utils/jwt.js";
import { successResponse, apiResponse } from './../utils/apiResponse.js'
import { sendCookies, clearCookie } from '../utils/Cookies.js'
import { doHash, doHashValidation } from './../utils/hashing.js';
import { generateOTP } from './../utils/generateOTP.js';
import { sendMail } from './../utils/email.js';




export const registerController = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log('already');
    throw { message: "User already exists", statusCode: 409 };
  }
  // hach pass :
  const hashedPassword = await doHash(password);
  const user = await User.create(
    {
      name,
      email,
      password: hashedPassword
    }
  );
  user.password = undefined;
  return successResponse(res, 201, user, "user created");

};


export const loginController = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email }).select("+password");

  if (!existingUser) {
    throw { statusCode: 404, message: "user not exist" }
  }

  const result = doHashValidation(password, existingUser.password);

  if (!result) {
    throw { statusCode: 401, message: "Invalid credentials!" }
  }


  // jwt work :
  const jwtToken = signToken(
    {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      verified: existingUser.verified,

    },
    "2h"
  );



  // send cookies :
  sendCookies(res, {
    name: "Authorization",
    value: "Bearer " + jwtToken,
    options: {
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    }
  });


  return successResponse(res, 201, { token: jwtToken, }, "login success");

};



export const logoutController = (req, res) => {
  clearCookie(res, "Authorization");
  return successResponse(res, 200, null, "logged out successfully");
};




// email verify :

export const sendCodeVerifyEmail = async (req, res) => {

  const existingUser = await User.findById(req.user.id);

  if (!existingUser) {
    throw { statusCode: 404, message: "User not found" };
  }

  if (existingUser.verified) {
    return apiResponse(res, "success", "Email already verified", { email: existingUser.email }, 200);
  }

  const code = generateOTP(6);

  existingUser.verificationCode = code;
  existingUser.verificationCodeValidationTime = Date.now() + 10 * 60 * 1000;
  await existingUser.save();


  successResponse(res, 200, { email: existingUser.email }, "Verification code saved, email will be sent shortly");

  const info = await sendMail({
    to: existingUser.email,
    subject: "Verify your email",
    templateName: "verification",
    templateData: { name: existingUser.name, code }
  });

  if (!info.accepted.includes(existingUser.email)) {
    throw { statusCode: 500, message: "Failed to send verification email" };
  }

};




export const VerifyCodeEmail = async (req, res) => {
  const { code } = req.body;

  const existingUser = await User.findById(req.user.id).select("+verificationCode +verificationCodeValidationTime");;


  if (!existingUser) {
    throw { statusCode: 404, message: "User not found" };
  }

  if (existingUser.verified) {
    return apiResponse(res, "success", "Email already verified", { email: existingUser.email }, 200);
  }

  if (!existingUser.verificationCode || !existingUser.verificationCodeValidationTime) {
    throw { statusCode: 400, message: "Verification code not generated" };
  }

  if (Date.now() > existingUser.verificationCodeValidationTime) {
    throw { statusCode: 400, message: "Verification code expired" };
  }

  if (existingUser.verificationCode !== code.toString()) {
    throw { statusCode: 400, message: "Invalid verification code" };
  }

  existingUser.verified = true;
  existingUser.verificationCode = null;
  existingUser.verificationCodeValidationTime = null;
  await existingUser.save();

  return successResponse(res, 200, { email: existingUser.email }, "Email verified successfully");

};