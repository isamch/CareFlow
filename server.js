import dotenv from 'dotenv';
dotenv.config();

// dynamic import
const { default: app } = await import('./app.js');




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
