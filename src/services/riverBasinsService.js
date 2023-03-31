import MODELS from '../models/models'
import models from '../entity/index'
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import _ from 'lodash';

const { /* sequelize, Op, */ users,riverBasins, /* tblGatewayEntity, Roles */ } = models;

export default {
  get_list: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, range, sort, attributes } = param;
      console.log(sort);

      let whereFilter = filter;
      const att = filterHelpers.atrributesHelper(attributes);

      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        reject(error);
      }

      const perPage = (range[1] - range[0]) + 1
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['riverBasinName'], whereFilter, 'riverBasins');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      MODELS.findAndCountAll(riverBasins,{
        where: whereFilter,
        order: sort,
        attributes: att,
        offset: range[0],
        limit: perPage, distinct: true,
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
  get_list_multi: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, attributes } = param;
      let whereFilter = filter;
      const att = filterHelpers.atrributesHelper(attributes);
      console.log('where', whereFilter);
      MODELS.findAndCountAll(riverBasins,{
        where: whereFilter,
        attributes: ['points'],
        logging:console.log,
        include: [
          { model: users, as: 'userCreators',required:true, attributes: ['id','username','fullname'] },
        ]
      }).then(result => {
        if(result.count >0)
        {
          let points;
          let typePolygon=0;

          _.forEach(result.rows, function(item) {
            let itemPoints;

            if(item.dataValues.points.type==="MultiPolygon")
            {
              itemPoints = item.dataValues.points.coordinates;
              typePolygon =1;
            }
            else
            {
              itemPoints = [item.dataValues.points.coordinates]
            }

            if(points)
            {
              points=_.concat(points,itemPoints)
            }
            else{
              points=itemPoints
            }
            
          });
          // if( _.size(points) < 2 && typePolygon === 0)
          // {
          //   resolve(
          //     {
          //       "type": "Polygon",
          //       "coordinates":points
          //     }
          //   )
          // }
          // else{
            resolve(
              {
                "type": "MultiPolygon",
                "coordinates":points
              }
            )
          // }
        }
        else{
          resolve(
            {
            }
          )
        }
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

      MODELS.findOne(riverBasins,{
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

     
      if(entity.points && entity.points !=='' && entity.points !== null)
      {
        entity  ={...entity,...{points:JSON.parse(entity.points)}}
      }
      console.log("provinceModel create: ", entity)
      let whereFilter = {
        riverBasinName: entity.riverBasinName,
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['riverBasinName'], whereFilter, 'riverBasins');

      const dupProvince = await preCheckHelpers.createPromiseCheckNew(MODELS.findOne(riverBasins,
        {
          where: whereFilter
        }), entity.riverBasinName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.riverBasins.riverBasinName' }
      );

      if (!preCheckHelpers.check([dupProvince])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        })
      }

      finnalyResult = await MODELS.create(riverBasins,entity).catch(error => {
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
  update: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;

     console.log("Province update: ", JSON.parse(entity.points))

      if(entity.points && entity.points !=='' && entity.points !== null)
      {
        entity  ={...entity,...{points:JSON.parse(entity.points)}}
      }
      

      const foundProvince = await MODELS.findOne(riverBasins,{
        where: {
          id: param.id
        }
      }).catch((error) => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        })
      });

      if (foundProvince) {
        let whereFilter = {
          id: { $ne: param.id },
          riverBasinName: entity.riverBasinName,
        }
        
        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['riverBasinName'], whereFilter, 'riverBasins');

        const dupProvince = await preCheckHelpers.createPromiseCheckNew(MODELS.findOne(riverBasins
          ,{
            where: whereFilter
          })
          , entity.riverBasinName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.riverBasins.riverBasinName' }
        );

        if (!preCheckHelpers.check([dupProvince])) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          })
        }

        await MODELS.update(riverBasins,
          entity,
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        finnalyResult = await MODELS.findOne(riverBasins,{ where: { id: param.id } }).catch(error => {
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

      } else {
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
      // console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      MODELS.findOne(riverBasins,
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
          MODELS.update(riverBasins,
            entity
            ,
            {
              where:{id: id}
            }).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(riverBasins,{ where: { id: param.id } }).then(result => {
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
  delete: async param => {
    try {
      console.log('delete id', param.id);

      const foundProvince = await MODELS.findOne(riverBasins,{
        where: {
          "id": param.id
        }
      }).catch((error) => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error
        })
      });

      if (!foundProvince) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
        });
      } else {
        await MODELS.destroy(riverBasins,
          { where: { id: parseInt(param.id) } }
        );

        const provinceAfterDelete = await MODELS.findOne(riverBasins,{ where: { Id: param.id } })
          .catch(err => {
            ErrorHelpers.errorThrow(err, 'crudError', 'ProvinceService');
          });

        if (provinceAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError',
          });
        }
      }

    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'ProvinceService');
    }

    return { status: 1 };
  },
}
