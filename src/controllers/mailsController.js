import loggerHelpers from '../helpers/loggerHelpers';
import { codeMessage } from '../utils';
import errorCode from '../utils/errorCode';
import loggerFormat, { recordStartTime } from '../utils/loggerFormat';
import * as ApiErrors from '../errors';
import mailsService from '../services/mailsService';

export default {
  get_list: (req, res, next) => {
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

      mailsService
        .get_list(param)
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

          res.header('mail-Range', `mailsController ${range}/${data.count}`);
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
  get_list_user_nhan: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', req.query);
    try {
      let { range } = req.query;
      const { filter } = req.query;
      const { usersId } = JSON.parse(filter);
      range = range ? JSON.parse(range) : [0, 20];
      const param = {
        range,
        usersId: usersId
      };

      mailsService
        .get_list_user_nhan(param)
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

          res.header('mail-Range', `mailsController ${range}/${data.count}`);
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
  get_list_user_gui: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', req.query);
    try {
      let { range } = req.query;
      const { filter } = req.query;
      const { usersId } = JSON.parse(filter);
      range = range ? JSON.parse(range) : [0, 20];
      const param = {
        range,
        usersId: usersId
      };

      mailsService
        .get_list_user_gui(param)
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

          res.header('mail-Range', `mailsController ${range}/${data.count}`);
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
  get_one: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, attributes, idNhan: req.auth.userId };

      // console.log("mailService param: ", param)
      mailsService
        .get_one(param)
        .then(data => {
          // res.header('mail-Range', `articles ${range}/${data.count}`);
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
      // console.log(error)
      next(error);
    }
  },
  create: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log('Request-Body:', res.locals.body);
      const entity = res.locals.body;
      const param = { entity };

      mailsService
        .create(param)
        .then(data => {
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
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      next(error);
    }
  },
  update: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const entity = res.locals.body;
      // const entity = req.body
      const param = { id, entity };

      mailsService
        .update(param)
        .then(data => {
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
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  },
  delete: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { id } = req.params;
      const entity = { Status: 0 };
      let param = { id, entity, auth: req.auth };

      mailsService
        .get_one(param)
        .then(data1 => {
          param = { ...param, entity: { ...data1, Status: !data1.Status } };
          mailsService
            .update(param)
            .then(data => {
              res.send(data);

              recordStartTime.call(res);
              loggerHelpers.logDelete(req, res, {
                dataReqBody: req.body,
                dataReqQuery: req.query,
                dataRes: data
              });
            })
            .catch(error => {
              next(error);
            });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      next(error);
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

      mailsService
        .find_list_parent_child_one(param)
        .then(data => {
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
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
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

      mailsService
        .find_list_parent_child(param)
        .then(data => {
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
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  get_all: (req, res, next) => {
    try {
      recordStartTime.call(req);
      const { sort, range, attributes, filter } = req.query;

      let param;

      try {
        // param = {
        //   sort: sort ? JSON.parse(sort) : ["id", "asc"],
        //   filter: filter ? JSON.parse(filter) : {},
        //   attributes: attributes ? JSON.parse(attributes) : null,
        //   auth: req.auth
        // }
        param = {
          sort,
          filter,
          attributes: attributes ? JSON.parse(attributes) : null,
          auth: req.auth
        };
      } catch (error) {
        const { code } = errorCode.paramError;
        const statusCode = 406;
        const errMsg = new Error(error).message;

        recordStartTime.call(res);
        loggerHelpers.logError(req, res, { errMsg });
        res.send({
          result: null,
          success: false,
          errors: [{ code, message: errorCode.paramError.messages[0] }],
          messages: [codeMessage[statusCode], errMsg]
        });
      }
      mailsService
        .get_all(param)
        .then(data => {
          res.send({
            result: data,
            success: true,
            errors: null,
            messages: null
          });
        })
        .catch(err => {
          next(err);
        });
    } catch (error) {
      next(error);
    }
  },
  updateOrder: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const entity = res.locals.body;
      // const entity = req.body
      const param = { entity };

      mailsService
        .updateOrder(param)
        .then(data => {
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
          // else {
          //   throw new ApiErrors.BaseError({
          //     statusCode: 202,
          //     type: 'crudNotExisted',
          //   });
          // }
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  },
  bulkUpdate: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { filter, body } = res.locals;
      const entity = body;
      const param = { filter, entity };

      mailsService
        .bulkUpdate(param)
        .then(data => {
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
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  },
  update_status: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const entity = res.locals.body;
      // const entity = req.body
      const param = { id, entity };

      mailsService
        .update_status(param)
        .then(data => {
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
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  }
};
