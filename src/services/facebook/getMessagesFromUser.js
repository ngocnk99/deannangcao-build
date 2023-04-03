import axios from 'axios';
import CONFIG from '../../config';
import r from 'rethinkdb';
// import ErrorHelpers from '../../helpers/errorHelpers';
import io from '../../socketServer';
import Model from '../../models/models';
import models from '../../entity/index';
const { socialChannels } = models;

export default {
  connectFacebookApi: async data => {
    let output = {};
    let finalResult;
    const accessToken = data.entity.accessToken;
    const senderId = data.entity.senderId;
    const pageSize = data.entity.pageSize;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;
    const range = data.entity.range ? JSON.parse(data.entity.range) : [0, 10];
    const perPage = range[1] - range[0] + 1;
    // const url = `${host}/${version}/${conversationId}?fields=participants,messages.limit(${pageSize ||
    // 10}){message,from}&access_token=${accessToken}`;

    const foundPageId = await Model.findOne(socialChannels, {
      where: {
        token: accessToken
      },
      attributes: ['link']
    });

    // console.log('id', foundPageId.dataValues.link);
    // const conversation = await axios({
    //   method: 'get',
    //   url: url,
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    //   .then(function(response) {
    //     output = response.data;

    //     return output;
    //   })
    //   .catch(function(error) {
    //          console.log('error: ', error.response.data.error);

    //     output = error.response.data.error;
    //   });

    const connection = await r.connect({ host: CONFIG.RETHINKDB_SERVER, port: CONFIG.RETHINKDB_PORT, db: CONFIG.RETHINKDB_DB });

   await r.table('faceMessage')
      .filter({
        sender: {
          id: senderId
        },
        pageId: foundPageId.dataValues.link
      })
      .update({ status: false })
      .run(connection, function (err, result) {
        if (err) {
          console.log('DB---->Insert failed] %s:%s\n%s', err.name, err.msg, err.message);
        }
        const finnalyResult = JSON.stringify(result, null, 2);
        console.log('finnaly result', finnalyResult);
      });
   await r.table('faceMessage')
      .filter({
        sender: {
          id: senderId
        },
        pageId: foundPageId.dataValues.link
      })
      .orderBy(r.desc('time'))
      .skip(range[0])
      .limit(perPage)
      .run(connection, function(err, result) {
        if (err) {
          console.log('DB---->Insert failed] %s:%s\n%s', err.name, err.msg, err.message);
        }

        result.map(item => {
          return {
            message: item.message,
            sender: item.sender,
            recipient: item.recipient,
            status: item.status,
            time: item.time
          };
        });
        finalResult = result;
        console.log(result);
      });
    return finalResult;
  }
};
