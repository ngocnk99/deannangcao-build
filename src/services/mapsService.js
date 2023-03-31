// import moment from 'moment'
import MODELS from '../models/models'
import models from '../entity/index'
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { /* sequelize, Op, */ users,maps, /* tblGatewayEntity, Roles */ } = models;

export default {
  get_list: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, range, sort, attributes } = param;
      let whereFilter = filter;
      const att = filterHelpers.atrributesHelper(attributes);

      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        reject(error);
      }

      const perPage = (range[1] - range[0]) + 1
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['mapName'], whereFilter, 'maps');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      MODELS.findAndCountAll(maps,{
        where: whereFilter,
        order: sort,
        attributes: att,
        offset: range[0],
        limit: perPage, 
        logging:console.log,
        include: [
          { model: users, as: 'userCreators',required:true, attributes: ['id','username','fullname'] },
        ]
      }).then(result => {
        resolve({
          ...result,
          page: page + 1,
          perPage
        })
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'))
    }
  }),
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id
      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      MODELS.findOne(maps,{
        where: { 'id': id },
        attributes: att,
        include: [
          { model: users, as: 'userCreators',required:true, attributes: ['id','username','fullname'] },
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
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'))
    }
  }),
  create: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;

     
     
      console.log("provinceModel create: ", entity)
      let whereFilter = {
        mapName: entity.mapName,
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['mapName'], whereFilter, 'maps');

      const dupProvince = await preCheckHelpers.createPromiseCheckNew(MODELS.findOne(maps,
        {
          where: whereFilter
        }), entity.mapName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.maps.name' }
      );

      if (!preCheckHelpers.check([dupProvince])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        })
      }

      finnalyResult = await MODELS.create(maps,entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'mapsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;


      const foundProvince = await MODELS.findOne(maps,{
        where: {
          id: param.id
        }
      }).catch((error) => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của lớp bản đồ thất bại!',
          error
        })
      });

      if (foundProvince) {
        let whereFilter = {
          id: { $ne: param.id },
          mapName: entity.mapName,
        }
        
        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['mapName'], whereFilter, 'maps');

        const dupProvince = await preCheckHelpers.createPromiseCheckNew(MODELS.findOne(maps
          ,{
            where: whereFilter
          })
          , entity.mapName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.maps.name' }
        );

        if (!preCheckHelpers.check([dupProvince])) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          })
        }

        await MODELS.update(maps,
          entity,
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        finnalyResult = await MODELS.findOne(maps,{ where: { id: param.id } }).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại',
            error,
          }));
        })

        if (!finnalyResult) {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại'
          }));
        }

      } 
      else {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
        }));
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'ProvinceService');
    }

    return { result: finnalyResult };
  },
  update_status: param => new Promise((resolve, reject) => {
    try {
      console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      MODELS.findOne(maps,
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
          MODELS.update(maps,
            entity
            ,
            {
              where:{id: id}
            }).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(maps,{ where: { id: param.id } }).then(result => {
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
