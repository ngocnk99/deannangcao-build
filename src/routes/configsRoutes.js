import { Router } from 'express';

import configsValidate from '../validates/configsValidate';
import configsController from '../controllers/configsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', configsValidate.authenFilter, configsController.get_list);
router.get('/:id', configsController.get_one);
router.post('/', configsValidate.authenCreate, configsController.create);
router.put('/:id', configsValidate.authenUpdate, configsController.update);
router.put('/update-status/:id', configsValidate.authenUpdate_status, configsController.update_status);
// router.delete("/:id", groupUserController.delete)
// router.get("/get/all",configsValidate.authenFilter, configsController.get_all)

export default router;
