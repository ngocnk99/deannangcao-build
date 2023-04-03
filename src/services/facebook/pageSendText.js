import axios from 'axios';
import r from 'rethinkdb';
import ErrorHelpers from '../../helpers/errorHelpers';
import myRedis from '../../db/myRedis';
import CONFIG from '../../config';
import Model from '../../models/models';
import models from '../../entity/index';
import getPageInfo from './getPageInfo';
const { socialChannels, socialGroupChannels } = models;
// import _ from 'lodash';
// eslint-disable-next-line require-jsdoc
const setOptions = (userId, text) => {
  const body = {
    recipient: {
      id: `${userId}`
    },
    message: {
      text: `${text}`
    },
    messaging_type: 'MESSAGE_TAG',
    tag: 'ACCOUNT_UPDATE'
  };

  return {
    body: JSON.stringify(body)
  };
};

export default {
  connectFacebookApi: async data => {
    let output = {};
    const { entity } = data;

    console.log('data: ', data);
    // const newEntry = {
    //   provider: data.entity.provider,
    //   pageId: data.entity.pageId.toString(),
    //   userId: data.entity.userId.toString(),
    //   text: data.entity.text || '',
    //   time: new Date().getTime(),
    //   status: true,
    //   isPage: true
    // };
    const accessToken = entity.accessToken;
    const userId = entity.userId;
    const text = entity.text || '';
    const foundSocialChannel = await Model.findOne(socialChannels, {
      where: {
        link: accessToken
      },
      required: true,
      include: [{ model: socialGroupChannels, as: 'socialGroupChannels' }],
      attributes: ['placesId', 'pageId']
    });
    const newEntry = {
      pageId: foundSocialChannel.pageId,
      sender: { id: foundSocialChannel.pageId },
      recipient: { id: entity.userId },
      message: {
        text: text,
        attachments: entity.message.attachments ? entity.message.attachments : []
      },
      time: new Date().getTime(),
      status: false,
      socialGroupChannels: 'facebook',
      placesId: foundSocialChannel.placesId
    };
    const userInfo = await getPageInfo.connectFacebookApi({
      entity: {
        accessToken: accessToken,
        pageId: newEntry.pageId
      }
    });

    newEntry.sender = { ...newEntry.sender, profile_pic: userInfo.data.picture, name: userInfo.data.name };
    console.log('new', newEntry);
    let finnalyResult;

    console.log(newEntry);

    try {
      await r.connect({ host: CONFIG.RETHINKDB_SERVER, port: CONFIG.RETHINKDB_PORT, db: CONFIG.RETHINKDB_DB }, function(err, conn) {
        if (err) throw err;
        r.table('faceMessage')
          .insert(newEntry)
          .run(conn, function(err, result) {
            if (err) {
              console.log('DB---->Insert failed] %s:%s\n%s', err.name, err.msg, err.message);
            }
            finnalyResult = JSON.stringify(result, null, 2);
            console.log('finnaly result', finnalyResult);
          });
        r.table('faceMessage')
          .filter({
            sender: {
              id: newEntry.sender.id
            },
            pageId: entity.pageId,
            recipient: {
              id: newEntry.recipient.id
            }
          })
          .update({ status: false })
          .run(conn, function(err, result) {
            if (err) {
              console.log('DB---->Insert failed] %s:%s\n%s', err.name, err.msg, err.message);
            }
            const finnalyResult = JSON.stringify(result, null, 2);

            console.log('finnaly result', finnalyResult);
          });
      });

      let currentSession = await myRedis.getWithoutModel(CONFIG.REDIS_PREFIX_KEY, {
        sender: newEntry.sender.id,
        recipient: newEntry.recipient.id,
        provider: data.entity.provider
      });

      if (currentSession) {
        currentSession = JSON.parse(currentSession);
        currentSession.directContact = true;
        currentSession.directContactExpired = new Date(new Date().getTime() + Number(CONFIG.DIRECT_CONTACT_EXPIRED));
        await myRedis.setWithoutModel(
          CONFIG.REDIS_PREFIX_KEY,
          {},
          {
            sender: newEntry.sender.id,
            recipient: newEntry.recipient.id,
            provider: data.entity.provider
          }
        );
      }

      finnalyResult = { transaction: true };
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'ArticleService');
    }

    console.log('Data: ', accessToken, userId, text);

    if (text !== '') {
      console.log('accessToken=%s || userId=%s || text=%s', accessToken, userId, text);
      const options = setOptions(userId, text);

      console.log('options   ', options);
      console.log('options body   ', options.body);
      // return new Promise((resolve, reject) => {
      await axios({
        method: 'post',
        url: 'https://graph.facebook.com/v5.0/me/messages?access_token=' + accessToken,
        data: options.body,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(function(response) {
          console.log('kết thúc response', response.data);

          output = {
            data: response.data
          };
        })
        .catch(function(error) {
          console.log(error.response.data.error);

          output = {
            data: error.response.data.error
          };
        });
    }

    return output;
  }
};
