import { Router } from 'express';
import zaloController from '../controllers/zaloController';
const router = Router();

router.post("/sendText", zaloController.sendText);
router.get("/getInfoOa", zaloController.getInfoOa);

export default router;
