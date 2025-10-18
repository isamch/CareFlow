import authRouter from './authRouter.js';
import userRouter from './userRouter.js';


import express from 'express';
const router = express.Router();  

// mount auth router
router.use('/auth', authRouter);
// mount user router
router.use('/users', userRouter);



export default router;
