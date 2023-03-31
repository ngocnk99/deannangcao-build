import { Router } from 'express';

import contentSocialsStatisticValidate from '../validates/contentSocialsStatisticValidate';
import contentSocialsStatisticController from '../controllers/contentSocialsStatisticController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', contentSocialsStatisticValidate.authenFilter, contentSocialsStatisticController.get_list);
router.get('/:id', contentSocialsStatisticController.get_one);
router.post('/:id', contentSocialsStatisticController.createOrUpdate);
router.put(
  '/update-status/:id',
  contentSocialsStatisticValidate.authenUpdate_status,
  contentSocialsStatisticController.update_status
);

export default router;
