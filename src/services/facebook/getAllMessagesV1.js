import _ from 'lodash';
import axios from 'axios';
import CONFIG from '../../config';
import r from 'rethinkdb';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
export default {
  connectFacebookApi: async data => {
    let output;
    let finalResult;
    const accessToken = data.entity.accessToken;
    const pageId = data.entity.pageId;
    const messageSize = data.entity.messageSize;
    const pageSize = data.entity.pageSize;

    let tempUrl1 = 'fields=conversations';
    let tempUrl2 = '{message_count,participants,unread_count,messages';
    const tempMessageSize = `.limit(${messageSize}){message,from}`;
    const tempPageSize = `.limit(${pageSize})`;

    console.log('data: ', accessToken, pageId, messageSize, pageSize);

    if (pageSize) {
      tempUrl1 += tempPageSize;
    }
    if (messageSize) {
      tempUrl2 += tempMessageSize;
    }
    // return new Promise((resolve, reject) => {
    const final = await axios({
      method: 'get',
      url:
        CONFIG.FB_GRAPH_HOST +
        '/' +
        CONFIG.FB_GRAPH_VERSION +
        '/' +
        pageId +
        '?' +
        tempUrl1 +
        tempUrl2 +
        '}&' +
        'access_token=' +
        accessToken
    })
      .then(async function(response) {
        output = response.data;
        console.log(JSON.stringify(output, null, 2));
        return output;
      })
      .catch(function(error) {
        console.log('error: ', error.response.data.error);

        output = error.response.data.error;
      });

    const connection = await r.connect({ host: CONFIG.RETHINKDB_SERVER, port: CONFIG.RETHINKDB_PORT, db: CONFIG.RETHINKDB_DB }, async function(
      err,
      conn
    ) {
      console.log('debug1');
      if (err) throw err;
    });

    await r
      .table('faceMessage')
      .filter(r.row('pageId').eq(pageId))
      .orderBy('time')
      .run(connection, function(err, result) {
        if (err) {
          console.log('DB failed] %s:%s\n%s', err.name, err.msg, err.message);
        }
        let userMessages = [];
        console.log('result', result);
        if (result) {
          userMessages = Object.values(result);
        }
        let o = {};
        const res = userMessages.reduce(function(r, el) {
          let e = el.userId;

          if (!o[e]) {
            o[e] = {
              userId: el.userId,
              pageId: el.pageId,
              messages: []
            };
            r.push(o[e]);
          }
          o[e].messages.push(el);
          return r;
        }, []);

        // final.conversations.data.forEach(item => {
        //   item.unread_count = 0;
        //   userMessages.forEach(i => {
        //     if (i.userId === item.participants.data[0].id) item.unread_count += 1;
        //   });
        // });
        finalResult = res;
        console.log(finalResult);
      });

    return output;
  }
};
