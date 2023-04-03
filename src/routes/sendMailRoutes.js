import { Router } from 'express';

import sendEmailController from '../controllers/sendEmailController';

const router = Router();

router.post("/Gmail", sendEmailController.sendGmail)

export default router;

