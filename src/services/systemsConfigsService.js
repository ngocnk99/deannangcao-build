import MODELS from '../models/models'
import models from '../entity/index'
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { /* sequelize, Op, */ users,systemsConfigs, /* tblGatewayEntity, Roles */ } = models;

export default {
  
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id
      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      MODELS.findOne(systemsConfigs,{
        where: { 'id': id },
        attributes: att,
        // include: [
        //   { model: users, as: 'userCreators',required:true, attributes: ['id','username','fullname'] },
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
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'))
    }
  }),
  createOrUpdate: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;

     // console.log("provinceModel create: ", JSON.parse(entity.ftpServer))
      
      // entity  ={...entity,...{ftpServer:JSON.parse(entity.ftpServer)},...{mailServer:JSON.parse(entity.mailServer)}}
      console.log("provinceModel create entity:  ", entity)
      finnalyResult = await MODELS.createOrUpdate(systemsConfigs,entity,
        {
            where: {id: entity.id}
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
        }));
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'ProvinceService');
    }

    return { result: finnalyResult };
  },
  update_status: param => new Promise((resolve, reject) => {
    try {
      // console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      MODELS.findOne(systemsConfigs,
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
          MODELS.update(systemsConfigs,
            entity
            ,
            {
              where:{id: id}
            }).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(systemsConfigs,{ where: { id: param.id } }).then(result => {
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
}
