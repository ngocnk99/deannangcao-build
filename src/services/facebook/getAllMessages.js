import _ from 'lodash';
import axios from 'axios';
import CONFIG from '../../config';
import r from 'rethinkdb';
// import * as ApiErrors from '../../errors';
// import ErrorHelpers from '../../helpers/errorHelpers';
export default {
  connectFacebookApi: async data => {
    let output;
    let finalResult;
    const accessToken = data.entity.accessToken;
    const pageId = data.entity.pageId;
    const messageSize = data.entity.messageSize;
    const pageSize = data.entity.pageSize;
    const range = data.entity.range ? JSON.parse(data.entity.range) : [0, 10];
    const perPage = range[1] - range[0] + 1;
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
    // const final = await axios({
    //   method: 'get',
    //   url:
    //     CONFIG.FB_GRAPH_HOST +
    //     '/' +
    //     CONFIG.FB_GRAPH_VERSION +
    //     '/' +
    //     pageId +
    //     '?' +
    //     tempUrl1 +
    //     tempUrl2 +
    //     '}&' +
    //     'access_token=' +
    //     accessToken
    // })
    //   .then(function(response) {
    //     output = response.data;
    //     console.log(JSON.stringify(output, null, 2));

    //     return output;
    //   })
    //   .catch(function(error) {
    //     console.log('error: ', error.response.data.error);

    //     output = error.response.data.error;
    //   });

    const connection = await r.connect({ host: CONFIG.RETHINKDB_SERVER, port: CONFIG.RETHINKDB_PORT, db: CONFIG.RETHINKDB_DB });

    await r
      .table('faceMessage')
      .filter({ pageId: pageId })
      .orderBy('time')
      .skip(range[0])
      .limit(perPage)
      .run(connection, function(err, result) {
        if (err) {
          console.log('DB failed] %s:%s\n%s', err.name, err.msg, err.message);
        }
        let userMessages = [];

        console.log('result', result);
        if (result && Array.isArray(result)) {
          userMessages = Object.values(result);
        }
        console.log(userMessages);
        let res = userMessages.reduce((r, { sender: sender, ...object }) => {
          console.log(r);
          let temp = r.find(o => o.sender.id === sender.id);
          const entry = {
            message: object.message,
            recipient: object.recipientId,
            time: object.time,
            status: object.status
          };

          if (!temp) r.push((temp = { sender, messages: [] }));
          temp.messages.push(entry);

          return r;
        }, []);
        let unreadNotification = 0;

        res =
          (res &&
            res.length > 0 &&
            res.map(item => {
              let unreadCount = 0;

              item.messages.map(i => {
                if (i.status === true) unreadCount += 1;
              });
              item.messages = item.messages[item.messages.length - 1];
              if (item.messages.status) unreadNotification += 1;

              return {
                ...item,
                unreadCount: unreadCount
              };
            })) ||
          [];

        const data = {
          pageId: pageId,
          conversations: res,
          unreadNotification: unreadNotification
        };
        // final.conversations.data.forEach(item => {
        //   item.unreadCount = 0;
        //   userMessages.forEach(i => {
        //     if (i.senderId === item.participants.data[0].id) item.unreadCount += 1;
        //   });
        // });

        finalResult = data;

        // console.log('finalResult', finalResult);
      });

    return finalResult;
  }
};
