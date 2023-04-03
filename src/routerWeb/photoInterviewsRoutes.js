import { Router } from 'express';

import photoInterviewsController from '../controllers/photoInterviewsController';
import photoInterviewsValidate from '../validates/photoInterviewsValidate';

const router = Router();

router.get('/', photoInterviewsValidate.authenFilter, photoInterviewsController.get_list);
router.get('/:id', photoInterviewsController.get_one);

export default router;
