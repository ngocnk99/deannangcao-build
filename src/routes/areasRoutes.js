import { Router } from 'express';

import areasValidate from '../validates/areasValidate';
import areasController from '../controllers/areasController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", areasValidate.authenFilter, areasController.get_list)
router.get("/multi/array", areasValidate.authen_GetAll, areasController.get_list_multi)
router.get("/:id", areasController.get_one)
router.post("/", areasValidate.authenCreate, areasController.create)
router.put("/:id", areasValidate.authenUpdate, areasController.update)
router.put("/update-status/:id", areasValidate.authenUpdate_status, areasController.update_status)

export default router;

