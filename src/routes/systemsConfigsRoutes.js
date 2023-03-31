import { Router } from 'express';
import systemsConfigsValidate from '../validates/systemsConfigsValidate';
import systemsConfigsController from '../controllers/systemsConfigsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/:id", systemsConfigsController.get_one)
router.post("/", systemsConfigsValidate.authenCreateOrUpdate,systemsConfigsController.createOrUpdate)
// router.put("/:id", provincesValidate.authenUpdate, provincesController.update)
// router.put("/update-status/:id", provincesValidate.authenUpdate_status, provincesController.update_status)

export default router;

