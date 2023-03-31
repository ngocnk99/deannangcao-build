import { Router } from 'express';

import chatValidate from '../validates/chatValidate';
import chatController from '../controllers/chatController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/conversations', chatValidate.authenFilter, chatController.get_conversationsId);
router.get('/getRoomsChatId', chatController.get_roomschat_id);
export default router;
