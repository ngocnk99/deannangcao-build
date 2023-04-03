import { Router } from 'express';

import logSystemsValidate from '../validates/logSystemsValidate';
import logSystemsController from '../controllers/logSystemsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/",logSystemsValidate.authenFilter,  logSystemsController.get_list)
router.get("/:id", logSystemsController.get_one)

export default router;

