import MenuService from '../services/menuService';
import models from '../entity';
import MODELS from '../models/models';
import logger from '../utils/logger';
import { codeMessage } from '../utils/index';
import { parseSort } from '../utils/helper';

const { userGroupRoles,userGroups, menus,users } = models;

export default app => {
  app.get('/api/c/auth_routes', async (req, res, next) => {
    try {
      const { getUserId } = require('../utils')
      const id = getUserId(req.headers['x-auth-key'])
      console.log("id",id)
      if (id === -9999) {
        res.send({
          result: null,
          success: false,
          errors: [],
          messages: []
        });

        return
      }
      // const userInfo = await userService.find({ id })
      let Obejctuser = await MODELS.findOne(users,
        {
          where:{id:id},
      }
      );

      console.log("Obejctuser",Obejctuser)

      console.log("req.auth: ", req.auth)
      const { sort, range, filter, filterChild } = req.query;
      const filterWithI18n = filter ? Object.assign(JSON.parse(filter)) : {};
      const param = {
        // sort: sort ? JSON.parse(sort) : [["parentId", "asc"], ["orderBy", "asc"]],
        sort: parseSort(sort),
        range: range ? JSON.parse(range) : [0,50],
        filter: filterWithI18n,
        filterChild: filterChild ? JSON.parse(filterChild) : { userGroupsId: Obejctuser.userGroupsId, isViewed: true },
        auth: req.auth
      }
     //  console.log(param);

      MenuService.get_menu(param).then(data => {
        console.log(data);
        res.send({
          result: {
            list: data.rows,
            pagination: {
              page: data.page,
              pageSize: data.perPage,
              total: data.count
            }
          },
          success: true,
          errors: [],
          messages: []
        });
      }).catch(err => {
        console.log("err: ", err)
        const { statusCode, code, error } = err;
        const { message } = new Error(error[0]);
        const messages = error.map(item => new Error(item).message);

        logger.error(messages.join(','));
        res.status(statusCode || 202).send({
          result: null,
          success: false,
          errors: [{ code, message }],
          messages
        });
      })
    } catch (error) {
      const code = 1500;
      const errCode = 202;
      const errMsg = new Error(error).message;

      logger.error(errMsg);
      res.status(errCode).send({
        result: [],
        pagination: {},
        success: false,
        errors: [{ code, message: codeMessage[code] }],
        messages: [errMsg]
      })
    }
  })

  app.get('/api/c/auth_roles', async (req, res) => {
    try {
      const { filter } = req.params;
      const { getUserId } = require('../utils')
      const id = getUserId(req.headers['x-auth-key'])
      console.log("id===",id)
      if (id === -9999) {
        res.send({
          result: null,
          success: false,
          errors: [],
          messages: []
        });

        return
      }
      console.log("auth_roles id: ", id)

      let Obejctuser = await MODELS.findOne(users,
        {
          where:{id:id},
      }
      );

      console.log("Obejctuser",Obejctuser)

      let filterWithI18n = filter ? Object.assign(JSON.parse(filter)) : {};

      filterWithI18n = {
        ...filterWithI18n,
        userGroupsId: Obejctuser.userGroupsId
      }
      const param = {
        where: filterWithI18n,
        order: [["id", "asc"]],
        include: [
          { model: menus, as: 'menus', require: true,  attributes: ['id', 'menuName'] }
        ],
        logging: console.log
      }

      MODELS.findAll(userGroupRoles,param).then(data => {
         console.log("auth_roles param: %o \n data: ", param, data)
        res.send({
          result: {
            list: data
          },
          success: true,
          errors: [],
          messages: []
        });

        return
      }).catch(error => {
        const code = 1500;
        const errCode = 500;
        const errMsg = new Error(error).message;

        logger.error(errMsg);
        res.status(errCode).send({
          result: null,
          success: false,
          errors: [{ code, message: codeMessage[code] }],
          messages: [errMsg]
        })
      })
    } catch (error) {
      const code = 1500;
      const errCode = 500;
      const errMsg = new Error(error).message;

      logger.error(errMsg);
      res.status(errCode).send({
        result: null,
        success: false,
        errors: [{ code, message: codeMessage[code] }],
        messages: [errMsg]
      })
    }
  })
}
