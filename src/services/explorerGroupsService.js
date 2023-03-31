import MODELS from '../models/models'
// import templateLayoutsModel from '../models/templateLayouts'
import models from '../entity/index'
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { /* sequelize, */ users,explorerGroups } = models;

export default {
  get_list: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, range, sort, attributes } = param;
      let whereFilter = filter;

      console.log("filter====",filter);
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        reject(error);
      }

      const perPage = (range[1] - range[0]) + 1
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['explorerGroupName'], whereFilter, 'explorerGroups');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      const att = filterHelpers.atrributesHelper(attributes);

      MODELS.findAndCountAll(explorerGroups,{
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        attributes: att,
        distinct: true,
        include: [
          {
            model: users,
            as: 'userCreators',
            attributes:['id','fullname','username'],
            /* where: whereGroupGateway, */
            required: true
          },
        ]
      }).then(result => {
        resolve({
          ...result,
          page: page + 1,
          perPage
        })
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'GroupUserService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'GroupUserService'))
    }
  }),
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id
      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      MODELS.findOne(explorerGroups,{
        where: { id },
        attributes: att,
        // include: [
        //   { model: Users, as: 'User' }
        // ]
      }).then(result => {
        if (!result) {
          reject(new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          }));
        }
        resolve(result)

      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'GroupUserService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'GroupUserService'))
    }
  }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("GroupUserService create: ", entity);
      let whereFilter = {
        explorerGroupName: entity.explorerGroupName,
      };
     
      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['explorerGroupName'], whereFilter, 'explorerGroups');

      const dupGroupUser = await preCheckHelpers.createPromiseCheckNew(MODELS.findOne(explorerGroups,{
            where: whereFilter
         })
        , entity.explorerGroupName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.explorerGroups.explorerGroupName' }
      );

      if (!preCheckHelpers.check([dupGroupUser])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        })
      }

      finnalyResult = await MODELS.create(explorerGroups,param.entity).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'GroupUserService', 202)
      });

      if (!finnalyResult) {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError'],
        }));
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'GroupUserService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("GroupUserService update: ", entity)


      const foundGateway = await MODELS.findOne(explorerGroups,{
        where: {
          id: param.id
        }
      }).catch(error => { throw preCheckHelpers.createErrorCheck({ typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'groupsUsers' } }, error) });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          explorerGroupName: entity.explorerGroupName,
        }
        
        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['explorerGroupName'], whereFilter, 'explorerGroups');
        console.log("whereFilter====",whereFilter)
        const dupGroupUser = await preCheckHelpers.createPromiseCheckNew(MODELS.findOne(explorerGroups,
          {
            where: whereFilter
          }), entity.explorerGroupName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.explorerGroups.explorerGroupName' }
        );

        if (!preCheckHelpers.check([dupGroupUser])) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          })
        }

        await MODELS.update(explorerGroups,
          entity,
          { where: { id: parseInt(param.id) } }
        ).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        finnalyResult = await MODELS.findOne(explorerGroups,{ where: { Id: param.id } }).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
            error,
          }));
        })

        if (!finnalyResult) {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
          }));
        }

      } else {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted'],
        }));
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'GroupUserService');
    }

    return { result: finnalyResult };
  },
  update_status: param => new Promise((resolve, reject) => {
    try {
      // console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      MODELS.findOne(explorerGroups,
        {
          where: {
            id
          },
          logging:console.log
        }
      ).then(findEntity => {
        // console.log("findPlace: ", findPlace)
        if (!findEntity) {
          reject(new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          }));
        } else {
          MODELS.update(explorerGroups,
            entity
            ,
            {
              where:{id: id}
            }).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(explorerGroups,{ where: { id: param.id } }).then(result => {
              if (!result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else resolve({ status: 1,result: result });
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'crudError', 'GroupUserService'))
            });
          }).catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'GroupUserService'))
          })
        }
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'GroupUserService'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'GroupUserService'))
    }
  }),
}
