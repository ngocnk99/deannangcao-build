import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
// import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
const { /* sequelize, */ botTypeOfTrackedObject } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = filter;

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['botTypeOfTrackedObjectName'],
          whereFilter,
          'botTypeOfTrackedObject'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(botTypeOfTrackedObject, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          attributes: att
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'botTypeOfTrackedObjectServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'botTypeOfTrackedObjectServices'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(botTypeOfTrackedObject, {
          where: { id },
          attributes: att
        })
          .then(result => {
            if (!result) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'botTypeOfTrackedObjectServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'botTypeOfTrackedObjectServices'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('botTypeOfTrackedObject Service create: ', entity);
      let whereFilter = {
        botTypeOfTrackedObjectName: entity.botTypeOfTrackedObjectName
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(
        ['botTypeOfTrackedObjectName'],
        whereFilter,
        'botTypeOfTrackedObject'
      );

      console.log('whereFilter====', whereFilter);
      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(botTypeOfTrackedObject, {
              where: whereFilter
            }),
            entity.botTypeOfTrackedObjectName || entity.botTypeOfTrackedObjectName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.botTypeOfTrackedObject.botTypeOfTrackedObjectName' }
          )
        ])
      );

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }

      finnalyResult = await MODELS.create(botTypeOfTrackedObject, param.entity).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'MenusService', 202);
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('botTypeOfTrackedObject Service update: ', entity);

      const foundMenu = await MODELS.findOne(botTypeOfTrackedObject, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'botTypeOfTrackedObject' } },
          error
        );
      });

      if (foundMenu) {
        let whereFilter = {
          id: { $ne: param.id },
          botTypeOfTrackedObjectName: entity.botTypeOfTrackedObjectName || foundMenu.botTypeOfTrackedObjectName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(
          ['botTypeOfTrackedObjectName'],
          whereFilter,
          'botTypeOfTrackedObject'
        );

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(botTypeOfTrackedObject, {
                where: whereFilter
              }),
              entity.botTypeOfTrackedObjectName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.botTypeOfTrackedObject.botTypeOfTrackedObjectName' }
            )
          ])
        );

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }

        await MODELS.update(botTypeOfTrackedObject, entity, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(botTypeOfTrackedObject, { where: { id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      console.log('error: ', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(botTypeOfTrackedObject, {
          where: {
            id
          },
          logging: console.log
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              MODELS.update(botTypeOfTrackedObject, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(botTypeOfTrackedObject, { where: { id: param.id } })
                    .then(result => {
                      if (!result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1, result: result });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'botTypeOfTrackedObjectService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'botTypeOfTrackedObjectService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'botTypeOfTrackedObjectService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'botTypeOfTrackedObjectService'));
      }
    })
};
