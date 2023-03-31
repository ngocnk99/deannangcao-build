import { Router } from 'express';

import botPostsController from '../controllers/botPostsController';
import botPostsValidate from '../validates/botPostsValidate';

const router = Router();

router.get('/', botPostsValidate.authenFilter, botPostsController.get_list);
router.get('/:id', botPostsController.get_one);
// router.post('/', botPostsValidate.authenCreate, botPostsController.create);
router.put('/:id', botPostsValidate.authenUpdate, botPostsController.update);
router.put('/update-status/:id', botPostsValidate.authenUpdate_status, botPostsController.update_status);

export default router;
