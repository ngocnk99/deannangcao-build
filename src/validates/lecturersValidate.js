/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

//  TODO id, lecturersName, image, position, description, wardsId, points, userCreatorsId, dateCreated, dateUpdated, status, urlSlug
const DEFAULT_SCHEMA = {
  lecturersName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.lecturers.lecturersName']
  }),
  urlSlug: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.lecturers.urlSlug']
  }),
  position: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.lecturers.position'],
    allow: [null, '']
  }),
  description: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.lecturers.description'],
    allow: [null, '']
  }),
  points: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.lecturers.points']
  }),
  wardsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.wards.id'],
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
      lecturersName,
      images,
      position,
      description,
      wardsId,
      points,
      urlSlug,

      status
    } = req.body;

    const lecturers = {
      lecturersName,
      images,
      position,
      description,
      wardsId,
      points,
      urlSlug,

      status,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      lecturersName: {
        max: 200,
        required: noArguments
      },
      status: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(lecturers, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },

  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const {
      lecturersName,
      images,
      position,
      description,
      wardsId,
      points,
      urlSlug,

      status
    } = req.body;
    const lecturers = {
      lecturersName,
      images,
      position,
      description,
      wardsId,
      points,
      urlSlug,

      status
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      lecturersName: {
        max: 200
      }
    });

    ValidateJoi.validate(lecturers, SCHEMA)
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
        lecturersName,

        position,

        wardsId,

        districtsId,
        provincesId,

        status,
        userCreatorsId,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const lecturers = {
        id,
        lecturersName,

        position,

        wardsId,

        districtsId,
        provincesId,

        status,
        userCreatorsId,
        FromDate,
        ToDate
      };

      console.log(lecturers);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.lecturers.id'],
          regex: regexPattern.listIds
        }),
        districtsId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.district.id']
        }),
        provincesId: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.provinces.id']
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
      ValidateJoi.validate(lecturers, SCHEMA)
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
