import { Router } from 'express';

import targetAudiencesValidate from '../validates/targetAudiencesValidate';
import targetAudiencesController from '../controllers/targetAudiencesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", targetAudiencesValidate.authenFilter, targetAudiencesController.get_list)
router.get("/:id", targetAudiencesController.get_one)
router.post("/", targetAudiencesValidate.authenCreate, targetAudiencesController.create)
router.put("/:id", targetAudiencesValidate.authenUpdate, targetAudiencesController.update)
router.put("/update-status/:id", targetAudiencesValidate.authenUpdate_status, targetAudiencesController.update_status)

export default router;

