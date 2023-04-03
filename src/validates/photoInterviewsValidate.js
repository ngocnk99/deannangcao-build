/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

//  TODO id, photoInterviewsName, images, shortDescription, description, wardsId, points, images, shortDescription, description, wardsId, points, urlSlug, provincesIdId, provincesId, zone, provincesIdId, provincesId, zone
const DEFAULT_SCHEMA = {
  photoInterviewsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.photoInterviews.photoInterviewsName']
  }),
  urlSlug: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.photoInterviews.urlSlug']
  }),
  shortDescription: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.photoInterviews.shortDescription'],
    allow: [null, '']
  }),
  description: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.photoInterviews.description'],
    allow: [null, '']
  }),
  points: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.photoInterviews.points']
  }),
  wardsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.wards.id'],
    allow: [null]
  }),
  districtsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.district.id'],
    allow: [null]
  }),
  provincesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.provinces.id'],
    allow: [null]
  }),
  zone: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.photoInterviews.zone'],
    allow: [null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.userCreatorsId,
    allow: null
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateCreated
  })
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const {
      photoInterviewsName,
      images,
      shortDescription,
      description,
      wardsId,
      points,
      urlSlug,
      provincesIdId,
      provincesId,
      zone,
      status
    } = req.body;

    const photoInterviews = {
      photoInterviewsName,
      images,
      shortDescription,
      description,
      wardsId,
      points,
      urlSlug,
      provincesIdId,
      provincesId,
      zone,
      status,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      photoInterviewsName: {
        max: 200,
        required: noArguments
      },
      status: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(photoInterviews, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },

  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const {
      photoInterviewsName,
      images,
      shortDescription,
      description,
      wardsId,
      points,
      urlSlug,
      provincesIdId,
      provincesId,
      zone,
      status
    } = req.body;
    const photoInterviews = {
      photoInterviewsName,
      images,
      shortDescription,
      description,
      wardsId,
      points,
      urlSlug,
      provincesIdId,
      provincesId,
      zone,
      status
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      photoInterviewsName: {
        max: 200
      }
    });

    ValidateJoi.validate(photoInterviews, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => {
        next({ ...error, message: 'Định dạng gửi đi không đúng' });
      });
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const { status } = req.body;
    const userGroup = { status };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      })
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        photoInterviewsName,
        images,
        shortDescription,
        description,
        wardsId,
        points,
        urlSlug,
        provincesIdId,
        provincesId,
        zone,
        status,
        userCreatorsId,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const photoInterviews = {
        id,
        photoInterviewsName,
        images,
        shortDescription,
        description,
        wardsId,
        points,
        urlSlug,
        provincesIdId,
        provincesId,
        zone,
        status,
        userCreatorsId,
        FromDate,
        ToDate
      };

      console.log(photoInterviews);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.photoInterviews.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.userCreatorsId,
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
      ValidateJoi.validate(photoInterviews, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
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
