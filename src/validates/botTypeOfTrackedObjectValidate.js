import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  botTypeOfTrackedObjectName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botTypeOfTrackedObject.botTypeOfTrackedObjectName']
  }),
  botTypeOfTrackedObjectIcon: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botTypeOfTrackedObject.botTypeOfTrackedObjectIcon']
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated,
    allow: ['', null]
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;
    const { botTypeOfTrackedObjectName, botTypeOfTrackedObjectIcon, dateCreated, dateUpdated, status } = req.body;
    const menu = {
      botTypeOfTrackedObjectName,
      botTypeOfTrackedObjectIcon,
      dateCreated,
      dateUpdated,
      status,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      botTypeOfTrackedObjectName: {
        max: 200,
        required: true
      },
      status: {
        required: true
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(menu, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { botTypeOfTrackedObjectName, botTypeOfTrackedObjectIcon, dateCreated, dateUpdated, status } = req.body;
    const menu = { botTypeOfTrackedObjectName, botTypeOfTrackedObjectIcon, dateCreated, dateUpdated, status };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      botTypeOfTrackedObjectName: {
        max: 200
      },
      status: {}
    });

    ValidateJoi.validate(menu, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, botTypeOfTrackedObjectName, botTypeOfTrackedObjectIcon, status, FromDate, ToDate } = JSON.parse(
        filter
      );
      const menu = { id, botTypeOfTrackedObjectName, botTypeOfTrackedObjectIcon, status, FromDate, ToDate };

      // console.log(menu)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.botTypeOfTrackedObject.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,

        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(menu, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, userCreatorsId };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        required: noArguments
      }),
      dateUpdated: ValidateJoi.createSchemaProp({
        required: noArguments
      }),
      userCreatorsId: ValidateJoi.createSchemaProp({
        required: noArguments
      })
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
