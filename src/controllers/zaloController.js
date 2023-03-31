import Zalo from '../services/zalo/index';
import loggerHelpers from '../helpers/loggerHelpers';
import getStatistic from '../services/zalo/getStatistic';
const { sendText, getInfoOa } = Zalo;

export default {
  sendText: (req, res, next) => {
    try {
      sendText(req.body)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getInfoOa: (req, res, next) => {
    try {
      console.log('test');
      getInfoOa(req.body, req.auth.userId)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getStatistics: (req, res, next) => {
    try {
      getStatistic
        .getStatistics(req.params.id)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
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
  }
};
