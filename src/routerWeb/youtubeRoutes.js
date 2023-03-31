import { Router } from 'express';

import youtubeController from '../controllers/youtubeController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", youtubeController.get_login_authen)
router.get("/get_code_authe_google", youtubeController.get_code_authe_google) // đón nhận code để lấy access_token
router.post("/create", youtubeController.create)
export default router;

