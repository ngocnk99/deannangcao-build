import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  data: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.contentSocials.data']
  }),
  socialChannelsId: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.contentSocials.socialChannelsId']
  }),
  contentsId: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.contents.id'],
    allow:[null,[]]
  }),
  disastersId: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.disasters.disasterVndmsId'],
    allow:[null,[]]
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

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { data, socialChannelsId,contentsId,
      status,dateCreated,dateUpdated,disastersId } = req.body;
    const contentSocials = { data, socialChannelsId,contentsId,
      status,dateCreated,dateUpdated, userCreatorsId,disastersId };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      data: {
        required: noArguments
      },
        socialChannelsId: {
          required: noArguments
        },
        status: {
          required: noArguments
        },
      }));

    // console.log('input: ', input);
    ValidateJoi.validate(contentSocials, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { contentName,producersId,contentProductionDate,
      communicationProductsGroupsId,phasesOfDisastersId,
      contentShortDescriptions,contentDescriptions,
      contentImages,contentFiles,contentDesignFiles,
      contentDisasterGroups,contentAreas,contentTargetAudiences,
      status,dateCreated,dateUpdated,disastersId } = req.body;

    const content = { contentName,producersId,contentProductionDate,
      communicationProductsGroupsId,phasesOfDisastersId,
      contentShortDescriptions,contentDescriptions,
      contentImages,contentFiles,contentDesignFiles,
      contentDisasterGroups,contentAreas,contentTargetAudiences,
      status,dateCreated,dateUpdated,disastersId };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        contentName: {
          max: 200,
          // required: noArguments
        },
        producersId: {
          // required: noArguments
        },
        communicationProductsGroupsId: {
          // required: noArguments
        },
        phasesOfDisastersId: {
          // required: noArguments
        },
        status: {
          // required: noArguments
        },
      }),
      {
        contentAreas: DEFAULT_SCHEMA_CONTENTAREAS,
        contentDisasterGroups: DEFAULT_SCHEMA_CONTENTDISASTERGROUPS,
        contentTargetAudiences: DEFAULT_SCHEMA_CONTENTTARGETAUDIENCES
      });

    ValidateJoi.validate(content, SCHEMA)
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
    const { filter, sort, range } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];

    if (filter) {
      const { id ,contentsId, status, FromDate, ToDate } = JSON.parse(filter);
      const content = { id ,contentsId, status, FromDate, ToDate };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        contentsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.id'],
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
      ValidateJoi.validate(content, SCHEMA)
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
          label: viMessage['api.contents.id'],
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
