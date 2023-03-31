import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort, parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  id: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.socialChannels.id']
  }),
  socialChannelName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.socialChannels.socialChannelName']
  }),
  socialsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.socialChannels.socialsId']
  }),
  socialChannelType: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.socialChannels.socialChannelType']
  }),
  socialChannelImages: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.socialChannels.socialChannelImages'],
    allow: ['', null]
  }),
  socialChannelUrl: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.socialChannels.socialChannelUrl'],
    allow: ['', null]
  }),
  socialChannelToken: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.socialChannels.socialChannelToken']
  }),
  socialChannelTokenExpired: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.socialChannels.socialChannelTokenExpired'],
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
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    let {
      socialChannelName,
      socialChannelImages,
      socialsId,
      socialChannelType,
      socialChannelUrl,
      socialChannelToken,
      socialChannelTokenExpired,
      status,
      dateCreated,
      dateUpdated
    } = req.body;

    if (!socialChannelTokenExpired) socialChannelTokenExpired = null;

    const socialChannel = {
      socialChannelName,
      socialChannelImages,
      socialsId,
      socialChannelType,
      socialChannelUrl,
      socialChannelToken,
      socialChannelTokenExpired,
      status,
      dateCreated,
      dateUpdated,
      userCreatorsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        socialChannelName: {
          max: 200,
          required: noArguments
        },
        socialsId: {
          required: noArguments
        },
        socialChannelType: {
          required: noArguments
        },
        socialChannelToken: {
          max: 1000,
          required: noArguments
        },
        status: {
          required: noArguments
        }
      })
    );

    // console.log('input: ', input);
    ValidateJoi.validate(socialChannel, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    let {
      socialChannelName,
      socialChannelImages,
      socialsId,
      socialChannelType,
      socialChannelUrl,
      socialChannelToken,
      socialChannelTokenExpired,
      status,
      dateCreated,
      dateUpdated
    } = req.body;

    if (!socialChannelTokenExpired) socialChannelTokenExpired = null;

    const socialChannel = {
      socialChannelName,
      socialChannelImages,
      socialsId,
      socialChannelType,
      socialChannelUrl,
      socialChannelToken,
      socialChannelTokenExpired,
      status,
      dateCreated,
      dateUpdated
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        socialChannelName: {
          max: 200,
          // required: noArguments
        },
        socialsId: {
          // required: noArguments
        },
        socialChannelToken: {
          max: 1000,
          // required: noArguments
        },
        status: {
          // required: noArguments
        }
      })
    );

    ValidateJoi.validate(socialChannel, SCHEMA)
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
    let sortA = JSON.parse(sort);
    if (sortA && sortA[0] == 'socials.socialName') {
      res.locals.sort = [['socialsId', sortA[1]]];
    } else {
      res.locals.sort = parseSortVer2(sort, 'socialChannels');
    }

    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, socialChannelName, socialsId, socialChannelType, status, FromDate, ToDate } = JSON.parse(filter);
      const socialChannel = { id, socialChannelName, socialsId, status, socialChannelType, FromDate, ToDate };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.socialChannels.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        socialsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.socials.id'],
          regex: regexPattern.listIds
        }),
        socialChannelName: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.socialChannels.socialChannelName'],
          regex: regexPattern.name
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        }),
        FromDateUpdated: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDateUpdated: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(socialChannel, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (socialsId) {
            ValidateJoi.transStringToArray(data, 'socialsId');
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
  authen_GetAll: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, attributes, sort } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.attributes = attributes;

    if (filter) {
      const { id } = JSON.parse(filter);
      const province = { id };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.socialChannels.id'],
          regex: regexPattern.listIds
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(province, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
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
