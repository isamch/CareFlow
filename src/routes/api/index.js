import authRouter from './authRouter';
import userRouter from './userRouter';


import express from 'express';
const router = express.Router();  

// mount auth router
router.use('/auth', authRouter);
// mount user router
router.use('/users', userRouter);



export default router;
