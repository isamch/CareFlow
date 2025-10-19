// import dotenv from 'dotenv';
// dotenv.config();

// // dynamic import
// const { default: app } = await import('./app.js');




// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


import app from './app.js'
import dotenv from 'dotenv'
import connectDB from './src/config/db.js'

// Load env vars
dotenv.config()

// Connect to database
connectDB()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})