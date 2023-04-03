import { Router } from 'express';

import contentsValidate from '../validates/contentsValidate';
import contentsController from '../controllers/contentsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", contentsValidate.authenFilter, contentsController.get_list)
// router.get("/multi/array", contentsValidate.authen_GetAll, contentsController.get_list_multi)
router.get("/:id", contentsController.get_one_for_web)
router.post("/", contentsValidate.authenCreate, contentsController.create)
router.put("/:id", contentsValidate.authenUpdate, contentsController.update)
router.put("/update-shares/:id", contentsValidate.authenUpdateShares, contentsController.updateShares)
router.put("/update-status/:id", contentsValidate.authenUpdate_status, contentsController.update_status)

export default router;

