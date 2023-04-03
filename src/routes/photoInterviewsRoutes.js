import { Router } from 'express';

import photoInterviewsController from '../controllers/photoInterviewsController';
import photoInterviewsValidate from '../validates/photoInterviewsValidate';

const router = Router();

router.get('/', photoInterviewsValidate.authenFilter, photoInterviewsController.get_list);
router.get('/:id', photoInterviewsController.get_one);
router.post('/', photoInterviewsValidate.authenCreate, photoInterviewsController.create);
router.put('/:id', photoInterviewsValidate.authenUpdate, photoInterviewsController.update);
router.put('/update-status/:id', photoInterviewsValidate.authenUpdate_status, photoInterviewsController.update_status);

export default router;
