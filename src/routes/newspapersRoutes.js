import { Router } from 'express';

import newspapersController from '../controllers/newspapersController';
import newspapersValidate from '../validates/newspapersValidate';

const router = Router();

router.get("/", newspapersValidate.authenFilter, newspapersController.get_list)
router.get("/:id", newspapersController.get_one)
router.post("/", newspapersValidate.authenCreate, newspapersController.create)
router.put("/:id",newspapersValidate.authenUpdate, newspapersController.update)
router.put("/update-status/:id", newspapersValidate.authenUpdate_status, newspapersController.update_status)

export default router;

