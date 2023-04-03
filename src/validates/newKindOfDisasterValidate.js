import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  newKindOfDisasterName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.newKindOfDisaster.newKindOfDisasterName']
  }),

  witaiKeywords: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.newKindOfDisaster.witaiKeywords']
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

  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.id']
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;
    const { newKindOfDisasterName, newspaperUrl, witaiKeywords, dateCreated, dateUpdated } = req.body;
    const news = { newKindOfDisasterName, newspaperUrl, witaiKeywords, dateCreated, dateUpdated, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      newKindOfDisasterName: {
        max: 200,
        required: noArguments
      },
      witaiKeywords: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(news, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { newKindOfDisasterName, newspaperUrl, witaiKeywords, dateCreated, dateUpdated } = req.body;
    const news = { newKindOfDisasterName, newspaperUrl, witaiKeywords, dateCreated, dateUpdated };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      newKindOfDisasterName: {
        max: 200
        // required: noArguments
      },
      witaiKeywords: {
        // required: noArguments
      }
    });

    ValidateJoi.validate(news, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },

  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    if (sort && JSON.parse(sort.toString())) {
      if (JSON.parse(sort)[0].includes('.')) {
        res.locals.sort = [[...JSON.parse(sort)[0].split('.'), JSON.parse(sort)[1]]];
      } else res.locals.sort = parseSortVer2(sort, 'newKindOfDisaster');
    } else res.locals.sort = parseSortVer2(sort, 'newKindOfDisaster');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, newKindOfDisasterName, FromDate, ToDate, includesKeyWords } = JSON.parse(filter);
      const news = { id, newKindOfDisasterName, FromDate, ToDate, includesKeyWords };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.news.id'],
          regex: regexPattern.listIds
        }),
        includesKeyWords: ValidateJoi.createSchemaProp({
          boolean: noArguments,
          label: 'Có thêm keyword vào hay không'
        }),
        ...DEFAULT_SCHEMA,
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
      ValidateJoi.validate(news, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
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
  }
};
