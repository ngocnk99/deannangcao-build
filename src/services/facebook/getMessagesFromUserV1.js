import _ from 'lodash';
import axios from 'axios';
import CONFIG from '../../config';
import r from 'rethinkdb';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
import Model from '../../models/models';
import models from '../../entity/index';
const { socialChannels } = models;

export default {
  connectFacebookApi: async data => {
    let output;
    const accessToken = data.entity.accessToken;
    const conversationId = data.entity.conversationId;
    const id = data.entity.conversationId.split('_');
    const range = data.entity.range ? JSON.parse(data.entity.range) : [0, 10];
    const perPage = range[1] - range[0] + 1;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;
    console.log(id[0]);
    const conn = await r.connect({ host: CONFIG.RETHINKDB_SERVER, port: CONFIG.RETHINKDB_PORT, db: CONFIG.RETHINKDB_DB });

    await r
      .table('faceMessage')
      .filter({
        conversationId: conversationId
      })
      .orderBy('time')
      .update({ status: false })
      .run(conn, function(err, result) {
        if (err) {
          console.log('DB---->Insert failed] %s:%s\n%s', err.name, err.msg, err.message);
        }
        let finnalyResult = JSON.stringify(result, null, 2);
      });
    await r
      .table('faceMessage')
      .filter({
        conversationId: conversationId
      })
      .orderBy(r.desc('time'))
      .skip(range[0])
      .limit(perPage)
      .run(conn, function(err, result) {
        if (err) {
          console.log('DB---->Insert failed] %s:%s\n%s', err.name, err.msg, err.message);
        }
        let finnalyResult = result;
        console.log(JSON.stringify(result, null, 2));
        result.map(item => {
          return {
            message: item.message,
            senderId: item.sender,
            recipientId: item.recipient,
            status: item.status,
            time: item.time
          };
        });
        output = result;
      });

    return output;
  }
};
