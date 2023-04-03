import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  menuName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.name'],
  }),
  url: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.url'],
    allow: ['', null],
  }),
  icon: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.menus.icon'],
    allow: ['', null],
  }),
  menuParentId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.menus.parentId'],
  }),
  orderby: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.menus.orderBy'],

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
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
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

    const { menuName, url, icon, menuParentId, orderby,dateCreated,dateUpdated, status } = req.body;
    const menu = { menuName, url, icon, menuParentId, orderby, status,dateCreated,dateUpdated, userCreatorsId };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      menuName: {
        max: 500,
        required: noArguments
      },
      url: {
        max: 300,
      },
      menuParentId: {
        required: noArguments
      },
      orderby: {
        required: noArguments
      },
      userCreatorsId: {
        required: noArguments
      },
      status: {
        required: noArguments
      },
    });

    // console.log('input: ', input);
    ValidateJoi.validate(menu, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const { menuName, url, icon, menuParentId, orderby,dateCreated,dateUpdated, status} = req.body;
    const menu = { menuName, url, icon, menuParentId, orderby,dateCreated,dateUpdated, status};

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      menuName: {
        max: 500,
      },
      url: {
        max: 300,
      },
      // icon: {
      //   max: 20,
      // },
    });

    ValidateJoi.validate(menu, SCHEMA)
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
      const { id, menuName, url, menuParentId, orderby, status, userCreatorsId, FromDate, ToDate } = JSON.parse(filter);
      const menu = { id, menuName, url, menuParentId, orderby, status, userCreatorsId, FromDate, ToDate };

      // console.log(menu)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          any: noArguments,
          label: viMessage['api.menus.id'],
          // regex: /(^\d+(,\d+)*$)|(^\d*$)/
        }),
        ...DEFAULT_SCHEMA,
        menuParentId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.menus.parentId'],
          regex: regexPattern.listIds
        }),
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.usersCreatorId,
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
      ValidateJoi.validate(menu, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (userCreatorsId) {
            ValidateJoi.transStringToArray(data, 'userCreatorsId');
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
  authenUpdateOrder: (req, res, next) => {
    // console.log("validate authenUpdateOrder")

    const { orders } = req.body;
    const menu = { orders };

    const SCHEMA = {
      orders: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: viMessage['api.menus.orders'],
      })
    };

    ValidateJoi.validate(menu, SCHEMA)
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

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        required: noArguments
      }),
      dateUpdated:
      ValidateJoi.createSchemaProp({
        required: noArguments
      }),
      userCreatorsId: ValidateJoi.createSchemaProp({
        required: noArguments
      }),
    };


    ValidateJoi.validate(userGroup, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenBulkUpdate: async (req, res, next) => {
    try {
      console.log('validate authenBulkUpdate', req.query, req.body);
      const { filter } = req.query;
      const { status } = req.body;
      const menu = { status };
      const { id } = JSON.parse(filter);
      const whereFilter = { id };


      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.menus.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
      };

      if (filter) {
        const { id } = JSON.parse(filter);

        await ValidateJoi.validate(whereFilter, SCHEMA)
          .then(data => {
            if (id) {
              ValidateJoi.transStringToArray(data, 'id');
            }
            res.locals.filter = data;

            console.log('locals.filter', res.locals.filter);

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
}
