import { Router } from 'express';

import botTypeOfTrackedObjectController from '../controllers/botTypeOfTrackedObjectController';
import botTypeOfTrackedObjectValidate from '../validates/botTypeOfTrackedObjectValidate';

const router = Router();

router.get('/', botTypeOfTrackedObjectValidate.authenFilter, botTypeOfTrackedObjectController.get_list);
router.get('/:id', botTypeOfTrackedObjectController.get_one);
router.post('/', botTypeOfTrackedObjectValidate.authenCreate, botTypeOfTrackedObjectController.create);
router.put('/:id', botTypeOfTrackedObjectValidate.authenUpdate, botTypeOfTrackedObjectController.update);
router.put(
  '/update-status/:id',
  botTypeOfTrackedObjectValidate.authenUpdate_status,
  botTypeOfTrackedObjectController.update_status
);

export default router;
