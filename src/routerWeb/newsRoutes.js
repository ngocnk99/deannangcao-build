import { Router } from 'express';

import newsController from '../controllers/newsController';
import newsValidate from '../validates/newsValidate';

const router = Router();

router.get("/", newsValidate.authenFilter, newsController.get_list_for_web)
router.get("/:id", newsController.get_one)
router.post("/", newsValidate.authenCreate, newsController.create)
router.put("/:id",newsValidate.authenUpdate, newsController.update)
export default router;

