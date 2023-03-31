import { Router } from 'express';

import crawlerdatagisController from '../controllers/crawlerdatagisController'
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get("/", crawlerdatagisController.crawlerProvinces)
router.get("/Districts", crawlerdatagisController.crawlerDistricts)
router.get("/Wards", crawlerdatagisController.crawlerWards)
router.get("/riverBasins", crawlerdatagisController.crawlerRiverBasins)


export default router;