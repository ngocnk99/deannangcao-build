import { Router } from 'express';

import vndmsExplorersValidate from '../validates/vndmsExplorersValidate';
import explorersController from '../controllers/explorersController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/",vndmsExplorersValidate.authenFilter, explorersController.getlist_vndms)
router.post("/",vndmsExplorersValidate.findExplorersByDisastersId, explorersController.findExplorersByDisastersId)
export default router;