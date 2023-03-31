import { Router } from 'express';

import mailsController from '../controllers/mailsController';
import mailsValidate from '../validates/mailsValidate';

const router = Router();

router.get('/', mailsValidate.authenFilter, mailsController.get_list);
router.get('/nguoiNhan', mailsController.get_list_user_nhan);
router.get('/nguoiGui', mailsController.get_list_user_gui);
router.get('/:id', mailsController.get_one);
router.post('/', mailsValidate.authenCreate, mailsController.create);
router.put('/:id', mailsController.update);
router.put('/update-status/:id', mailsValidate.authenUpdate_status, mailsController.update_status);

export default router;
