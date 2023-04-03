import { Router } from 'express';

import botTrackedObjectController from '../controllers/botTrackedObjectController';
import botTrackedObjectValidate from '../validates/botTrackedObjectValidate';

const router = Router();

router.get('/', botTrackedObjectValidate.authenFilter, botTrackedObjectController.get_list);
router.get('/:id', botTrackedObjectController.get_one);
router.post('/', botTrackedObjectValidate.authenCreate, botTrackedObjectController.create);
router.put('/:id', botTrackedObjectValidate.authenUpdate, botTrackedObjectController.update);
router.put(
  '/update-status/:id',
  botTrackedObjectValidate.authenUpdate_status,
  botTrackedObjectController.update_status
);

export default router;
