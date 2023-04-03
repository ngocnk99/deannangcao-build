import axios from 'axios';
import CONFIG from '../../config';
import ErrorHelpers from '../../helpers/errorHelpers';
import r from 'rethinkdb';

export default {
  connectFacebookApi: async ({ pageId, range }) => {
    range = range ? JSON.parse(range) : [0, 20];
    let finallyResult = [];
    const perPage = range[1] - range[0] + 1;
    const connection = await r.connect({
      host: CONFIG.RETHINKDB_SERVER,
      port: CONFIG.RETHINKDB_PORT,
      db: CONFIG.RETHINKDB_DB
    });

    try {
      await r
        .table('userInfo')
        .filter({ pageId: pageId })
        .orderBy(r.asc('name'))
        .skip(range[0])
        .limit(perPage)
        .run(connection, function(err, result) {
          if (err) {
            console.log(err);
          } else if (result) finallyResult = result;
        });
    } catch (e) {
      console.log(e);
    }

    return finallyResult;
  }
};
