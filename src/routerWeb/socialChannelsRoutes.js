import { Router } from 'express';

import socialChannelsValidate from '../validates/socialChannelsValidate';
import socialChannelsController from '../controllers/socialChannelsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", socialChannelsValidate.authenFilter, socialChannelsController.get_list)
router.get("/:id", socialChannelsController.get_one)
router.post("/", socialChannelsValidate.authenCreate, socialChannelsController.create)
router.put("/:id", socialChannelsValidate.authenUpdate, socialChannelsController.update)
router.put("/update-status/:id", socialChannelsValidate.authenUpdate_status, socialChannelsController.update_status)

export default router;

