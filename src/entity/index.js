/* eslint-disable global-require */
import { Sequelize } from 'sequelize';
// import fs from 'fs';
// import path from 'path';
import associate from './references';
import { sequelize } from '../db/db';
import CachedRedis from '../db/myRedis';
import CONFIG from '../config';

// const basename = path.basename(__filename)
// const env = process.env.NODE_ENV || 'development'
const models = {};

/* fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join("./../src/models", file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}); */

const modules = [
  require('./userGroups'),
  require('./menus'),
  require('./provinces'),
  require('./users'),
  require('./wards'),
  require('./districts'),
  require('./userGroupRoles'),
  require('./areas'),
  require('./areasProvinces'),
  require('./disasterGroups'),
  require('./disasters'),
  require('./explorers'),
  require('./systemsConfigs'),
  require('./requestDownloads'),
  require('./riverBasins'),
  require('./explorerGroups'),
  require('./maps'),
  require('./producers'),
  require('./targetAudiences'),
  require('./communicationProductsGroups'),
  require('./phasesOfDisasters'),
  require('./contents'),
  require('./contentAreas'),
  require('./contentDisasterGroups'),
  require('./contentTargetAudiences'),
  require('./socials'),
  require('./socialChanels'),
  require('./contentSocials'),
  require('./contentSocialRelations'),
  require('./mails'),
  require('./receivers'),
  require('./news'),
  require('./newspapers'),
  require('./disastersContents'),
  require('./newsUrlSlug'),
  require('./contentReviews'),
  require('./disastersNews'),
  require('./configs'),
  require('./newsTypeOfNews'),
  require('./reports'),
  require('./typeOfNews'),
  require('./reportSendEmail'),
  require('./reportsNews'),
  require('./botAccounts'),
  require('./botPosts'),
  require('./botPostsTypeOfPosts'),
  require('./botTrackedObject'),
  require('./botTypeOfPosts'),
  require('./botTypeOfTrackedObject'),
  require('./disasterSocialRelations'),
  require('./contentSocialsStatistic'),
  require('./roomChatsUsers'),
  require('./roomChats'),
  require('./chatMessages'),
  require('./mailsUsers'),
  require('./roomMails'),
  require('./newKindOfDisaster')
];

// Initialize models
modules.forEach(module => {
  const model = module(sequelize, Sequelize);

  console.log('model name ', model.name);
  models[model.name] = model;
});
// console.log("models db: ", db)

associate(models);
/* Object.keys(models).forEach(function (modelName) {
  // console.log("modelName: ", modelName)
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
}); */

if (CONFIG['CACHED_DB_RESDIS'] === 'true') {
  // for (const model of models) {
  for (let index = 0; index < models.length; index++) {
    const model = models[index];

    const { sequelizeRedis } = new CachedRedis().initCached();
    const cachedSeconds = Number(CONFIG['CACHED_DB_MINUTES']) * 60;
    const modelCached = sequelizeRedis.getModel(model, {
      ttl: Number(cachedSeconds)
    });
    // const modelCached = model;

    models[index] = modelCached;
  }
}

models.sequelize = sequelize;
models.Sequelize = Sequelize;
models.Op = Sequelize.Op;

export default models;
