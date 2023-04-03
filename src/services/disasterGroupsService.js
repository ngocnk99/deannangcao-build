import MODELS from '../models/models'
// import provinceModel from '../models/provinces'
import models from '../entity/index'
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import _ from 'lodash';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { /* sequelize, */users,disasterGroups } = models;

export default {
  get_list: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, range, sort, attributes } = param;
      let whereFilter = filter;

      console.log(filter);
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        reject(error);
      }

      const perPage = (range[1] - range[0]) + 1
      const page = Math.floor(range[0] / perPage);
      const att = filterHelpers.atrributesHelper(attributes);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['disasterGroupName'], whereFilter, 'disasterGroups');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      MODELS.findAndCountAll(disasterGroups,{
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        distinct: true,
        attributes: att,
        include: [
          {
            model: users,
            as: 'userCreators',
            attributes: ["id", "username", "fullname"],
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
        reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
    }
  }),
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id
      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      MODELS.findOne(disasterGroups,{
        where: { id },
        attributes: att,
        include: [
          {
            model: users,
            as: 'userCreators',
            attributes: ["id", "username", "fullname"],
            required: true
          },
       ]
      }).then(result => {
        if (!result) {
          reject(new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          }));
        }
        resolve(result)

      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'))
    }
  }),
  createOrUpdate: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("DistrictService create: ", entity);
      let whereFilter = {
        disasterGroupVndmsId: entity.disasterGroupVndmsId
      }

      // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['disasterGroupName'], whereFilter, 'disasterGroups');
      
      finnalyResult = await MODELS.createOrUpdate(disasterGroups,param.entity,
          {
            where: whereFilter
          } 
        ).catch(error => {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
        }));
      });

      if (!finnalyResult) {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError'],
        }));
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("DistrictService create: ", entity);
      let whereFilter = {
        disasterGroupName: entity.disasterGroupName
      }

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['disasterGroupName'], whereFilter, 'disasterGroups');

      const infoArr = Array.from(await Promise.all([
        preCheckHelpers.createPromiseCheckNew(MODELS.findOne(disasterGroups, {
          where: whereFilter
        })
         , entity.disasterGroupName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.disasterGroups.disasterGroupName' }
        ),
        // preCheckHelpers.createPromiseCheckNew(MODELS.findOne(disasterGroups, {
        //   where: {
        //       disasterGroupVndmsId: entity.disasterGroupVndmsId
        //   }
        // })
        //  , entity.disasterGroupVndmsId ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
        //   { parent: 'api.disasterGroups.disasterGroupVndmsId' }
        // ),
      ]));

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        })
      }

      finnalyResult = await MODELS.create(disasterGroups,param.entity).catch(error => {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
        }));
      });

      if (!finnalyResult) {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError'],
        }));
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("DistrictService update: ", entity)

      const foundGateway = await MODELS.findOne(disasterGroups,{
        where: {
          id: param.id
        }
      }).catch(error => { throw preCheckHelpers.createErrorCheck({ typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'districts' } }, error) });

      if (foundGateway) {
        let whereFilter = {
          disasterGroupVndmsId: { $ne: entity.disasterGroupVndmsId },
          disasterGroupName: entity.disasterGroupName || foundGateway.disasterGroupName
        }

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['disasterGroupName'], whereFilter, 'disasterGroups');

        const infoArr = Array.from(await Promise.all([
          preCheckHelpers.createPromiseCheckNew(MODELS.findOne(disasterGroups,
            {
              where: whereFilter
            })
            , entity.disasterGroupName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.disasterGroups.disasterGroupName'}
          ),
          // preCheckHelpers.createPromiseCheckNew(MODELS.findOne(disasterGroups, {
          //   where: {
          //     id: { $ne: param.id },
          //       disasterGroupVndmsId: entity.disasterGroupVndmsId
          //   }
          // })
          //  , entity.disasterGroupVndmsId ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
          //   { parent: 'api.disasterGroups.disasterGroupVndmsId' }
          // ),

        ]));

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          })
        }

        await MODELS.update(disasterGroups,
          entity,
          { where: { id: parseInt(param.id) } }
        ).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        finnalyResult = await MODELS.findOne(disasterGroups,{ where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update_status: param => new Promise((resolve, reject) => {
    try {
      // console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      MODELS.findOne(disasterGroups,
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
          MODELS.update(disasterGroups,
            entity
            ,
            {
              where:{id: id}
            }).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(disasterGroups,{ where: { id: param.id } }).then(result => {
              if (!result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else resolve({ status: 1,result: result });
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'))
            });
          }).catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'))
          })
        }
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'))
    }
  }),
  delete: param => new Promise((resolve, reject) => {
    try {
      console.log('delete id', param.id);
      const id = param.id;

      MODELS.findOne(disasterGroups,
        {
          where: {
            id
          }
        }
      ).then(findEntity => {
        // console.log("findPlace: ", findPlace)
        if (!findEntity) {
          reject(new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          }));
        } else {
          MODELS.destroy(disasterGroups,
            { where: { id: Number(param.id) } }
          ).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(disasterGroups,{ where: { id: param.id } }).then(result => {
              if (result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else resolve({ status: 1 });
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'))
            });
          }).catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'))
          })
        }
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'))
    }
  }),
}
