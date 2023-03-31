import { Router } from 'express';

import newspapersController from '../controllers/newspapersController';
import newspapersValidate from '../validates/newspapersValidate';

const router = Router();

router.get("/", newspapersValidate.authenFilter, newspapersController.get_list)
router.get("/:id", newspapersController.get_one)

export default router;

