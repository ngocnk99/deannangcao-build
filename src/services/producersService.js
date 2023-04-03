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

const { /* sequelize, */ users,producers} = models;

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

      whereFilter = await filterHelpers.makeStringFilterRelatively(['producerName'], whereFilter, 'producers');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      MODELS.findAndCountAll(producers,{
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
        reject(ErrorHelpers.errorReject(err, 'getListError', 'producersService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'producersService'))
    }
  }),
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id
      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      MODELS.findOne(producers,{
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
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'producersService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'producersService'))
    }
  }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("producersService create: ", entity);
      let whereFilter = {
        producerName: entity.producerName
      }

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['producerName'], whereFilter, 'producers');

      const infoArr = Array.from(await Promise.all([
        preCheckHelpers.createPromiseCheckNew(MODELS.findOne(producers, {
            where: whereFilter
          })
          , entity.producerName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.producers.producerName' }
        ),

      ]));

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        })
      }

      finnalyResult = await MODELS.create(producers,param.entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'producersService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("DistrictService update: ", entity)

      const foundGateway = await MODELS.findOne(producers,{
        where: {
          id: param.id
        }
      }).catch(error => { throw preCheckHelpers.createErrorCheck({ typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'producers' } }, error) });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          producerName: entity.producerName || foundGateway.producerName,
        }

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['producerName'], whereFilter, 'producers');

        const infoArr = Array.from(await Promise.all([
          preCheckHelpers.createPromiseCheckNew(MODELS.findOne(producers,
            {
              where: whereFilter
            })
            , entity.producerName  ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.producers.producerName' }
          ),

        ]));

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          })
        }

        await MODELS.update(producers,
          entity,
          { where: { id: parseInt(param.id) } }
        ).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        finnalyResult = await MODELS.findOne(producers,
          {
            where: { id: param.id }
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
      ErrorHelpers.errorThrow(error, 'crudError', 'producersService');
    }

    return { result: finnalyResult };
  },
  update_status: param => new Promise((resolve, reject) => {
    try {
      // console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      MODELS.findOne(producers,
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
          MODELS.update(producers,
            entity
            ,
            {
              where:{id: id}
            }).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(producers,{ where: { id: param.id } }).then(result => {
              if (!result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else resolve({ status: 1,result: result });
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'crudError', 'producersService'))
            });
          }).catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'producersService'))
          })
        }
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'producersService'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'producersService'))
    }
  }),
}
