import { Router } from 'express';

import contentReviewsValidate from '../validates/contentReviewsValidate';
import contentReviewsController from '../controllers/contentReviewsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", contentReviewsValidate.authenFilter, contentReviewsController.get_list)
router.get("/:id", contentReviewsController.get_one)
router.put("/update-status/:id", contentReviewsValidate.authenUpdate_status, contentReviewsController.update_status)
router.delete("/", contentReviewsValidate.authenDelete, contentReviewsController.bulkRemove)

export default router;

