import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
    areaName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.areas.areaName']
  }),
  areaDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.areas.areaDescriptions'],
    allow: ['',null]
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
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
const DEFAULT_SCHEMA_AREASPROVINCES =ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
  id: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.id
  }),
  provincesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.provincesId
  }),
  areasId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.areasId
  }),
  flag: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: 'cờ phân biệt Thêm-sửa/Xoá'
  })
}))
  ;

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { areaName,areaDescriptions, status,areasProvinceses,dateCreated,dateUpdated } = req.body;
    const district = {  areaName,areaDescriptions, status,areasProvinceses,dateCreated,dateUpdated, userCreatorsId };

    // const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
    //     areaName: {
    //     max: 500,
    //     required: noArguments
    //   },
    //   areaType: {
    //     required: noArguments
    //   },
    //   status: {
    //     required: noArguments
    //   },
    // });

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {

      areaName: {
        max: 500,
        required: noArguments
      },

      status: {
        required: noArguments
      },
    }),
    {
      areasProvinceses: DEFAULT_SCHEMA_AREASPROVINCES
    });

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { areaName,areaDescriptions, status,areasProvinceses,dateCreated,dateUpdated, } = req.body;
    const district = { areaName,areaDescriptions, status,areasProvinceses,dateCreated,dateUpdated};

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {

      areaName: {
        max: 500,
        // required: noArguments
      },

      status: {
        // required: noArguments
      },
    }),
    {
      areasProvinceses: DEFAULT_SCHEMA_AREASPROVINCES
    });

    ValidateJoi.validate(district, SCHEMA)
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
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, areaName, status, FromDate, ToDate } = JSON.parse(filter);
      const district = { id, areaName, status, FromDate, ToDate };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.areas.id'],
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
      ValidateJoi.validate(district, SCHEMA)
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
  },
  authen_GetAll: (req, res, next) => {
    console.log("validate authenFilter");
    const { filter, attributes, sort } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.attributes = attributes;

    if (filter) {
      const { id } = JSON.parse(filter);
      const province = { id };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.areas.id'],
          regex: regexPattern.listIds
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(province, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
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
  }
}
