import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  id:ValidateJoi.createSchemaProp({
    number: noArguments,
    required:true
  }),
  ftpServer: ValidateJoi.createSchemaProp({
    object: noArguments,
    required:true,
    label: viMessage.mailServer
  }),
  mailServer: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage.mailServer,
    required:true
  }),
  systemcClearTime:ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.systemcClearTime,
    required:true
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
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
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  }),
};

export default {
  authenCreateOrUpdate: (req, res, next) => {
    console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { id,ftpServer,mailServer,dateCreated,dateUpdated, status,systemcClearTime } = req.body;
    const province = { id,ftpServer,mailServer,dateCreated,dateUpdated, status,systemcClearTime, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      // id:ValidateJoi.createSchemaProp({
      //   regex: regexPattern.number
      // }),
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
}