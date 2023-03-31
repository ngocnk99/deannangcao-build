import { Router } from 'express';

import communicationProductsGroupsValidate from '../validates/communicationProductsGroupsValidate';
import communicationProductsGroupsController from '../controllers/communicationProductsGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", communicationProductsGroupsValidate.authenFilter, communicationProductsGroupsController.get_list)
router.get("/:id", communicationProductsGroupsController.get_one)
router.post("/", communicationProductsGroupsValidate.authenCreate, communicationProductsGroupsController.create)
router.put("/:id", communicationProductsGroupsValidate.authenUpdate, communicationProductsGroupsController.update)
router.put("/update-status/:id", communicationProductsGroupsValidate.authenUpdate_status, communicationProductsGroupsController.update_status)

export default router;

