import { Router } from 'express';

import disastersValidate from '../validates/disastersValidate';
import disastersController from '../controllers/disastersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", disastersValidate.authenFilter, disastersController.get_list)
router.get("/getlist/export", disastersValidate.authenFilter, disastersController.get_list_export)
router.get("/dashboard", disastersValidate.authenDashboardPublicFilter, disastersController.dashboard)
router.get("/:id", disastersController.get_one)
router.post("/", disastersValidate.authenCreate, disastersController.create)
router.put("/:id", disastersValidate.authenUpdate, disastersController.update)
router.put("/update-status/:id", disastersValidate.authenUpdate_status, disastersController.update_status)
export default router;