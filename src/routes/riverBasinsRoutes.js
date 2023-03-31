import { Router } from 'express';

import riverBasinsValidate from '../validates/riverBasinsValidate';
import riverBasinsController from '../controllers/riverBasinsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", riverBasinsValidate.authenFilter, riverBasinsController.get_list)
router.get("/multi/array", riverBasinsValidate.authen_GetAll, riverBasinsController.get_list_multi)
router.get("/:id", riverBasinsController.get_one)
router.post("/", riverBasinsValidate.authenCreate, riverBasinsController.create)
router.put("/:id", riverBasinsValidate.authenUpdate, riverBasinsController.update)
router.put("/update-status/:id", riverBasinsValidate.authenUpdate_status, riverBasinsController.update_status)

export default router;

