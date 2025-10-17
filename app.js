import express from 'express';

// import helpers :
import * as viewHelpers from "./src/utils/viewHelpers.js";

// import routes :
import router from './src/routes/api/index.js';

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


// connect db
await connectDB();


// API routes:
app.use('/api', router);


// finales middlewares:
app.use(errorHandler);


export default app;