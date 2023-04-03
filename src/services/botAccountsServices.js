/* eslint-disable camelcase */
import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import _ from 'lodash';
const { /* sequelize, */ botAccounts, users, botTrackedObject, botTypeOfTrackedObject } = models;

const addOrDeleteTrackedObject = async param => {
  // try {
  const botAccountsId = param.botAccountsId;
  const botTrackedObjectListId = param.botTrackedObjectListId;
  const delete_link_account_trackedObject = await MODELS.findAll(botTrackedObject, {
    where: {
      botAccountsId: botAccountsId,
      id: {
        $notIn: botTrackedObjectListId
      }
    }
  }).catch(err => {
    console.log('err', err);
  });
  const update_link_account_trackedObject = await MODELS.findAll(botTrackedObject, {
    where: {
      id: {
        $in: botTrackedObjectListId
      }
    }
  }).catch(err => {
    console.log('err', err);
  });

  if (delete_link_account_trackedObject.length > 0) {
    delete_link_account_trackedObject.forEach(element => {
      MODELS.update(
        botTrackedObject,
        {
          botAccountsId: null,
          isSpecified: 1
        },
        {
          where: {
            id: element.dataValues.id
          }
        }
      );
    });
  }

  if (botTrackedObjectListId.length > 0) {
    update_link_account_trackedObject.forEach(element => {
      let isJoin = element.dataValues.isJoin;

      if (
        (Number(element.dataValues.trackedObjectType) === 3 || Number(element.dataValues.trackedObjectType) === 4) &&
        Number(element.dataValues.botAccountsId) !== botAccountsId
      ) {
        isJoin = 0;
      }

      MODELS.update(
        botTrackedObject,
        {
          botAccountsId: botAccountsId,
          isSpecified: 1,
          isJoin: isJoin
        },
        {
          where: {
            id: element.dataValues.id
          }
        }
      );
    });
  }
};

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = _.omit(filter, ['botTrackedObjectListId']);
        const botTrackedObjectListId = filter.botTrackedObjectListId;
        let whereBotTrackedObject = {};

        if (botTrackedObjectListId && botTrackedObjectListId.length > 0) {
          whereBotTrackedObject = {
            id: {
              $in: botTrackedObjectListId
            }
          };
        }

        console.log('botTrackedObjectListId', botTrackedObjectListId);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['userName'], whereFilter, 'botAccounts');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(botAccounts, {
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
              attributes: ['id', 'username', 'fullname'],
              required: true
            },
            {
              model: botTrackedObject,
              as: 'botTrackedObject',
              attributes: [
                'id',
                'trackedObjectId',
                'trackedObjectName',
                'trackedObjectType',
                'isJoin',
                'trackedObjectUrl'
              ],
              include: [
                {
                  model: botTypeOfTrackedObject,
                  as: 'botTypeOfTrackedObject',
                  attributes: ['id', 'botTypeOfTrackedObjectName', 'botTypeOfTrackedObjectIcon']
                  // required: true
                }
              ],
              required: _.isEmpty(whereBotTrackedObject) ? false : true,
              where: whereBotTrackedObject
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'botAccountsServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'botAccountsServices'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(botAccounts, {
          where: { id },
          attributes: att,
          include: [
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
            },
            {
              model: botTrackedObject,
              as: 'botTrackedObject',
              attributes: [
                'id',
                'trackedObjectId',
                'trackedObjectName',
                'trackedObjectType',
                'isJoin',
                'trackedObjectUrl'
              ],
              include: [
                {
                  model: botTypeOfTrackedObject,
                  as: 'botTypeOfTrackedObject',
                  attributes: ['id', 'botTypeOfTrackedObjectName', 'botTypeOfTrackedObjectIcon'],
                  required: true
                }
              ]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'botAccountsServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'botAccountsServices'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('botAccountsService create: ', entity);
      const whereFilter = {
        userName: entity.userName
      };

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(botAccounts, {
              where: whereFilter
            }),
            entity.userName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.botAccounts.userName' }
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
      finnalyResult = await MODELS.create(botAccounts, param.entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });
      console.log('entity.botTrackedObjectListId', entity.botTrackedObjectListId);
      if (entity.botTrackedObjectListId) {
        addOrDeleteTrackedObject({
          botAccountsId: finnalyResult.id,
          botTrackedObjectListId: entity.botTrackedObjectListId
        });
      }
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'botAccountsServices');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      const whereFilter = {
        id: { $ne: param.id },
        userName: entity.userName
      };

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(botAccounts, {
              where: whereFilter
            }),
            entity.userName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.botAccounts.userName' }
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
      await MODELS.update(botAccounts, entity, { where: { id: parseInt(param.id) } }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      finnalyResult = await MODELS.findOne(botAccounts, {
        where: { id: param.id }
      });
      if (entity.botTrackedObjectListId) {
        addOrDeleteTrackedObject({
          botAccountsId: finnalyResult.id,
          botTrackedObjectListId: entity.botTrackedObjectListId
        });
      }
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterEditError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'botAccountsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(botAccounts, {
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
              MODELS.update(botAccounts, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(botAccounts, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'botAccountsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'botAccountsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'botAccountsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'botAccountsService'));
      }
    }),
  moveTrackedObject: async param => {
    let finnalyResult;

    try {
      const { FromBotAccountId, ToBotAccountId } = param.entity;

      console.log('DistrictService update: ', FromBotAccountId, ToBotAccountId);
      const infoArr = Array.from(
        await Promise.all([
          MODELS.findOne(botAccounts, {
            where: { id: FromBotAccountId },
            include: [
              {
                model: botTrackedObject,
                as: 'botTrackedObject',
                attributes: ['id', 'botAccountsId']
              }
            ]
          }),
          MODELS.findOne(botAccounts, {
            where: { id: ToBotAccountId }
          })
        ])
      );

      if (!infoArr || !infoArr[0] || !infoArr[1]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error: 'err',
          message: 'Id bot account không tồn tại'
        });
      }

      finnalyResult = await Promise.all(
        infoArr[0].botTrackedObject.map(async element => {
          console.log('element', element.botAccountsId, element.id);
          const a = await MODELS.update(
            botTrackedObject,
            { botAccountsId: ToBotAccountId },
            { where: { id: element.id } }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          return a;
        })
      );
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'botAccountsService');
    }

    return { result: finnalyResult };
  }
};
