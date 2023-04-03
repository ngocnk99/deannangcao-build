import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  username: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.username'],
  }),
  password: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.password'],

  }),
  fullname: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.fullname'],
  }),
  image: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.image'],
    allow: ['', null],
  }),
  email: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.email'],
  }),
  mobile: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.mobile'],
    allow: ['', null],
  }),
  provincesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.provincesId,
  }),
  userGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.groupUserId,
  }),
  workUnit: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.users.workUnit'],
    allow: ['', null],

  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.parentId'],
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.users.dateUpdated'],
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.users.dateCreated'],
  }),
};

export default {
  authenCreate: (req, res, next) => {
    console.log("validate authenCreate")
    const userCreatorsId = 1;

    const { username, fullname, email,image, mobile, userGroupsId, workUnit, status,dateUpdated,dateCreated,password,provincesId} = req.body;
    const user = { username, fullname, email,image, mobile, userGroupsId, workUnit, status,dateUpdated,dateCreated,userCreatorsId,password,provincesId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      username: {
        regex: /\w/i,
        max: 100,
      },
      password: {
        min: 6,
        max: 200,
      },
      fullname: {
        max: 200,
      },
      email: {
        regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
        max: 200,
      },
      mobile: {
        regex: /^[0-9]+$/i,
        max: 15,
      },
      workUnit: {
        max: 500,
      },
      userGroupsId: {
        required: noArguments
      },
      status: {
        required: noArguments
      },
    });

    // console.log('input: ', input);
    ValidateJoi.validate(user, SCHEMA)
      .then((data) => {

        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    console.log("validate authenUpdate")

    const { username, fullname, email,image, mobile, userGroupsId, workUnit, status,dateUpdated,dateCreated,provincesId } = req.body;
    const user = { username, fullname, email,image, mobile, userGroupsId, workUnit, status,dateUpdated,dateCreated,provincesId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      username: {
        regex: /\w/i,
        max: 100,
      },
      fullname: {
        max: 200,
      },
      email: {
        regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
        max: 200,
      },
      mobile: {
        regex: /^[0-9]+$/i,
        max: 15,
      },
      workUnit: {
        max: 500,
      },
    });

    ValidateJoi.validate(user, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId || 0;

    const {status,dateUpdated } = req.body;
    const userGroup = {status,dateUpdated, userCreatorsId };

    const SCHEMA =  ValidateJoi.assignSchema(DEFAULT_SCHEMA,{
      status: {
        required: noArguments
      },
      dateUpdated:
      {
        required: noArguments
      }
    });

    ValidateJoi.validate(userGroup, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenFilter: (req, res, next) => {
    console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, username, fullname, email, mobile, userGroupsId, workUnit, status, FromDate, ToDate,provincesId } = JSON.parse(filter);
      const user = { id, username, fullname, email, mobile, userGroupsId,workUnit, status, FromDate, ToDate,provincesId };

      console.log(user)
      const SCHEMA = {
        ...DEFAULT_SCHEMA,
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.id'],
          regex: regexPattern.listIds
        }),
        provincesId:  ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.provincesId,
          regex: regexPattern.listIds
        }),
        userGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.groupUserId,
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(user, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userGroupsId) {
            ValidateJoi.transStringToArray(data, 'userGroupsId');
          }
          if (provincesId) {
            ValidateJoi.transStringToArray(data, 'provincesId');
          }
          
          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
    } else {
      res.locals.filter = {};
      next()
    }
  },
  authenRequestForgetPass: (req, res, next) => {
    console.log("validate authenUpdate")

    const { email } = req.body;
    const user = { email };
    
    const SCHEMA =  ValidateJoi.assignSchema(DEFAULT_SCHEMA,{
      email: {
        regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
        max: 200,
      }
    });

    ValidateJoi.validate(user, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenGetAll: (req, res, next) => {
    console.log("validate authenFilter")
    const { filter, attributes, sort } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.attributes = attributes ? JSON.parse(attributes) : null;

    if (filter) {
      const { id, username, fullname, email, mobile, groupUserId, address, wardsId, status, parentId, placesId, FromDate, ToDate, FromDateExpire, ToDateExpire } = JSON.parse(filter);
      const user = { id, username, fullname, email, mobile, groupUserId, address, wardsId, status, parentId, placesId, FromDate, ToDate, FromDateExpire, ToDateExpire };

      console.log(user)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        groupUserId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.groupUserId,
          regex: regexPattern.listIds
        }),
        wardsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.wardsId,
          regex: regexPattern.listIds
        }),
        parentId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.parentId'],
          regex: regexPattern.listIds
        }),
        placesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.placesId,
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
        FromDateExpire: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDateExpire: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(user, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (groupUserId) {
            ValidateJoi.transStringToArray(data, 'groupUserId');
          }
          if (wardsId) {
            ValidateJoi.transStringToArray(data, 'wardsId');
          }
          if (parentId) {
            ValidateJoi.transStringToArray(data, 'parentId');
          }
          if (placesId) {
            ValidateJoi.transStringToArray(data, 'placesId');
          }

          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
    } else {
      res.locals.filter = {};
      next()
    }
  }
}
