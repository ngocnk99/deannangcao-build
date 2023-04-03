import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';

const DEFAULT_SCHEMA = {
  disasterName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.disasters.disasterName']
  }),
  disasterVndmsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasters.disasterVndmsId'],
    allow: [null]
  }),
  disasterGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasters.disasterGroupsId']
  }),
  disasterLongitude: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasters.disasterLongitude']
  }),
  disasterLatitude: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasters.disasterLatitude']
  }),
  disasterDescriptions: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.disasters.disasterDescriptions'],
    allow: ['', null]
  }),
  disasterLevel: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasters.disasterLevel']
  }),
  disasterIsClosed: ValidateJoi.createSchemaProp({
    boolean: noArguments,
    label: viMessage['api.disasters.disasterIsClosed']
  }),
  affectedArea: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.disasters.affectedArea'],
    allow: ['', null]
  }),
  disasterLevelOfRisk: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasters.disasterLevelOfRisk']
  }),
  disasterTimeStart: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.disasters.disasterTimeStart']
  }),
  disasterTimeEnd: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.disasters.disasterTimeEnd']
  }),
  huongDiChuyen: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.disasters.huongDiChuyen'],
    allow: ['', null]
  }),
  linkDetail: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.disasters.linkDetail'],
    allow: ['', null]
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
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
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  sourceType: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasterGroups.sourceType']
  }),
  disasterKeyword: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.disasters.disasterKeyword']
  })
};
const DEFAULT_SCHEMA_disastersContents = ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    id: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage.id
    }),
    disastersId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.disasters.id']
    }),
    contentsId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.contents.id']
    }),
    flag: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: 'cờ phân biệt Thêm-sửa/Xoá'
    })
  })
);

const DEFAULT_SCHEMA_disastersNews = ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    id: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage.id
    }),
    disastersId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.disasters.id']
    }),
    newsId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.news.id']
    }),
    flag: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: 'cờ phân biệt Thêm-sửa/Xoá'
    })
  })
);

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      disastersContents,
      disasterName,
      disasterVndmsId,
      disasterGroupsId,
      disasterLongitude,
      disasterLatitude,
      disasterDescriptions,
      disasterLevel,
      disasterIsClosed,
      affectedArea,
      disasterLevelOfRisk,
      disasterTimeStart,
      disasterTimeEnd,
      huongDiChuyen,
      linkDetail,
      dateCreated,
      dateUpdated,
      sourceType,
      disasterKeyword,
      status,
      disastersNews
    } = req.body;
    const district = {
      disastersContents,
      disasterName,
      disasterVndmsId,
      disasterGroupsId,
      disasterLongitude,
      disasterLatitude,
      disasterDescriptions,
      disasterLevel,
      disasterIsClosed,
      affectedArea,
      disasterLevelOfRisk,
      disasterTimeStart,
      disasterTimeEnd,
      huongDiChuyen,
      linkDetail,
      dateCreated,
      dateUpdated,
      sourceType,
      disasterKeyword,
      status,
      disastersNews,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        disasterName: {
          max: 300,
          required: noArguments
        }
      }),
      {
        disastersNews: DEFAULT_SCHEMA_disastersNews,
        disastersContents: DEFAULT_SCHEMA_disastersContents
      }
    );

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      disastersContents,
      disasterName,
      disasterVndmsId,
      disasterGroupsId,
      disasterLongitude,
      disasterLatitude,
      disasterDescriptions,
      disasterLevel,
      disasterIsClosed,
      affectedArea,
      disasterLevelOfRisk,
      disasterTimeStart,
      disasterTimeEnd,
      huongDiChuyen,
      linkDetail,
      dateCreated,
      disasterKeyword,
      dateUpdated,
      disastersNews,
      sourceType,
      status
    } = req.body;
    const district = {
      disastersContents,
      disasterName,
      disasterVndmsId,
      disasterGroupsId,
      disasterLongitude,
      disasterLatitude,
      disasterDescriptions,
      disasterLevel,
      disasterIsClosed,
      disastersNews,
      affectedArea,
      disasterLevelOfRisk,
      disasterTimeStart,
      disasterTimeEnd,
      huongDiChuyen,
      linkDetail,
      dateCreated,
      dateUpdated,
      disasterKeyword,
      sourceType,
      status
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        disasterName: {
          max: 300,
          // required: noArguments
        }
      }),
      {
        disastersContents: DEFAULT_SCHEMA_disastersContents,
        disastersNews: DEFAULT_SCHEMA_disastersNews
      }
    );

    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      },
      dateUpdated: {
        required: noArguments
      }
    });

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'disasters');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        disasterName,
        disasterVndmsId,
        disasterGroupsId,
        disasterIsClosed,
        sourceType,
        status,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const district = {
        id,
        disasterName,
        disasterVndmsId,
        disasterGroupsId,
        disasterIsClosed,
        sourceType,
        status,
        FromDate,
        ToDate
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.district.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        disasterVndmsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasters.disasterVndmsId'],
          regex: regexPattern.listIds
        }),
        disasterGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasters.disasterGroupsId'],
          regex: regexPattern.listIds
        }),
        sourceType: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasters.sourceType'],
          regex: regexPattern.listIds
        }),
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
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (disasterVndmsId) {
            ValidateJoi.transStringToArray(data, 'disasterVndmsId');
          }
          if (disasterGroupsId) {
            ValidateJoi.transStringToArray(data, 'disasterGroupsId');
          }
          if (sourceType) {
            ValidateJoi.transStringToArray(data, 'sourceType');
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
  },

  authenDashboardFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'disasters');
    res.locals.range = range ? JSON.parse(range) : [0, 10000];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        disasterVndmsId,
        type,
      } = JSON.parse(filter);
      const district = {
        disasterVndmsId,
        type,
      };

      // console.log(district)
      const SCHEMA = {
        disasterVndmsId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.disasters.disasterVndmsId'],
        }),
        type: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'Loại dữ liệu chi tiết',
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {

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
  },

  authenDashboardPublicFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;


    res.locals.sort = parseSortVer2(sort,'disasters');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {


      const {
        disasterVndmsId,
        type,
        token
      } = JSON.parse(filter);


      const district = {
        disasterVndmsId,
        type,
        token
      };

      // console.log(district)
      const SCHEMA = {
        disasterVndmsId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.disasters.disasterVndmsId'],
        }),
        type: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'Loại dữ liệu chi tiết',
        }),
        token: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: 'Token mã hoá',
        }),
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {

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
