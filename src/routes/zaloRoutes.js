import { Router } from 'express';
import zaloController from '../controllers/zaloController';
const router = Router();

router.post("/sendText", zaloController.sendText);
router.post("/getInfoOa", zaloController.getInfoOa);
router.get("/statistic/:id", zaloController.getStatistics);

export default router;
