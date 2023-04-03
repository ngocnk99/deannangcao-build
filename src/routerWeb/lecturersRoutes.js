import { Router } from 'express';

import lecturersController from '../controllers/lecturersController';
import lecturersValidate from '../validates/lecturersValidate';

const router = Router();

router.get('/', lecturersValidate.authenFilter, lecturersController.get_list);
router.get('/:id', lecturersController.get_one);

export default router;
