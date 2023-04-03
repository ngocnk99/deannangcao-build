/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

//  TODO id, affiliateWebsitesName,urlSlug, status
const DEFAULT_SCHEMA = {
  affiliateWebsitesName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.affiliateWebsites.affiliateWebsitesName']
  }),
//   urlSlug: ValidateJoi.createSchemaProp({
//     string: noArguments,
//     label: viMessage['api.affiliateWebsites.urlSlug']
//   }),
  image: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.affiliateWebsites.image']
  }),
  link: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.affiliateWebsites.link'],
    allow:['',null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['userCreatorsId'],
    allow: null
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.users.dateUpdated']
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.users.dateCreated']
  })
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    console.log(req.auth)
    // id, affiliateWebsitesName, image, link, userCreatorsId, dateCreated, dateUpdated, status
    const userCreatorsId = req.auth.userId;

    const { affiliateWebsitesName, image, link, status } = req.body;

    const affiliateWebsites = {
      affiliateWebsitesName,
      image,
      status,
      link,
      userCreatorsId
    };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      affiliateWebsitesName: {
        max: 500,
        required: noArguments
      },
      status: {
        required: noArguments
      },
      image: {
        required: noArguments
      },
      link: {
        required: noArguments
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(affiliateWebsites, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },

  authenUpdate: (req, res, next) => {
    console.log('validate authenUpdate');

    const { affiliateWebsitesName, image, link, status, userCreatorsId } = req.body;
    const affiliateWebsites = { affiliateWebsitesName, image, link, status, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      affiliateWebsitesName: {
        max: 500,
        required: noArguments
      },
      status: {
        required: noArguments
      },
      image: {
        required: noArguments
      },
      link: {
        required: noArguments
      }
    });

    ValidateJoi.validate(affiliateWebsites, SCHEMA)
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
      const { id, affiliateWebsitesName, urlSlug, status, userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
      const affiliateWebsites = { id, affiliateWebsitesName, urlSlug, status, userCreatorsId, FromDate, ToDate };

      console.log(affiliateWebsites);
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.affiliateWebsites.id'],
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
      ValidateJoi.validate(affiliateWebsites, SCHEMA)
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
