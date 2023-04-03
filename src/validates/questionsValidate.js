import viMessage from '../locales/vi';
import { parseSortVer2 } from '../utils/helper';
import regexPattern from '../utils/regexPattern';
import ValidateJoi, { noArguments } from '../utils/validateJoi';

const DEFAULT_SCHEMA = {
  fullname: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questions.fullname'],
    allow: [null, '']
  }),
  question: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questions.question'],
    allow: [null, '']
  }),
  answer: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questions.answer'],
    allow: [null, '']
  }),
  mobile: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questions.mobile'],
    allow: [null, '']
  }),
  email: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.questions.email'],
    allow: [null, '']
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.type']
  }),
  answerUsersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.questions.answerUsersId'],
    allow: [null]
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
    label: viMessage.status
  })
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');

    const { fullname, question, mobile, email, type, status } = req.body;
    const province = {
      fullname,
      question,
      mobile,
      email,
      type,
      status: status || 1
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      question: {
        required: noArguments
      },
      type: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(province, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },

  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');
    const userCreatorsId = req.auth.userId;

    const { answer, status } = req.body;
    const province = { answer, answerUsersId: userCreatorsId, status };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      answer: {
        required: noArguments
      }
    });

    ValidateJoi.validate(province, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => {
        next({ ...error, message: 'Định dạng gửi đi không đúng' });
      });
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const usersCreatorsId = req.auth.userId;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, usersCreatorsId };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      }),
      dateUpdated: ValidateJoi.createSchemaProp({
        date: noArguments,
        required: noArguments,
        label: viMessage.dateUpdated
      }),
      usersCreatorsId: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.usersCreatorId
      })
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'questions');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        fullname,
        answerUsersId,
        status,
        mobile,
        email,
        type,

        answer,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const province = { id, answerUsersId, fullname, status, mobile, email, type, answer, FromDate, ToDate };

      console.log(province);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.questions.id'],
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
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(province, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
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
