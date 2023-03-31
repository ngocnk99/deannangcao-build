import { Router } from 'express';

import newGroupsValidate from '../validates/newGroupsValidate';
import newGroupsController from '../controllers/newGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', newGroupsValidate.authenFilter, newGroupsController.get_list);
router.get('/:id', newGroupsController.get_one);

export default router;
