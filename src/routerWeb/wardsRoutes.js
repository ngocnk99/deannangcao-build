import { Router } from 'express';

import wardsValidate from '../validates/wardsValidate';
import wardsController from '../controllers/wardsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", wardsValidate.authenFilter, wardsController.get_list)
router.get("/multi/array", wardsValidate.authen_GetAll, wardsController.get_list_multi)
router.get("/:id", wardsController.get_one)
router.post("/", wardsValidate.authenCreate, wardsController.create)
router.put("/:id", wardsValidate.authenUpdate, wardsController.update)
router.put("/update-status/:id", wardsValidate.authenUpdate_status, wardsController.update_status)
export default router;

