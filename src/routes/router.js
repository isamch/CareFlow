import express from 'express'
import apiRoutes from './api.js'

const router = express.Router()

// Mount all API routes under the /api/ prefix
router.use('/api', apiRoutes)

export default router