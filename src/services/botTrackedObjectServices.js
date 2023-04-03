import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
const { /* sequelize, */ users, botTrackedObject, botAccounts, botTypeOfTrackedObject } = models;

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
          ['trackedObjectName', 'trackedObjectUrl'],
          whereFilter,
          'botTrackedObject'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(botTrackedObject, {
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
              attributes: ['id', 'username', 'fullname']
              // required: true
            },
            {
              model: botAccounts,
              as: 'botAccounts',
              attributes: ['id', 'userName']
              // required: true
            },
            {
              model: botTypeOfTrackedObject,
              as: 'botTypeOfTrackedObject',
              attributes: ['id', 'botTypeOfTrackedObjectName', 'botTypeOfTrackedObjectIcon']
              // required: true
            }
          ]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'botTrackedObjectServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'botTrackedObjectServices'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(botTrackedObject, {
          where: { id },
          attributes: att,
          include: [
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname']
              // required: true
            },
            {
              model: botAccounts,
              as: 'botAccounts',
              attributes: ['id', 'userName']
              // required: true
            },
            {
              model: botTypeOfTrackedObject,
              as: 'botTypeOfTrackedObject',
              attributes: ['id', 'botTypeOfTrackedObjectName', 'botTypeOfTrackedObjectIcon']
              // required: true
            }
          ]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'botTrackedObjectServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'botTrackedObjectServices'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const whereFilter = {
        trackedObjectId: entity.trackedObjectId
      };

      if (Number(param.entity.trackedObjectType) === 1 || Number(param.entity.trackedObjectType) === 2) {
        param.entity.isJoin = 1;
      }

      console.log('botTrackedObjectService create: ', param.entity);
      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(botTrackedObject, {
              where: whereFilter
            }),
            entity.trackedObjectId ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.botTrackedObject.trackedObjectId' }
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
      finnalyResult = await MODELS.create(botTrackedObject, { ...param.entity, isSpecified: 1 }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'botTrackedObjectServices');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      const whereFilter = {
        id: { $ne: param.id },
        trackedObjectId: entity.trackedObjectId
      };

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(botTrackedObject, {
              where: whereFilter
            }),
            entity.trackedObjectId ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.botTrackedObject.trackedObjectId' }
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
      console.log('DistrictService update: ', entity);
      await MODELS.update(botTrackedObject, { ...entity, isSpecified: 1 }, { where: { id: parseInt(param.id) } }).catch(
        error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        }
      );

      finnalyResult = await MODELS.findOne(botTrackedObject, {
        where: { id: param.id }
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterEditError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'botTrackedObjectService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(botTrackedObject, {
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
              MODELS.update(botTrackedObject, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(botTrackedObject, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'botTrackedObjectService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'botTrackedObjectService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'botTrackedObjectService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'botTrackedObjectService'));
      }
    })
};
