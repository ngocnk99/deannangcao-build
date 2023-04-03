import { Router } from 'express';

import contentReviewsValidate from '../validates/contentReviewsValidate';
import contentReviewsController from '../controllers/contentReviewsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.post("/", contentReviewsValidate.authenCreate, contentReviewsController.create)
router.get("/", contentReviewsValidate.authenFilter, contentReviewsController.get_list_for_web)

export default router;

