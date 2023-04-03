import chatService from '../services/chatService';
import loggerFormat, { recordStartTime } from '../utils/loggerFormat';
import loggerHelpers from '../helpers/loggerHelpers';

export default {
  get_conversationsId: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      chatService
        .get_conversationsId(param)
        .then(data => {
          const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: {
              list: data.rows,
              pagination: {
                current: data.page,
                pageSize: data.perPage,
                total: data.count
              }
            },
            success: true,
            errors: [],
            messages: []
          };

          res.header('Content-Range', `areasController ${range}/${data.count}`);
          res.send(dataOutput);
          // write log
          recordStartTime.call(res);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        })
        .catch(error => {
          error.dataQuery = req.query;
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  get_roomschat_id: (req, res, next) => {
    recordStartTime.call(req);
    let { usersId } = req.query;

    usersId = JSON.parse(usersId);

    try {
      chatService
        .get_roomsChatId(usersId)
        .then(data => {
          console.log('data', data);
          const dataOutput = {
            result: {
              list: data
            },
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          // write log
          recordStartTime.call(res);
        })
        .catch(error => {
          error.dataQuery = req.query;
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  }
};
