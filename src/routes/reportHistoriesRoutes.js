import { Router } from 'express';

import reportHistoriesValidate from '../validates/reportHistoriesValidate';
import reportHistoriesController from '../controllers/reportHistoriesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", reportHistoriesValidate.authenFilter, reportHistoriesController.get_list)
router.get("/:id", reportHistoriesController.get_one)
router.post("/", reportHistoriesValidate.authenCreate, reportHistoriesController.create)
router.put("/:id", reportHistoriesValidate.authenUpdate, reportHistoriesController.update)
router.put("/update-status/:id", reportHistoriesValidate.authenUpdate_status, reportHistoriesController.update_status)

export default router;

