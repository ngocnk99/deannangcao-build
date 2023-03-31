import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  typeOfPostsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.botTypeOfPosts.typeOfPostsName']
  }),
  typeOfPostsParentId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.botTypeOfPosts.typeOfPostsParentId']
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
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  keywords: ValidateJoi.createSchemaProp({
    array: noArguments,
    label: viMessage['api.botTypeOfPosts.keywords']
  })
};

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;
    const { typeOfPostsName, typeOfPostsParentId, dateCreated, dateUpdated, status, keywords } = req.body;
    const menu = { typeOfPostsName, typeOfPostsParentId, dateCreated, dateUpdated, status, keywords, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      typeOfPostsName: {
        max: 200,
        required: true
      },
      status: {
        required: true
      }
    });

    // console.log('input: ', input);
    ValidateJoi.validate(menu, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { typeOfPostsName, typeOfPostsParentId, dateCreated, dateUpdated, status, keywords } = req.body;
    const menu = { typeOfPostsName, typeOfPostsParentId, dateCreated, dateUpdated, status, keywords };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      typeOfPostsName: {
        max: 200
      },
      status: {}
    });

    ValidateJoi.validate(menu, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, typeOfPostsName, typeOfPostsParentId, status, FromDate, ToDate } = JSON.parse(filter);
      const menu = { id, typeOfPostsName, typeOfPostsParentId, status, FromDate, ToDate };

      // console.log(menu)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          any: noArguments,
          label: viMessage['api.botTypeOfPosts.id']
          // regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,
        typeOfPostsParentId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.botTypeOfPosts.typeOfPostsParentId'],
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
      ValidateJoi.validate(menu, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (typeOfPostsParentId) {
            ValidateJoi.transStringToArray(data, 'typeOfPostsParentId');
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
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated, userCreatorsId };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        required: noArguments
      }),
      dateUpdated: ValidateJoi.createSchemaProp({
        required: noArguments
      }),
      userCreatorsId: ValidateJoi.createSchemaProp({
        required: noArguments
      })
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenBulkUpdate: async (req, res, next) => {
    try {
      const { filter } = req.query;
      const { status } = req.body;
      const menu = { status };
      const { id } = JSON.parse(filter);
      const whereFilter = { id };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.botTypeOfPosts.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA
      };

      if (filter) {
        const { id } = JSON.parse(filter);

        await ValidateJoi.validate(whereFilter, SCHEMA)
          .then(data => {
            if (id) {
              ValidateJoi.transStringToArray(data, 'id');
            }
            res.locals.filter = data;
          })

          .catch(error => {
            console.log(error);

            return next({ error, message: 'Định dạng gửi đi không đúng' });
          });
      }

      await ValidateJoi.validate(menu, SCHEMA)
        .then(data => {
          res.locals.body = data;

          console.log('locals.body', res.locals.body);
        })
        .catch(error => {
          console.log(error);

          return next({ error, message: 'Định dạng gửi đi không đúng' });
        });

      return next();
    } catch (error) {
      console.log(error);

      return next({ error });
    }
  }
};
