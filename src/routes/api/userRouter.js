import express from 'express';
import { index, store, show, update, destroy } from '../../controllers/userController.js'
import { authMiddleware } from '../../middleware/authMiddleware.js';

import { registerSchema, updateProfileSchema } from "../../validations/validatorSchema.js";
import { validate } from '../../middleware/validatorMiddleware.js'




const router = express.Router();


router.get('/', authMiddleware, index );

router.post('/', authMiddleware, validate(registerSchema), store );

router.get('/:id', authMiddleware, show );

router.put('/:id', authMiddleware, validate(updateProfileSchema), update );

router.delete('/:id', authMiddleware, destroy );




export default router;