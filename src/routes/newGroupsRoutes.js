import { Router } from 'express';

import newGroupsValidate from '../validates/newGroupsValidate';
import newGroupsController from '../controllers/newGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', newGroupsValidate.authenFilter, newGroupsController.get_list);
router.get('/:id', newGroupsController.get_one);
router.post('/', newGroupsValidate.authenCreate, newGroupsController.create);
router.put('/:id', newGroupsValidate.authenUpdate, newGroupsController.update);
router.put('/update-status/:id', newGroupsValidate.authenUpdate_status, newGroupsController.update_status);

export default router;
