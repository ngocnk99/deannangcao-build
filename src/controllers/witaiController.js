import { recordStartTime } from '../utils/loggerFormat';
import loggerHelpers from '../helpers/loggerHelpers';
import witai from '../services/witai';

export default {
  get_all_intents: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      witai
        .get_all_intents()
        .then(data => {
          // const objLogger = loggerFormat(req, res);
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
  get_one_intents: (req, res, next) => {
    recordStartTime.call(req);

    try {
      const { name } = req.params;
      const { includeKeywork } = req.query;

      witai
        .get_one_intents(name, includeKeywork)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  create_intents: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { name } = req.body;

      witai
        .create_intents(name)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  delete_intents: (req, res, next) => {
    recordStartTime.call(req);

    try {
      const { name } = req.params;

      witai
        .delete_intents(name)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  addEntitiesToIntents: (req, res, next) => {
    recordStartTime.call(req);

    try {
      const { name } = req.params;
      const { entities } = req.body;

      witai
        .addEntitiesToIntents(name, entities)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  get_all_entities: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { includeKeywork } = req.query;

      witai
        .get_all_entities(includeKeywork)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
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
  get_one_entities: (req, res, next) => {
    recordStartTime.call(req);

    try {
      const { name } = req.params;

      witai
        .get_one_entities(name)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  create_entities: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const body = req.body;

      witai
        .create_entities(body)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  update_entities: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const body = req.body;
      const { name } = req.params;

      witai
        .update_entities(name, body)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  delete_entities: (req, res, next) => {
    recordStartTime.call(req);

    try {
      const { name } = req.params;

      witai
        .delete_entities(name)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  train: (req, res, next) => {
    recordStartTime.call(req);

    try {
      const body = req.body;

      witai
        .train(body)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  get_all_train: (req, res, next) => {
    recordStartTime.call(req);

    try {
      const { limit, offset, intents } = req.query;
      const body = { limit, offset, intents };

      witai
        .get_all_train(body)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  delete_train: (req, res, next) => {
    recordStartTime.call(req);

    try {
      const body = req.body;

      witai
        .delete_train(body)
        .then(data => {
          // const objLogger = loggerFormat(req, res);
          const dataOutput = {
            result: data,
            success: true,
            errors: [],
            messages: []
          };

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
  }
};
