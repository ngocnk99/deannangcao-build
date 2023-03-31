import youtubeService from '../services/youtubeService';
import loggerHelpers from '../helpers/loggerHelpers';
import loggerFormat, { recordStartTime } from '../utils/loggerFormat';
import { codeMessage } from '../utils';
import errorCode from '../utils/errorCode';
import * as ApiErrors from '../errors';
import socialsService from '../services/socialsService';

export default {
  get_login_authen: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', req.query);
    try {
      const { access_type, state, include_granted_scopes, prompt } = req.query;
      const param = {
        access_type,
        state,
        include_granted_scopes,
        prompt
      };

      youtubeService
        .get_login_authen(param)
        .then(data => {
          const dataOutput = {
            result: {
              authUrl: data.authUrl
            },
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          // write log
          // recordStartTime.call(res);
          // loggerHelpers.logVIEWED(req, res, {
          //   dataReqBody: req.body,
          //   dataReqQuery: req.query,
          //   dataRes: dataOutput
          // });
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
  get_code_authe_google: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', req.query);
    try {
      const { code, scope, socialsId, socialChannelType } = req.query;
      const param = {
        code,
        scope,
        socialsId,
        socialChannelType,
        userCreatorsId: req.auth.userId
      };

      youtubeService
        .get_code_authe_google(param)
        .then(data => {
          const dataOutput = {
            result: {
              messages: data
            },
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          // write log
          // recordStartTime.call(res);
          // loggerHelpers.logVIEWED(req, res, {
          //   dataReqBody: req.body,
          //   dataReqQuery: req.query,
          //   dataRes: dataOutput
          // });
        })
        .catch(error => {
          // error.dataQuery = req.query;
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  create: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', req.query);
    try {
      const { sort, range, filter, attributes, code, scope, title, description } = req.body;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes,
        code,
        scope,
        title,
        description
      };

      youtubeService
        .create(param)
        .then(data => {
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

          res.header('Content-Range', `sclSocialAccounts ${range}/${data.count}`);
          res.send(dataOutput);
          // write log
          // recordStartTime.call(res);
          // loggerHelpers.logVIEWED(req, res, {
          //   dataReqBody: req.body,
          //   dataReqQuery: req.query,
          //   dataRes: dataOutput
          // });
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
  getStatistical: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const param = { id };

      console.log('districtsService param: ', param);
      youtubeService
        .getStatistical(param)
        .then(data => {
          const objLogger = loggerFormat(req, res);

          res.send(data);
          recordStartTime.call(res);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      error.dataParams = req.params;
      next(error);
    }
  }
};
