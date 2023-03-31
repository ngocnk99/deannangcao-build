import { Router } from 'express';

import mapsValidate from '../validates/mapsValidate';
import mapsController from '../controllers/mapsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", mapsValidate.authenFilter, mapsController.get_list)
router.get("/:id", mapsController.get_one)
router.post("/", mapsValidate.authenCreate, mapsController.create)
router.put("/:id", mapsValidate.authenUpdate, mapsController.update)
router.put("/update-status/:id", mapsValidate.authenUpdate_status, mapsController.update_status)

export default router;

