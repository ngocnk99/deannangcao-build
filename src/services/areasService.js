import MODELS from '../models/models'
// import provinceModel from '../models/provinces'
import models from '../entity/index'
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import helperRename from '../helpers/lodashHelpers';

const { /* sequelize, */ users,areas, areasProvinces,provinces} = models;

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

      whereFilter = await filterHelpers.makeStringFilterRelatively(['areaName'], whereFilter, 'areas');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      MODELS.findAndCountAll(areas,{
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
          {
            model:areasProvinces,
            as: 'areasProvinceses',
            include:[
              {
                model: provinces,
                as: 'provinces',
                // required:true,
                attributes:['id','provinceName']
              }
            ]
          },
        ]
      }).then(result => {
        resolve({
          ...result,
          page: page + 1,
          perPage
        })
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'areasService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'areasService'))
    }
  }),
  get_list_multi: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, attributes } = param;
      let whereFilter = filter;
      whereFilter =helperRename.rename(whereFilter,[['id', 'areasId']]);
      const att = filterHelpers.atrributesHelper(attributes);
      console.log('where', whereFilter);
      MODELS.findAndCountAll(areasProvinces,{
        where: whereFilter,
        attributes: ['id'],
        logging:console.log,
        include: [
          { model: provinces, as: 'provinces',required:true, attributes: ['points'] },
        ]
      }).then(result => {
       //  console.log("result===",JSON.stringify(result) )
         if(result.count >0)
        {
          let points;
          let typePolygon=0;

          _.forEach(result.rows, function(item) {
            // console.log("item.dataValues.provinces==",item)
             // _.forEach(item.dataValues.provinces,function(itemProvinces) {

             // console.log("sfdsfsfs========================",item)
                let itemPoints;

                if(item.dataValues.provinces.dataValues.points.type==="MultiPolygon")
                {
                  itemPoints = item.dataValues.provinces.dataValues.points.coordinates;
                  typePolygon =1;
                }
                else{
                  itemPoints = [item.dataValues.provinces.dataValues.points.coordinates]
                }

                if(points)
                {
                  console.log("concat points....")
                  points=_.concat(points,itemPoints)
                }
                else{
                  points=itemPoints
                }
            // });
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
        else
        {
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

      MODELS.findOne(areas,{
        where: { id },
        attributes: att,
        include: [
          {
            model:areasProvinces,
            as: 'areasProvinceses',
            include:[
              {
                model: provinces,
                as: 'provinces',
                required:true,
                attributes:['id','provinceName']
              }
            ]
          },
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
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'areasService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'areasService'))
    }
  }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("areasService create: ", entity);
      let whereFilter = {
        areaName: entity.areaName
      }

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['areaName'], whereFilter, 'areas');

      const infoArr = Array.from(await Promise.all([
        preCheckHelpers.createPromiseCheckNew(MODELS.findOne(areas, {
          where: whereFilter
        })
         , entity.areaName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.areas.areaName' }
        ),

      ]));

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        })
      }

      finnalyResult = await MODELS.create(areas,param.entity).catch(error => {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
        }));
      });

     // thêm provinces
     console.log("entity.areasProvinces=",entity.areasProvinceses)
     if(entity.areasProvinceses)
     {
       _.each(entity.areasProvinceses,function(object)
       {
           if(Number(object.flag) === 1)
           {
             MODELS.createOrUpdate(areasProvinces,
               {
                 ..._.pick(object,['provincesId','areasId']),...{areasId:finnalyResult.id}
               },
               {
                 where:{id: object.id} 
               }
             );
           }
           else{
             MODELS.destroy(areasProvinces,
               {
                 where:{id: object.id} 
               }
             );
           }
           
       })
     } 

      if (!finnalyResult) {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError'],
        }));
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'areasService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("DistrictService update: ", entity)

      const foundGateway = await MODELS.findOne(areas,{
        where: {
          id: param.id
        }
      }).catch(error => { throw preCheckHelpers.createErrorCheck({ typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'areas' } }, error) });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          areaName: entity.areaName || foundGateway.areaName,
        }

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['areaName'], whereFilter, 'areas');

        const infoArr = Array.from(await Promise.all([
          preCheckHelpers.createPromiseCheckNew(MODELS.findOne(areas,
            {
              where: whereFilter
            })
            , entity.areaName  ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.areas.areaName' }
          ),

        ]));

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          })
        }

        await MODELS.update(areas,
          entity,
          { where: { id: parseInt(param.id) } }
        ).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        if(entity.areasProvinceses)
        {
          _.each(entity.areasProvinceses,function(object)
          {
            console.log("object==",object.flag)
            if(Number(object.flag) === 1)
            {
              MODELS.createOrUpdate(areasProvinces,
                {
                  ..._.pick(object,['provincesId','areasId']),...{areasId:param.id }
                },
                {
                  where:{id: object.id} 
                }
              );
            }
            else{
              MODELS.destroy(areasProvinces,
                {
                  where:{id:object.id} 
                }
              );
            }
          })
        } 

        finnalyResult = await MODELS.findOne(areas,
          {
            where: { id: param.id },
            // include:[
            //   {
            //     model:areasProvinces,
            //     as: 'areasProvinceses',
            //     include:[
            //       {
            //         model: provinces,
            //         as: 'provinces',
            //         required:true,
            //         attributes:['id','provinceName']
            //       }
            //     ]
            //   }
            // ]

          }
          )

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
      ErrorHelpers.errorThrow(error, 'crudError', 'areasService');
    }

    return { result: finnalyResult };
  },
  update_status: param => new Promise((resolve, reject) => {
    try {
      // console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      MODELS.findOne(areas,
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
          MODELS.update(areas,
            entity
            ,
            {
              where:{id: id}
            }).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(areas,{ where: { id: param.id } }).then(result => {
              if (!result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else resolve({ status: 1,result: result });
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'crudError', 'areasService'))
            });
          }).catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'areasService'))
          })
        }
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'areasService'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'areasService'))
    }
  }),
  delete: param => new Promise((resolve, reject) => {
    try {
      console.log('delete id', param.id);
      const id = param.id;

      MODELS.findOne(areas,
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
          MODELS.destroy(areas,
            { where: { id: Number(param.id) } }
          ).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(areas,{ where: { id: param.id } }).then(result => {
              if (result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else resolve({ status: 1 });
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'crudError', 'areasService'))
            });
          }).catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'areasService'))
          })
        }
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'areasService'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'areasService'))
    }
  }),
}
