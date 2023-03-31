import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  userName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botAccounts.userName'],
    allow: ['', null]
  }),
  passWord: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botAccounts.passWord'],
    allow: ['', null]
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
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.id']
  }),
  botTrackedObjectListId: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: 'Mảng Id dối tượng theo dõi',
    allow: [[], null]
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;
    const { userName, passWord, dateCreated, dateUpdated, status, botTrackedObjectListId } = req.body;
    const botAccounts = {
      userName,
      passWord,
      dateCreated,
      dateUpdated,
      status,
      botTrackedObjectListId,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        userName: {
          max: 200,
          required: noArguments
        },
        passWord: {
          max: 200,
          required: noArguments
        }
      }),
      {}
    );

    // console.log('input: ', input);
    ValidateJoi.validate(botAccounts, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { userName, passWord, dateCreated, dateUpdated, status, botTrackedObjectListId, userCreatorsId } = req.body;
    const botAccounts = {
      userName,
      passWord,
      dateCreated,
      dateUpdated,
      status,
      botTrackedObjectListId,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        userName: {
          max: 200
        },
        passWord: {
          max: 200
        }
      }),
      {}
    );

    ValidateJoi.validate(botAccounts, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      },
      dateUpdated: {
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
      } else res.locals.sort = parseSortVer2(sort, 'botAccounts');
    } else res.locals.sort = parseSortVer2(sort, 'botAccounts');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        userName,
        passWord,

        status,
        botTrackedObjectListId,
        userCreatorsId,
        FromDate,
        ToDate
      } = JSON.parse(filter);

      const botAccounts = {
        id,
        userName,
        passWord,
        status,
        botTrackedObjectListId,
        userCreatorsId,
        FromDate,
        ToDate
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.botAccounts.id'],
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
        }),

        FromDateApproved: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDateApproved: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(botAccounts, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
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
  authenMoveTrackedObject: (req, res, next) => {
    const { FromBotAccountId, ToBotAccountId } = req.body;
    const userGroup = { FromBotAccountId, ToBotAccountId };

    const SCHEMA = {
      FromBotAccountId: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: 'Id account FB  di chuyển đi',
        required: noArguments
      }),
      ToBotAccountId: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: 'Id account FB di chuyển tới',
        required: noArguments
      })
    };

    // console.log('input: ', input);
    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
