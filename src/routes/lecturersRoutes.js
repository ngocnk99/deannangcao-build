import { Router } from 'express';

import lecturersController from '../controllers/lecturersController';
import lecturersValidate from '../validates/lecturersValidate';

const router = Router();

router.get('/', lecturersValidate.authenFilter, lecturersController.get_list);
router.get('/:id', lecturersController.get_one);
router.post('/', lecturersValidate.authenCreate, lecturersController.create);
router.put('/:id', lecturersValidate.authenUpdate, lecturersController.update);
router.put('/update-status/:id', lecturersValidate.authenUpdate_status, lecturersController.update_status);

export default router;
