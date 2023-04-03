import { Router } from 'express';

import reportValidate from '../validates/reportValidate';
import reportController from '../controllers/reportController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.post("/statistics", reportValidate.statistics, reportController.statistics)
router.post("/statistics/export", reportValidate.statistics, reportController.statisticsExport)
router.post("/find/dashboard", reportValidate.dashboard_All_Provinces, reportController.dashboards)
router.post("/dashboard/news", reportValidate.dashboardNews, reportController.dashboardsNews)
export default router;