import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort, parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  username: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contentReviews.username']
  }),
  email: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contentReviews.email']
  }),
  valueVoted: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.contentReviews.valueVoted']
  }),
  contentsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.contents.id']
  }),
  comment: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contentReviews.comment']
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate,
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
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")

    const { username,email,comment,
      valueVoted,contentsId,
      status,dateCreated,dateUpdated } = req.body;
    const contentReview = { username,email,comment,
      valueVoted,contentsId,
      status,dateCreated,dateUpdated };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        username: {
          max: 200,
          required: noArguments
        },
        email: {
          max: 200,
          required: noArguments
        },
        contentsId: {
          required: noArguments
        },
        valueVoted: {
          required: noArguments
        },
        comment: {
          required: noArguments
        }
      }));

    // console.log('input: ', input);
    ValidateJoi.validate(contentReview, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { username,email,comment,
      valueVoted,contentsId,
      status,dateCreated,dateUpdated } = req.body;
    const contentReview = { username,email,comment,
      valueVoted,contentsId,
      status,dateCreated,dateUpdated };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        username: {
          max: 200,
          // required: noArguments
        },
        email: {
          max: 200,
          // required: noArguments
        },
        contentsId: {
          // required: noArguments
        },
        valueVoted: {
          // required: noArguments
        },
        comment: {
          // required: noArguments
        },
        status: {
          // required: noArguments
        },
      }));

    ValidateJoi.validate(contentReview, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const {status,dateUpdated } = req.body;
    const userGroup = {status,dateUpdated };

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
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'contentReviews');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, username,email,contentsId, valueVoted, status, FromDate, ToDate } = JSON.parse(filter);
      const contentReview = { id, username,email,contentsId, valueVoted, status, FromDate, ToDate };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contentReviews.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        username: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contentReviews.username'],
          regex: regexPattern.name
        }),
        email: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contentReviews.email'],
          regex: regexPattern.email
        }),
        contentsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.id'],
          regex: regexPattern.listIds
        }),
        valueVoted: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contentReviews.valueVoted'],
          regex: regexPattern.number
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
      ValidateJoi.validate(contentReview, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (contentsId) {
            ValidateJoi.transStringToArray(data, 'contentsId');
          }
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
  authenDelete: (req, res, next) => {
    const { id } = req.query;
    console.log('vào đây', id);
    let contentReview;
    if (id) contentReview = {id};
    else contentReview = {id: ''};
    if (contentReview) {
      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contentReviews.id'],
          regex: regexPattern.listIds
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(contentReview, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
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
  }
}
