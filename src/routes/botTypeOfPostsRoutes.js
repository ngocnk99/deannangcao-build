import { Router } from 'express';

import botTypeOfPostsController from '../controllers/botTypeOfPostsController';
import botTypeOfPostsValidate from '../validates/botTypeOfPostsValidate';

const router = Router();

router.get('/:id', botTypeOfPostsController.get_one);
router.post('/', botTypeOfPostsValidate.authenCreate, botTypeOfPostsController.create);
router.put('/:id', botTypeOfPostsValidate.authenUpdate, botTypeOfPostsController.update);
router.get(
  '/find/list/parent-child',
  botTypeOfPostsValidate.authenFilter,
  botTypeOfPostsController.find_list_parentChild
);
router.get(
  '/find/list/parent-child-one',
  botTypeOfPostsValidate.authenFilter,
  botTypeOfPostsController.find_list_parent_child_one
);
router.put('/update-status/:id', botTypeOfPostsValidate.authenUpdate_status, botTypeOfPostsController.update_status);
export default router;
