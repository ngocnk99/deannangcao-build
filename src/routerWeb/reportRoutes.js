import { Router } from 'express';

import reportValidate from '../validates/reportValidate';
import reportController from '../controllers/reportController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.post("/statistics", reportValidate.statistics, reportController.statistics)
router.post("/statistics/export", reportValidate.statistics, reportController.statisticsExport)
export default router;