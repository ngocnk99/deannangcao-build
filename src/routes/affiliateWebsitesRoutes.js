import { Router } from 'express';

import affiliateWebsitesValidate from '../validates/affiliateWebsitesValidate'
import affiliateWebsitesController from '../controllers/affiliateWebsitesController'
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', affiliateWebsitesValidate.authenFilter, affiliateWebsitesController.get_list);
router.get('/:id', affiliateWebsitesController.get_one);
router.post('/', affiliateWebsitesValidate.authenCreate, affiliateWebsitesController.create);
router.put('/:id', affiliateWebsitesValidate.authenUpdate, affiliateWebsitesController.update);
router.put('/update-status/:id', affiliateWebsitesValidate.authenUpdate_status, affiliateWebsitesController.update_status);

export default router;
