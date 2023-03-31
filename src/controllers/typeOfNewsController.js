import typeOfNewsServices from '../services/typeOfNewsServices'
import loggerHelpers from '../helpers/loggerHelpers';
import { codeMessage } from '../utils';
import errorCode from '../utils/errorCode';
import { recordStartTime } from '../utils/loggerFormat';
import * as ApiErrors from '../errors';

export default {
  get_one: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, auth: req.auth, attributes }

      // console.log("MenuService param: ", param)
      typeOfNewsServices.get_one(param).then(data => {
        // res.header('Content-Range', `articles ${range}/${data.count}`);
        res.send(data);

        recordStartTime.call(res);
        loggerHelpers.logVIEWED(req, res, {
          dataReqBody: req.body,
          dataReqQuery: req.query,
          dataRes: data
        });
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      // console.log(error)
      next(error)
    }
  },
  create: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log("Request-Body:", res.locals.body);
      const entity = res.locals.body;
      const param = { entity }

      typeOfNewsServices.create(param).then(data => {

        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          recordStartTime.call(res);
          loggerHelpers.logCreate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        } 
        // else {
        //   throw new ApiErrors.BaseError({
        //     statusCode: 202,
        //     type: 'crudNotExisted',
        //   });
        // }
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      next(error)
    }
  },
  update: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params
      const entity = res.locals.body
      // const entity = req.body
      const param = { id, entity }

      typeOfNewsServices.update(param).then(data => {
        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        }
        //  else {
        //   throw new ApiErrors.BaseError({
        //     statusCode: 202,
        //     type: 'crudNotExisted',
        //   });
        // }
      }).catch(error => {
        error.dataInput = req.body;
        error.dataParams = req.params;
        next(error)
      })
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error)
    }
  },
  find_list_parent_child_one: (req, res, next) => {
    try {
      const { sort, range, filter } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth
      };

      typeOfNewsServices.find_list_parent_child_one(param).then(data => {
        res.send({
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
        });
      }).catch(err => {
        next(err)
      })
    } catch (error) {
      next(error)
    }
  },
  find_list_parentChild: (req, res, next) => {
    try {
      const { sort, range, filter } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth
      };

      typeOfNewsServices.find_list_parent_child(param).then(data => {
        res.send({
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
        });
      }).catch(err => {
        next(err)
      })
    } catch (error) {
      next(error)
    }
  },
  bulkUpdate: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { filter, body } = res.locals;
      const entity = body;
      const param = { filter, entity }

      typeOfNewsServices.bulkUpdate(param).then(data => {
        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          });
        }
      }).catch(error => {
        error.dataInput = req.body;
        error.dataParams = req.params;
        next(error)
      })
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error)
    }
  },
  update_status: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params
      const entity = res.locals.body
      // const entity = req.body
      const param = { id, entity }

      typeOfNewsServices.update_status(param).then(data => {
        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          loggerHelpers.logBLOCKDED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          });
        }
      }).catch(error => {
        error.dataInput = req.body;
        error.dataParams = req.params;
        next(error)
      })
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error)
    }
  },
};
