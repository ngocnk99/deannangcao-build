import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort, parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  mailTitle: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.mails.mailTitle'],
  }),
  mailContent: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.mails.mailContent'],
    allow: ['', null],
  }),
  mailReplyId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.mails.mailReplyId'],
  }),
  mailSendingDate: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.mails.mailSendingDate'],
  }),
  userSendersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
  }),
  receivers: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.mails.receivers'],
  }),
  conversationsId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.mails.conversationsId']
  }),
  attachment: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.mails.attachment'],
    allow: [[]]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  }),
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userSendersId = req.auth.userId;

    let { mailTitle, mailContent,mailReplyId,conversationsId, receivers,attachment } = req.body;

    if(!mailReplyId) mailReplyId = 0;
    const mail = { mailTitle, mailContent,mailReplyId, userSendersId, conversationsId,receivers,attachment };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      mailTitle: {
        max: 500,
        required: noArguments
      },
      receivers: {
        required: noArguments
      }
    });
    // console.log('input: ', input);

    ValidateJoi.validate(mail, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'mails');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { userSendersId,userReceiversId,fullname } = JSON.parse(filter);
      const mail = { userSendersId,userReceiversId,fullname };

      // console.log(mail)
      const SCHEMA = {
        userSendersId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.id']
        }),
        userReceiversId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.id']
        }),
        fullname: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.users.fullname'],
          regex: regexPattern.name
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(mail, SCHEMA)
        .then((data) => {
          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
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
  authenUpdateOrder: (req, res, next) => {
    // console.log("validate authenUpdateOrder")

    const { orders } = req.body;
    const mail = { orders };

    const SCHEMA = {
      orders: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: viMessage['api.mails.orders'],
      })
    };

    ValidateJoi.validate(mail, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const {status } = req.body;
    const userGroup = {status };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        required: noArguments
      })
    };


    ValidateJoi.validate(userGroup, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
}
