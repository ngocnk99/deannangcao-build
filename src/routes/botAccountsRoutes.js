import { Router } from 'express';

import botAccountsController from '../controllers/botAccountsController';
import botAccountsValidate from '../validates/botAccountsValidate';

const router = Router();

router.get('/', botAccountsValidate.authenFilter, botAccountsController.get_list);
router.get('/:id', botAccountsController.get_one);
router.post('/', botAccountsValidate.authenCreate, botAccountsController.create);
router.post('/moveTrackedObject', botAccountsValidate.authenMoveTrackedObject, botAccountsController.moveTrackedObject);
router.put('/:id', botAccountsValidate.authenUpdate, botAccountsController.update);
router.put('/update-status/:id', botAccountsValidate.authenUpdate_status, botAccountsController.update_status);

export default router;
