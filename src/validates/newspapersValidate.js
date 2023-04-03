import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  newspaperName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.newspapers.newspaperName'],
  }),
  newspaperUrl: ValidateJoi.createSchemaProp({
    array: noArguments,
    label:  viMessage['api.newspapers.newspaperUrl'],
  }),
  newspaperKeyword: ValidateJoi.createSchemaProp({
    array: noArguments,
    label:  viMessage['api.newspapers.newspaperKeyword'],
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
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.users.id'],
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.type,
  }),
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;
    const { newspaperName,newspaperUrl,newspaperKeyword,dateCreated,dateUpdated, status,type } = req.body;
    const news = { newspaperName,newspaperUrl,newspaperKeyword,dateCreated,dateUpdated, status,type,userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
     newspaperName: {
        max: 200,
        required: noArguments
      },
      status: {
        required: noArguments
      },
    });

    // console.log('input: ', input);
    ValidateJoi.validate(news, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { newspaperName,newspaperUrl,newspaperKeyword,dateCreated,dateUpdated, status,type  } = req.body;
    const news = { newspaperName,newspaperUrl,newspaperKeyword,dateCreated,dateUpdated, status,type  };


    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        newspaperName: {
            max: 200,
            // required: noArguments
          },
          status: {
            // required: noArguments
          },
    });

    ValidateJoi.validate(news, SCHEMA)
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

    if(sort && JSON.parse(sort.toString())) {
      if(JSON.parse(sort)[0].includes(".")) {
        res.locals.sort = [[...JSON.parse(sort)[0].split("."),JSON.parse(sort)[1]]];
      } else res.locals.sort = parseSortVer2(sort,'newspapers');
    } else res.locals.sort = parseSortVer2(sort,'newspapers');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id,newspaperName,status,FromDate, ToDate,type } = JSON.parse(filter);
      const news = { id,newspaperName,status,FromDate, ToDate,type };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.news.id'],
          regex: regexPattern.listIds
        }),
        type: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.type,
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
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
      ValidateJoi.validate(news, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (type) {
            ValidateJoi.transStringToArray(data, 'type');
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
