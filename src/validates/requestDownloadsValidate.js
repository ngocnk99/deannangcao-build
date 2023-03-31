import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
 reason: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.requestDownloads.reason'],
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  dateApproved: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.requestDownloads.dateApproved'],
    allow:['',null]
  }),
  userApprovedsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.requestDownloads.userApprovedsId'],
    allow:['',null]
  }),
  explorersId:ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.requestDownloads.explorersId'],
    allow:['',null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  }),
  explorerName: ValidateJoi.createSchemaProp({
    string: noArguments,

  }),
};

export default {
  authenCreate: (req, res, next) => {
    console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { reason,dateCreated,dateApproved,explorersId, status } = req.body;
    const province = { reason,dateCreated,dateApproved,explorersId, status, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        reason: {
        max: 500,
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(province, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    console.log("validate authenUpdate")

    const { reason,dateCreated,dateApproved,explorersId, status,userApprovedsId } = req.body;
    const province = { reason,dateCreated,dateApproved,explorersId, status,userApprovedsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        reason: {
        max: 500,
      },
    });

    ValidateJoi.validate(province, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => {
        next({ ...error, message: "Định dạng gửi đi không đúng" })
      });
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userApprovedsId = req.auth.userId;

    const {status,dateApproved } = req.body;
    const userGroup = {status,dateApproved, userApprovedsId };

    const SCHEMA =  ValidateJoi.assignSchema(DEFAULT_SCHEMA,{
      status: {
        required: noArguments
      },
      dateApproved:
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
      const { id, explorerName,status,userCreatorsId,userApprovedsId, FromDate, ToDate } = JSON.parse(filter);
      const province = { id, explorerName, status, userCreatorsId,userApprovedsId, FromDate, ToDate };

      console.log(province)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.provinces.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.usersCreatorId,
          regex: regexPattern.listIds
        }),
        userApprovedsId: ValidateJoi.createSchemaProp({
            string: noArguments,
            label: viMessage['api.requestDownloads.userApprovedsId'],
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
      ValidateJoi.validate(province, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
          }
          if (userApprovedsId) {
            ValidateJoi.transStringToArray(data, 'userApprovedsId');
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
