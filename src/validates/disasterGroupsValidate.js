import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
    disasterGroupName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.disasterGroups.disasterGroupName'],

  }),
  disasterGroupsImages: ValidateJoi.createSchemaProp({
    string: noArguments,
    label:  viMessage['api.disasterGroups.disasterGroupsImages'],
    allow:['',null]
  }),
  disasterGroupVndmsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasterGroups.disasterGroupVndmsId'],
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
  sourceType: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasterGroups.sourceType'],
  }),
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { disasterGroupName,disasterGroupsImages,dateCreated,dateUpdated,disasterGroupVndmsId,sourceType, status } = req.body;
    const district = {  disasterGroupName,disasterGroupsImages,dateCreated,dateUpdated,disasterGroupVndmsId,sourceType, status , userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
     disasterGroupName: {
        max: 500,
        required: noArguments
      },
      // dateCreated:{
      //   required:true
      // },
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

    const { disasterGroupName,disasterGroupsImages,dateCreated,dateUpdated,disasterGroupVndmsId,sourceType, status } = req.body;
    const district = { disasterGroupName,disasterGroupsImages,dateCreated,dateUpdated,disasterGroupVndmsId,sourceType, status};

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        disasterGroupName: {
        max: 500,
      },
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
      const { id, disasterGroupName,disasterGroupVndmsId,sourceType, status, FromDate, ToDate } = JSON.parse(filter);
      const district = { id, disasterGroupName,disasterGroupVndmsId,sourceType, status, FromDate, ToDate };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.district.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        disasterGroupVndmsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasterGroups.disasterGroupVndmsId'],
          regex: regexPattern.listIds
        }),
        sourceType: ValidateJoi.createSchemaProp({
            string: noArguments,
            label: viMessage['api.disasterGroups.sourceType'],
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
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (disasterGroupVndmsId) {
            ValidateJoi.transStringToArray(data, 'disasterGroupVndmsId');
          }
          if (sourceType) {
            ValidateJoi.transStringToArray(data, 'sourceType');
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
