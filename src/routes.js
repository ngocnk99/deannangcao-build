import { Router } from 'express';

import swaggerSpec from './utils/swagger';

import currentUserRoutes from './routes/currentUserRoutes';
import usersRoutes from './routes/usersRoutes';
import menusRoutes from './routes/menusRoutes';
import userGroupsRoutes from './routes/userGroupsRoutes';
import districtsRoutes from './routes/districtsRoutes';
import provincesRoutes from './routes/provincesRoutes';
import wardsRoutes from './routes/wardsRoutes';
import userGroupRolesRoutes from './routes/userGroupRolesRoutes';
import areasRoutes from './routes/areasRoutes';
import disasterGroupsRoutes from './routes/disasterGroupsRoutes';
import disastersRoutes from './routes/disastersRoutes';
import explorersRoutes from './routes/explorersRoutes';
import sendMailRoutes from './routes/sendMailRoutes';
import tokenRoutes from './routes/tokenRoutes';
import systemsConfigsRoutes from './routes/systemsConfigsRoutes';
import crawlerdatagis from './routes/crawlerdatagis';
import requestDownloadsRoutes from './routes/requestDownloadsRoutes';
import riverBasinsRoutes from './routes/riverBasinsRoutes';
import reportRoutes from './routes/reportRoutes';
import logSystemsRoutes from './routes/logSystemsRoutes';
import vndmsExplorersRoutes from './routes/vndmsExplorersRoutes';
import explorerGroupsRoutes from './routes/explorerGroupsRoutes';
import mapsRoutes from './routes/mapsRoutes';
import producersRoutes from './routes/producersRoutes';
import targetAudiencesRoutes from './routes/targetAudiencesRoutes';
import communicationProductsGroupsRoutes from './routes/communicationProductsGroupsRoutes';
import phasesOfDisastersRoutes from './routes/phasesOfDisastersRoutes';
import facebookRoutes from './routes/facebookRoutes';
import zaloRoutes from './routes/zaloRoutes';
import contentsRoutes from './routes/contentsRoutes';
import socialsRoutes from './routes/socialsRoutes';
import socialChannelsRoutes from './routes/socialChannelsRoutes';
import contentSocialsRoutes from './routes/contentSocialsRoutes';
import youtubeRoutes from './routes/youtubeRoutes';
import mailsRoutes from './routes/mailsRoutes';
import newsRoutes from './routes/newsRoutes';
import chatRoutes from './routes/chatRoutes';
import newspapersRoutes from './routes/newspapersRoutes';
import contentReviewsRoutes from './routes/contentReviewsRoutes';
import configsRoutes from './routes/configsRoutes';
import typeOfNewsRoutes from './routes/typeOfNewsRoutes';
import reportHistoriesRoutes from './routes/reportHistoriesRoutes';
import reportSendEmailRoutes from './routes/reportSendEmailRoutes';
import botTypeOfPostsRoutes from './routes/botTypeOfPostsRoutes';
import botPostsRoutes from './routes/botPostsRoutes';
import botTrackedObjectRoutes from './routes/botTrackedObjectRoutes';
import botAccountsRoutes from './routes/botAccountsRoutes';
import botTypeOfTrackedObjectRoutes from './routes/botTypeOfTrackedObjectRoutes';
import contentSocialsStatisticRoutes from './routes/contentSocialsStatisticRoutes';
import witaiRoutes from './routes/witaiRoutes';
import newKindOfDisasterRoutes from './routes/newKindOfDisasterRoutes';
import newGroupsRoutes from './routes/newGroupsRoutes';

import affiliateWebsitesRoutes from './routes/affiliateWebsitesRoutes';
import questionsRoutes from './routes/questionsRoutes';
import lecturersRoutes from './routes/lecturersRoutes';
import photoInterviewsRoutes from './routes/photoInterviewsRoutes';

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
router.use('/c/chat', chatRoutes);
router.use('/c/newspapers', newspapersRoutes);
router.use('/c/contentReviews', contentReviewsRoutes);
router.use('/c/configs', configsRoutes);
router.use('/c/typeOfNews', typeOfNewsRoutes);
router.use('/c/reportHistories', reportHistoriesRoutes);
router.use('/c/reportSendEmail', reportSendEmailRoutes);
router.use('/c/botTypeOfPosts', botTypeOfPostsRoutes);
router.use('/c/botPosts', botPostsRoutes);
router.use('/c/botTrackedObject', botTrackedObjectRoutes);
router.use('/c/botAccounts', botAccountsRoutes);
router.use('/c/botTypeOfTrackedObject', botTypeOfTrackedObjectRoutes);
router.use('/c/contentSocialsStatistic', contentSocialsStatisticRoutes);
router.use('/c/witai', witaiRoutes);
router.use('/c/newKindOfDisaster', newKindOfDisasterRoutes);
router.use('/c/newGroups', newGroupsRoutes);
router.use('/c/questions', questionsRoutes);
router.use('/c/lecturers', lecturersRoutes);
router.use('/c/photoInterviews', photoInterviewsRoutes);
router.use('/c/affiliateWebsites', affiliateWebsitesRoutes);

export default router;
