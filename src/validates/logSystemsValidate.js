import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort,parseSortMongodb } from '../utils/helper';
const DEFAULT_SCHEMA = {
  ip: ValidateJoi.createSchemaProp({
    string: noArguments,
  }),
  FromDate: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.FromDate
  }),
  ToDate: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.ToDate,
  }),
  username: ValidateJoi.createSchemaProp({
    string: noArguments,
    allow:['',null]
  }),
  type: ValidateJoi.createSchemaProp({
    string: noArguments,
  }),
};

export default {
  authenFilter: (req, res, next) => {
    console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortMongodb(sort);
    // res.locals.sort = sort ? JSON.parse(sort) : {};
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { ip, username,type, FromDate, ToDate } = JSON.parse(filter);
      const province = { ip, username, type, FromDate, ToDate };

      console.log(province)
      const SCHEMA = {
        type: ValidateJoi.createSchemaProp({
          string: noArguments,
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA
      };

      // console.log('input: ', input);
      ValidateJoi.validate(province, SCHEMA)
        .then((data) => {
          if (type) {
            ValidateJoi.transStringToArray(data, 'type');
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
