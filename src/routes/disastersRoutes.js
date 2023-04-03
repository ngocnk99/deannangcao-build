import { Router } from 'express';

import disastersValidate from '../validates/disastersValidate';
import disastersController from '../controllers/disastersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", disastersValidate.authenFilter, disastersController.get_list)
router.get("/getlist/export", disastersValidate.authenFilter, disastersController.get_list_export)
router.get("/dashboard", disastersValidate.authenDashboardFilter, disastersController.dashboard)
router.get("/vndms/dashboard", disastersValidate.authenDashboardFilter, disastersController.dashboardVndms)
router.get("/:id", disastersController.get_one)
router.post("/", disastersValidate.authenCreate, disastersController.create)
router.post("/createOrUpdate", disastersValidate.authenCreate, disastersController.createOrUpdate)
router.put("/:id", disastersValidate.authenUpdate, disastersController.update)
router.put("/update-status/:id", disastersValidate.authenUpdate_status, disastersController.update_status)
export default router;