import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  contentName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contents.contentName']
  }),
  producersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.producers.id']
  }),
  contentProductionDate: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.contents.contentProductionDate'],
    allow: ['',null]
  }),
  communicationProductsGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.communicationProductsGroups.id']
  }),
  phasesOfDisastersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.phasesOfDisasters.id']
  }),
  contentShortDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contents.contentShortDescriptions'],
    allow: ['',null]
  }),
  contentDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.contents.contentDescriptions'],
    allow: ['',null]
  }),
  contentImages: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.contents.contentImages'],
  }),
  contentFiles: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.contents.contentFiles'],
  }),
  contentDesignFiles: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.contents.contentDesignFiles'],
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
const DEFAULT_SCHEMA_CONTENTAREAS =ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    id: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage.id
    }),
    areasId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.areas.id']
    }),
    contentsId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.contents.id']
    }),
    flag: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: 'cờ phân biệt Thêm-sửa/Xoá'
    })
  }))
;
const DEFAULT_SCHEMA_CONTENTTARGETAUDIENCES =ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    id: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage.id
    }),
    targetAudiencesId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.targetAudiences.id']
    }),
    contentsId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.contents.id']
    }),
    flag: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: 'cờ phân biệt Thêm-sửa/Xoá'
    })
  }))
;
const DEFAULT_SCHEMA_CONTENTDISASTERGROUPS =ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    id: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage.id
    }),
    disasterGroupsId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.disasterGroups.id']
    }),
    contentsId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.contents.id']
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

    const { contentName,producersId,contentProductionDate,
      communicationProductsGroupsId,phasesOfDisastersId,
      contentShortDescriptions,contentDescriptions,
      contentImages,contentFiles,contentDesignFiles,
      contentDisasterGroups,contentAreas,contentTargetAudiences,
      status,dateCreated,dateUpdated } = req.body;
    const content = { contentName,producersId,contentProductionDate,
      communicationProductsGroupsId,phasesOfDisastersId,
      contentShortDescriptions,contentDescriptions,
      contentImages,contentFiles,contentDesignFiles,
      contentDisasterGroups,contentAreas,contentTargetAudiences,
      status,dateCreated,dateUpdated, userCreatorsId };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        contentName: {
          max: 200,
          required: noArguments
        },
        producersId: {
          required: noArguments
        },
        communicationProductsGroupsId: {
          required: noArguments
        },
        phasesOfDisastersId: {
          required: noArguments
        },
        status: {
          required: noArguments
        },
      }),
      {
        contentAreas: DEFAULT_SCHEMA_CONTENTAREAS,
        contentDisasterGroups: DEFAULT_SCHEMA_CONTENTDISASTERGROUPS,
        contentTargetAudiences: DEFAULT_SCHEMA_CONTENTTARGETAUDIENCES
      });

    // console.log('input: ', input);
    ValidateJoi.validate(content, SCHEMA)
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
      status,dateCreated,dateUpdated } = req.body;

    const content = { contentName,producersId,contentProductionDate,
      communicationProductsGroupsId,phasesOfDisastersId,
      contentShortDescriptions,contentDescriptions,
      contentImages,contentFiles,contentDesignFiles,
      contentDisasterGroups,contentAreas,contentTargetAudiences,
      status,dateCreated,dateUpdated };

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
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, contentName,producersId,views, shares, FromContentProductionDate,ToContentProductionDate,disasterGroupsId,targetAudiencesId,areasId,communicationProductsGroupsId,phasesOfDisastersId, status, FromDate, ToDate } = JSON.parse(filter);
      const content = { id, contentName,producersId,views, shares, FromContentProductionDate,ToContentProductionDate,disasterGroupsId,targetAudiencesId,areasId,communicationProductsGroupsId,phasesOfDisastersId, status, FromDate, ToDate };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        contentName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.contentName'],
          regex: regexPattern.name
        }),

        disasterGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasterGroups.id'],
          regex: regexPattern.listIds
        }),
        views: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.views'],
          regex: regexPattern.number
        }),
        shares: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.contents.shares'],
          regex: regexPattern.number
        }),
        targetAudiencesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.targetAudiences.id'],
          regex: regexPattern.listIds
        }),
        areasId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.areas.id'],
          regex: regexPattern.listIds
        }),

        producersId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.producers.id'],
          regex: regexPattern.listIds
        }),
        communicationProductsGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.communicationProductsGroups.id'],
          regex: regexPattern.listIds
        }),
        phasesOfDisastersId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.phasesOfDisasters.id'],
          regex: regexPattern.listIds
        }),
        FromContentProductionDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToContentProductionDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
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
          if (communicationProductsGroupsId) {
            ValidateJoi.transStringToArray(data, 'communicationProductsGroupsId');
          }
          if (producersId) {
            ValidateJoi.transStringToArray(data, 'producersId');
          }
          if (phasesOfDisastersId) {
            ValidateJoi.transStringToArray(data, 'phasesOfDisastersId');
          }
          if (disasterGroupsId) {
            ValidateJoi.transStringToArrayContentsDisasterGroupsId(data, 'disasterGroupsId');
          }
          if (targetAudiencesId) {
            ValidateJoi.transStringToArrayContentsTargetAudiencesId(data, 'targetAudiencesId');
          }
          if (areasId) {
            ValidateJoi.transStringToArrayContentsAreasId(data, 'areasId');
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
  },
  authenUpdateShares: (req, res, next) => {
    // console.log("validate authenCreate")
    const {dateUpdated } = req.body;
    const userGroup = {dateUpdated };

    const SCHEMA =  ValidateJoi.assignSchema(DEFAULT_SCHEMA,{
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
  }
}
