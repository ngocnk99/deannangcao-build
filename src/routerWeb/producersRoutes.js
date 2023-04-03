import { Router } from 'express';

import producersValidate from '../validates/producersValidate';
import producersController from '../controllers/producersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", producersValidate.authenFilter, producersController.get_list)
router.get("/:id", producersController.get_one)
router.post("/", producersValidate.authenCreate, producersController.create)
router.put("/:id", producersValidate.authenUpdate, producersController.update)
router.put("/update-status/:id", producersValidate.authenUpdate_status, producersController.update_status)

export default router;

