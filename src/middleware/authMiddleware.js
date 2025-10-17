import { json } from "express";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {

  
  if (req.originalUrl === '/api/auth/logout') {
    return next();
  }



  let token;

  if (req.headers.client === "not-browser" && req.headers.authorization) {
    token = req.headers.authorization;
  } else if (req.cookies?.Authorization) {
    token = req.cookies.Authorization;
  }

  // return res.json({
  //   token: token
  // });


  if (!token) {
    throw { message: "Unauthorized: Token not found", statusCode: 403 };
  }


  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  const jwtVerified = verifyToken(token);


  if (!jwtVerified) {
    throw { message: "Invalid or expired token", statusCode: 401 };
  }

  req.user = jwtVerified;

  next();

};
