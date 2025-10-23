import express from 'express'
import apiRoutes from './api.js'

const router = express.Router()

router.use('/api/v1', apiRoutes)

export default router