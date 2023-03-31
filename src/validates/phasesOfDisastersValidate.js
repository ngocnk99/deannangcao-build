import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  phasesOfDisasterName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.phasesOfDisasters.phasesOfDisasterName'],
  }),
  phasesOfDisasterDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.phasesOfDisasters.phasesOfDisasterDescriptions'],
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

    const { phasesOfDisasterName, phasesOfDisasterDescriptions, status,dateCreated,dateUpdated } = req.body;
    const phasesOfDisaster = { phasesOfDisasterName, phasesOfDisasterDescriptions, status,dateCreated,dateUpdated, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      phasesOfDisasterName: {
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
    ValidateJoi.validate(phasesOfDisaster, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    console.log("validate authenUpdate")

    const { phasesOfDisasterName, phasesOfDisasterDescriptions, status,dateCreated,dateUpdated,points} = req.body;
    const phasesOfDisaster = { phasesOfDisasterName, phasesOfDisasterDescriptions, status,dateCreated,dateUpdated,points };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      phasesOfDisasterName: {
        max: 200,
      },
    });

    ValidateJoi.validate(phasesOfDisaster, SCHEMA)
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
      const { id, phasesOfDisasterName, status,userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
      const phasesOfDisaster = { id, phasesOfDisasterName, status, userCreatorsId, FromDate, ToDate };

      console.log(phasesOfDisaster)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.phasesOfDisasters.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        phasesOfDisasterName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.phasesOfDisasters.phasesOfDisasterName'],
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
      ValidateJoi.validate(phasesOfDisaster, SCHEMA)
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
