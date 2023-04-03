import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
export default {
  
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { disastersId} = JSON.parse(filter);
      const district = { disastersId };

      // console.log(district)
      const SCHEMA = {
        disastersId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.explorers.disastersId'],
        }),
      
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
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
  findExplorersByDisastersId: (req, res, next) => {
    // console.log("validate authenFilter")


    const {page ,perPage,disastersId } = req.body;

      const district = { page ,perPage,disastersId};

      console.log("authenfindPointsInMultiPolygons",district )
      const SCHEMA = {
        disastersId: ValidateJoi.createSchemaProp({
          number: noArguments,
        }),
        page: ValidateJoi.createSchemaProp({
          number: noArguments,
          // label: viMessage['api.explorers.disastersId'],
        }),
        perPage: ValidateJoi.createSchemaProp({
          number: noArguments,
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
