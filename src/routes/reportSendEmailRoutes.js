import { Router } from 'express';

import reportSendEmailValidate from '../validates/reportSendEmailValidate';
import reportSendEmailController from '../controllers/reportSendEmailController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", reportSendEmailValidate.authenFilter, reportSendEmailController.get_list)
router.get("/:id", reportSendEmailController.get_one)
router.post("/", reportSendEmailValidate.authenCreate, reportSendEmailController.create)

export default router;

