import { Router } from 'express';

import newsController from '../controllers/newsController';
import newsValidate from '../validates/newsValidate';

const router = Router();

router.get("/", newsValidate.authenFilter, newsController.get_list)
router.get("/:id", newsController.get_one)
router.post("/", newsValidate.authenCreate, newsController.create)
router.put("/:id",newsValidate.authenUpdate, newsController.update)
router.put("/update-status/:id", newsValidate.authenUpdate_status, newsController.update_status)

export default router;

