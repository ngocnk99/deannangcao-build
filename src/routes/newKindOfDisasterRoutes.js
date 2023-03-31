import { Router } from 'express';

import newKindOfDisasterController from '../controllers/newKindOfDisasterController';
import newKindOfDisasterValidate from '../validates/newKindOfDisasterValidate';

const router = Router();

router.get('/', newKindOfDisasterValidate.authenFilter, newKindOfDisasterController.get_list);
router.get('/:id', newKindOfDisasterController.get_one);
router.delete('/:id', newKindOfDisasterController.delete);
router.post('/', newKindOfDisasterValidate.authenCreate, newKindOfDisasterController.create);
router.put('/:id', newKindOfDisasterValidate.authenUpdate, newKindOfDisasterController.update);

export default router;
