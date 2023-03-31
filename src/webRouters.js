import { Router } from 'express';

import swaggerSpec from './utils/swagger';

import currentUserRoutes from './routerWeb/currentUserRoutes';
import usersRoutes from './routerWeb/usersRoutes';
import menusRoutes from './routerWeb/menusRoutes';
import userGroupsRoutes from './routerWeb/userGroupsRoutes';
import districtsRoutes from './routerWeb/districtsRoutes';
import provincesRoutes from './routerWeb/provincesRoutes';
import wardsRoutes from './routerWeb/wardsRoutes';
import userGroupRolesRoutes from './routerWeb/userGroupRolesRoutes';
import areasRoutes from './routerWeb/areasRoutes';
import disasterGroupsRoutes from './routerWeb/disasterGroupsRoutes';
import disastersRoutes from './routerWeb/disastersRoutes';
import explorersRoutes from './routerWeb/explorersRoutes';
import sendMailRoutes from './routerWeb/sendMailRoutes';
import tokenRoutes from './routerWeb/tokenRoutes';
import systemsConfigsRoutes from './routerWeb/systemsConfigsRoutes';
import crawlerdatagis from './routerWeb/crawlerdatagis';
import requestDownloadsRoutes from './routerWeb/requestDownloadsRoutes';
import riverBasinsRoutes from './routerWeb/riverBasinsRoutes';
import reportRoutes from './routerWeb/reportRoutes';
import logSystemsRoutes from './routerWeb/logSystemsRoutes';
import vndmsExplorersRoutes from './routerWeb/vndmsExplorersRoutes';
import explorerGroupsRoutes from './routerWeb/explorerGroupsRoutes';
import mapsRoutes from './routerWeb/mapsRoutes';
import producersRoutes from './routerWeb/producersRoutes';
import targetAudiencesRoutes from './routerWeb/targetAudiencesRoutes';
import communicationProductsGroupsRoutes from './routerWeb/communicationProductsGroupsRoutes';
import phasesOfDisastersRoutes from './routerWeb/phasesOfDisastersRoutes';
import facebookRoutes from './routerWeb/facebookRoutes';
import zaloRoutes from './routerWeb/zaloRoutes';
import contentsRoutes from './routerWeb/contentsRoutes';
import socialsRoutes from './routerWeb/socialsRoutes';
import socialChannelsRoutes from './routerWeb/socialChannelsRoutes';
import contentSocialsRoutes from './routerWeb/contentSocialsRoutes';
import youtubeRoutes from './routerWeb/youtubeRoutes';
import mailsRoutes from './routerWeb/mailsRoutes';
import newsRoutes from './routerWeb/newsRoutes';
import newspapersRoutes from './routerWeb/newspapersRoutes';
import contentReviewsRoutes from './routerWeb/contentReviewsRoutes';
import newGroupsRoutes from './routerWeb/newGroupsRoutes';

/**
 * Contains all API routes for the application.
 */
const router = Router();

/**
 * GET /swagger.json
 */
router.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

/**
 * GET /api
 */
router.get('/', (req, res) => {
  res.json({
    app: req.app.locals.title,
    apiVersion: req.app.locals.version
  });
});

router.use('/c/currentUser', currentUserRoutes);
router.use('/c/users', usersRoutes);
router.use('/c/menus', menusRoutes);
router.use('/c/userGroups', userGroupsRoutes);
router.use('/c/districts', districtsRoutes);
router.use('/c/provinces', provincesRoutes);
router.use('/c/wards', wardsRoutes);
router.use('/c/userGroupRoles', userGroupRolesRoutes);
router.use('/c/areas', areasRoutes);
router.use('/c/disasterGroups', disasterGroupsRoutes);
router.use('/c/disasters', disastersRoutes);
router.use('/c/explorers', explorersRoutes);
router.use('/c/sendMail', sendMailRoutes);
router.use('/c/token', tokenRoutes);
router.use('/c/systemsConfigs', systemsConfigsRoutes);
router.use('/c/crawlerdatagis', crawlerdatagis);
router.use('/c/requestDownloads', requestDownloadsRoutes);
router.use('/c/riverBasins', riverBasinsRoutes);
router.use('/c/report', reportRoutes);
router.use('/c/logSystems', logSystemsRoutes);
router.use('/find/vndmsExplorers', vndmsExplorersRoutes);
router.use('/c/explorerGroups', explorerGroupsRoutes);
router.use('/c/maps', mapsRoutes);
router.use('/c/producers', producersRoutes);
router.use('/c/targetAudiences', targetAudiencesRoutes);
router.use('/c/communicationProductsGroups', communicationProductsGroupsRoutes);
router.use('/c/phasesOfDisasters', phasesOfDisastersRoutes);
router.use('/c/facebooks', facebookRoutes);
router.use('/c/zalo', zaloRoutes);
router.use('/c/contents', contentsRoutes);
router.use('/c/socials', socialsRoutes);
router.use('/c/socialChannels', socialChannelsRoutes);
router.use('/c/contentSocials', contentSocialsRoutes);
router.use('/c/youtube', youtubeRoutes);
router.use('/c/mails', mailsRoutes);
router.use('/c/news', newsRoutes);
router.use('/c/newspapers', newspapersRoutes);
router.use('/c/contentReviews', contentReviewsRoutes);
router.use('/c/newGroups', newGroupsRoutes);

export default router;
