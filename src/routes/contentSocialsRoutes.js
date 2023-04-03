import { Router } from 'express';

import contentSocialsValidate from '../validates/contentSocialsValidate';
import contentSocialsController from '../controllers/contentSocialsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/v2', contentSocialsValidate.authenFilter, contentSocialsController.get_list_v2);
router.get('/v2/:id', contentSocialsController.get_one_v2);
router.get('/', contentSocialsValidate.authenFilter, contentSocialsController.get_list);
router.get('/:id', contentSocialsController.get_one);
router.post('/', contentSocialsValidate.authenCreate, contentSocialsController.create);
router.post('/updatePost/:id', contentSocialsController.updatePost);
router.delete('/deletePost/:id', contentSocialsController.deletePost);
router.put('/:id', contentSocialsValidate.authenUpdate, contentSocialsController.update);
router.put('/update-status/:id', contentSocialsValidate.authenUpdate_status, contentSocialsController.update_status);

export default router;
