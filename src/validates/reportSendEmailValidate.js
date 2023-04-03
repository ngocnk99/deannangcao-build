import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  mailCc: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.reportSendEmail.mailCc'],
  }),
  mailTo: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.reportSendEmail.mailTo'],
    allow:['',[]]
  }),
  mailBcc: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.reportSendEmail.mailBcc'],
    allow:['',[]]
  }),
  mailSubject: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.reportSendEmail.mailSubject'],
    allow:['',[]]
  }),
  mailContent: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.reportSendEmail.mailContent'],
    allow:['',[]]
  }),
  mailAttachments: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.reportSendEmail.mailAttachments'],
    allow:['',[]]
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
};

export default {
  authenCreate: (req, res, next) => {
    console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { mailCc,mailTo,mailBcc,dateCreated,mailSubject,mailContent, mailAttachments } = req.body;
    const province = { mailCc,mailTo,mailBcc,dateCreated,mailSubject,mailContent, mailAttachments, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
       mailSubject: {
        max: 200,
      },
      mailTo:{
          required:true
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

  authenFilter: (req, res, next) => {
    console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'reportSendEmail');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, mailCc,mailTo,mailBcc,dateCreated,mailSubject,mailContent,userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
      const province = { id, mailCc,mailTo,mailBcc,dateCreated,mailSubject,mailContent, userCreatorsId, FromDate, ToDate };

      console.log(province)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.reportSendEmail.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
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
      ValidateJoi.validate(province, SCHEMA)
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
