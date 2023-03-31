import { Router } from 'express';

import typeOfNewsController from '../controllers/typeOfNewsController';
import typeOfNewsValidate from '../validates/typeOfNewsValidate';

const router = Router();

router.get("/:id", typeOfNewsController.get_one)
router.post("/", typeOfNewsValidate.authenCreate, typeOfNewsController.create)
router.put("/update/list", typeOfNewsValidate.authenBulkUpdate, typeOfNewsController.bulkUpdate);
router.put("/:id", typeOfNewsValidate.authenUpdate,typeOfNewsController.update)
router.get("/find/list/parent-child", typeOfNewsValidate.authenFilter, typeOfNewsController.find_list_parentChild)
router.get("/find/list/parent-child-one", typeOfNewsValidate.authenFilter, typeOfNewsController.find_list_parent_child_one)
router.put("/update-status/:id", typeOfNewsValidate.authenUpdate_status, typeOfNewsController.update_status)
export default router;

