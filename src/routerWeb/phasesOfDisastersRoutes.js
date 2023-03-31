import { Router } from 'express';

import phasesOfDisastersValidate from '../validates/phasesOfDisastersValidate';
import phasesOfDisastersController from '../controllers/phasesOfDisastersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", phasesOfDisastersValidate.authenFilter, phasesOfDisastersController.get_list)
router.get("/:id", phasesOfDisastersController.get_one)
router.post("/", phasesOfDisastersValidate.authenCreate, phasesOfDisastersController.create)
router.put("/:id", phasesOfDisastersValidate.authenUpdate, phasesOfDisastersController.update)
router.put("/update-status/:id", phasesOfDisastersValidate.authenUpdate_status, phasesOfDisastersController.update_status)

export default router;

