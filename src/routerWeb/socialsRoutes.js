import { Router } from 'express';

import socialsValidate from '../validates/socialsValidate';
import socialsController from '../controllers/socialsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", socialsValidate.authenFilter, socialsController.get_list)
router.get("/:id", socialsController.get_one)
router.post("/", socialsValidate.authenCreate, socialsController.create)
router.put("/:id", socialsValidate.authenUpdate, socialsController.update)
router.put("/update-status/:id", socialsValidate.authenUpdate_status, socialsController.update_status)

export default router;

