import { Router } from 'express';

import botAccountsController from '../controllers/witaiController';

const router = Router();

router.get('/intents', botAccountsController.get_all_intents);
router.get('/intents/:name', botAccountsController.get_one_intents);
router.post('/intents', botAccountsController.create_intents);
router.put('/intents/addEntities/:name', botAccountsController.addEntitiesToIntents);
router.delete('/intents/:name', botAccountsController.delete_intents);

router.get('/entities', botAccountsController.get_all_entities);
router.get('/entities/:name', botAccountsController.get_one_entities);
router.post('/entities', botAccountsController.create_entities);
router.put('/entities/:name', botAccountsController.update_entities);
router.delete('/entities/:name', botAccountsController.delete_entities);
router.post('/train', botAccountsController.train);
router.delete('/train', botAccountsController.delete_train);
router.get('/train', botAccountsController.get_all_train);
export default router;
