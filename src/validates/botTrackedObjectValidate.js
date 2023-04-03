import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  trackedObjectName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botTrackedObject.trackedObjectName'],
    allow: ['', null]
  }),
  trackedObjectInfo: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botTrackedObject.trackedObjectInfo'],
    allow: ['', null]
  }),
  trackedObjectId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botTrackedObject.trackedObjectId'],
    allow: ['', null]
  }),
  trackedObjectType: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.botTrackedObject.trackedObjectType']
  }),
  lastTrackTime: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.botTrackedObject.lastTrackTime'],
    allow: ['', null]
  }),
  trackedObjectUrl: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botTrackedObject.trackedObjectUrl'],
    allow: ['', null]
  }),
  isJoin: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.botTrackedObject.isJoin'],
    allow: ['', null]
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.id']
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
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
    allow: ['', null]
  }),
  isSpecified: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.botTrackedObject.isSpecified'],
    allow: ['', null]
  }),
  botAccountsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.botTrackedObject.botAccountsId'],
    allow: ['', null]
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;
    const {
      trackedObjectId,
      trackedObjectUrl,
      isJoin,
      trackedObjectName,
      trackedObjectInfo,
      trackedObjectType,
      lastTrackTime,
      dateCreated,
      status,
      botAccountsId
    } = req.body;
    const botTrackedObject = {
      trackedObjectId,
      trackedObjectUrl,
      isJoin,
      trackedObjectName,
      trackedObjectInfo,
      trackedObjectType,
      lastTrackTime,
      dateCreated,
      status,
      userCreatorsId,
      botAccountsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        trackedObjectName: {
          max: 1000,
          required: noArguments
        },
        trackedObjectType: {
          required: noArguments
        },
        trackedObjectId: {
          max: 45,
          required: noArguments
        },
        trackedObjectUrl: {
          max: 500
        }
      }),
      {}
    );

    // console.log('input: ', input);
    ValidateJoi.validate(botTrackedObject, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      trackedObjectId,
      trackedObjectUrl,
      isJoin,
      trackedObjectName,
      trackedObjectInfo,
      trackedObjectType,
      lastTrackTime,
      dateCreated,
      status,
      botAccountsId
    } = req.body;
    const botTrackedObject = {
      trackedObjectId,
      trackedObjectUrl,
      isJoin,
      trackedObjectName,
      trackedObjectInfo,
      trackedObjectType,
      lastTrackTime,
      dateCreated,
      status,
      botAccountsId
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {}), {});

    ValidateJoi.validate(botTrackedObject, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const { status } = req.body;
    const userGroup = { status };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      }
    });

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    const { filter, sort, range, attributes } = req.query;

    if (sort && JSON.parse(sort.toString())) {
      if (JSON.parse(sort)[0].includes('.')) {
        res.locals.sort = [[...JSON.parse(sort)[0].split('.'), JSON.parse(sort)[1]]];
      } else res.locals.sort = parseSortVer2(sort, 'botTrackedObject');
    } else res.locals.sort = parseSortVer2(sort, 'botTrackedObject');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        trackedObjectId,
        trackedObjectUrl,
        isJoin,
        trackedObjectName,
        trackedObjectInfo,
        trackedObjectType,
        botAccountsId,
        isSpecified,
        lastTrackTime,
        status,
        FromDate,
        ToDate
      } = JSON.parse(filter);

      const botTrackedObject = {
        id,
        trackedObjectId,
        trackedObjectName,
        trackedObjectInfo,
        trackedObjectUrl,
        isJoin,
        trackedObjectType,
        botAccountsId,
        isSpecified,
        lastTrackTime,
        status,
        FromDate,
        ToDate
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.botTrackedObject.id'],
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
      ValidateJoi.validate(botTrackedObject, SCHEMA)
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
  }
};
