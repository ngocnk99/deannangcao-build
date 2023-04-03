import { Router } from 'express';

import explorersValidate from '../validates/explorersValidate';
import explorersController from '../controllers/explorersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", explorersValidate.authenFilter, explorersController.get_list)
router.get("/getlist/export", explorersValidate.authenFilter, explorersController.get_list_export)
router.get("/:id", explorersController.get_one)
router.post("/", explorersValidate.authenCreate, explorersController.create)
router.put("/:id", explorersValidate.authenUpdate, explorersController.update)
router.put("/update-status/:id", explorersValidate.authenUpdate_status, explorersController.update_status)
router.post("/find/findPointsInMultiPolygons", explorersValidate.authenfindPointsInMultiPolygons, explorersController.findPointsInMultiPolygons)
router.post("/find/findPointsInCircle", explorersValidate.authenfindfindPointsInCircle, explorersController.findPointsInCircle)
router.post("/find/findPointsInMultiPolygons_ver2", explorersValidate.authenfindPointsInMultiPolygons_ver2, explorersController.findPointsInMultiPolygons_ver1)
router.post("/find/dashboard", explorersValidate.dashboard_All_Provinces, explorersController.dashboards)
export default router;
