import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  communicationProductsGroupName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.communicationProductsGroups.communicationProductsGroupName'],
  }),
  communicationProductsGroupDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.communicationProductsGroups.communicationProductsGroupDescriptions'],
    allow: ['', null]
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated,
    allow:['',null]
  }),
  points: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.points,
    allow:['',null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  }),
};

export default {
  authenCreate: (req, res, next) => {
    console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { communicationProductsGroupName, communicationProductsGroupDescriptions, status,dateCreated,dateUpdated } = req.body;
    const communicationProductsGroup = { communicationProductsGroupName, communicationProductsGroupDescriptions, status,dateCreated,dateUpdated, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      communicationProductsGroupName: {
        max: 200,
        required: noArguments
      },
      userCreatorsId: {
        required: noArguments
      },
      status: {
        required: noArguments
      },
    });

    // console.log('input: ', input);
    ValidateJoi.validate(communicationProductsGroup, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    console.log("validate authenUpdate")

    const { communicationProductsGroupName, communicationProductsGroupDescriptions, status,dateCreated,dateUpdated,points} = req.body;
    const communicationProductsGroup = { communicationProductsGroupName, communicationProductsGroupDescriptions, status,dateCreated,dateUpdated,points };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      communicationProductsGroupName: {
        max: 200,
      },
    });

    ValidateJoi.validate(communicationProductsGroup, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

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
      const { id, communicationProductsGroupName, status,userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
      const communicationProductsGroup = { id, communicationProductsGroupName, status, userCreatorsId, FromDate, ToDate };

      console.log(communicationProductsGroup)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.communicationProductsGroups.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        communicationProductsGroupName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.communicationProductsGroups.communicationProductsGroupName'],
          regex: regexPattern.name
        }),
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.usersCreatorId,
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
      };

      // console.log('input: ', input);
      ValidateJoi.validate(communicationProductsGroup, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
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
}
