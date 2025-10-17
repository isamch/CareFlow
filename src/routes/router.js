import express from 'express'

const router = express.Router();




router.get('/', (req, res)=>{
  return res.json({
    message: 'welcome home'
  });
});






export default router;