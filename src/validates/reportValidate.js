import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  page: ValidateJoi.createSchemaProp({
    number: noArguments,
    label:  viMessage.page,
    required:true
  }),
  perPage: ValidateJoi.createSchemaProp({
    number: noArguments,
    label:  viMessage.perPage,
    required:true
  }),
  FromDate: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.ToDate,
    allow:['',null]
  }),
  ToDate: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.FromDate,
    allow:['',null]
  })
};

export default {

    statistics: (req, res, next) => {
    // console.log("validate authenFilter")


    const {page ,perPage,FromDate, ToDate } = req.body;

      const district = { page ,perPage, FromDate, ToDate };

      console.log("authenfindPointsInMultiPolygons",district )
      

      // console.log('input: ', input);
      ValidateJoi.validate(district, DEFAULT_SCHEMA)
        .then((data) => {
          res.locals.body = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
  },
  dashboard_All_Provinces: (req, res, next) => {
    // console.log("validate authenFilter")


    const {page ,perPage,type, FromDate, ToDate } = req.body;

      const district = { page ,perPage,type, FromDate, ToDate };

      console.log("authenfindPointsInMultiPolygons",district )
      const SCHEMA = {
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
        page: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        perPage: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        type: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          res.locals.body = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
  },
  dashboardNews: (req, res, next) => {
    // console.log("validate authenFilter")


    const {page ,perPage,type, FromDate, ToDate } = req.body;

      const district = { page ,perPage,type, FromDate, ToDate };

      console.log("authenfindPointsInMultiPolygons",district )
      const SCHEMA = {
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
        page: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        perPage: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        type: ValidateJoi.createSchemaProp({
          string: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          res.locals.body = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
  },
}
