import express from 'express';

// import helpers :
import * as viewHelpers from "./src/utils/viewHelpers.js";

// import routes :
import router from './src/routes/router.js';
import authRouter from './src/routes/api/authRouter.js';
import userRouter from './src/routes/api/userRouter.js';
import webRouter from './src/routes/web/index.js';


// import db:
import connectDB from './src/config/db.js';

// import middlewares:
import errorHandler from './src/middleware/errorHandler.js';

// others :
import cookieParser from "cookie-parser";
import cors from 'cors';
import helmet from 'helmet';



const app = express(); // create instance app from express function factory

// set view helpers :
app.locals.helpers = viewHelpers;

// middleware: parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookies parser
app.use(cookieParser());

// others :
app.use(cors());
app.use(helmet());


// Configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', './src/view');


// connect db
await connectDB();


// router :
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);


// mount web router (EJS views)
app.use('/', webRouter);




// finales middlewares:
app.use(errorHandler); 


export default app;