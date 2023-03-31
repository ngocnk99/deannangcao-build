import { Router } from 'express';

import explorerGroupsValidate from '../validates/explorerGroupsValidate';
import explorerGroupsController from '../controllers/explorerGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", explorerGroupsValidate.authenFilter, explorerGroupsController.get_list)
router.get("/:id", explorerGroupsController.get_one)
router.post("/", explorerGroupsValidate.authenCreate, explorerGroupsController.create)
router.put("/:id", explorerGroupsValidate.authenUpdate, explorerGroupsController.update)
router.put("/update-status/:id", explorerGroupsValidate.authenUpdate_status, explorerGroupsController.update_status)


export default router;

