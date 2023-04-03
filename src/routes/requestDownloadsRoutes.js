import { Router } from 'express';

import requestDownloadsValidate from '../validates/requestDownloadsValidate';
import requestDownloadsController from '../controllers/requestDownloadsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", requestDownloadsValidate.authenFilter, requestDownloadsController.get_list)
router.get("/:id", requestDownloadsController.get_one)
router.post("/", requestDownloadsValidate.authenCreate, requestDownloadsController.create)
router.put("/:id", requestDownloadsValidate.authenUpdate, requestDownloadsController.update)
router.put("/update-status/:id", requestDownloadsValidate.authenUpdate_status, requestDownloadsController.update_status)

export default router;

