import express from 'express';
import { registerController, loginController, logoutController, sendCodeVerifyEmail, VerifyCodeEmail } from '../../controllers/authController.js'
import { registerSchema, loginSchema } from "../../validations/validatorSchema.js";
import { validate } from '../../middleware/validatorMiddleware.js'

import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();



// register & login
router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/logout', authMiddleware, logoutController);


// email verify :
router.patch("/send-verification-code", authMiddleware, sendCodeVerifyEmail);
router.patch("/verify-verification-code", authMiddleware, VerifyCodeEmail);



router.get('/home', authMiddleware, (req, res) => {
  return res.json({
    message: "hello to home"
  });
});





export default router;