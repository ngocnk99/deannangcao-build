import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import _ from 'lodash';

const { /* sequelize, */ disastersContents, contents, users, disasters, disasterGroups, producers, news } = models;

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

        whereFilter = await filterHelpers.makeStringFilterRelatively(['disasterName'], whereFilter, 'disasters');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(disasters, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att,
          include: [
            {
              model: disasterGroups,
              as: 'disasterGroups',
              attributes: ['id', 'disasterGroupName'],
              required: true
            },
            {
              model: disastersContents,
              as: 'disastersContents',
              include: [
                {
                  model: contents,
                  as: 'contents',
                  attributes: ['id', 'contentName', 'contentImages', 'contentFiles']
                }
              ]
            },
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('disasters get_one param: %o | id: ', param, param.id);
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(disasters, {
          where: { id },
          attributes: att,
          logging: console.log,
          include: [
            {
              model: disasterGroups,
              as: 'disasterGroups',
              attributes: ['id', 'disasterGroupName'],
              required: true
            },
            {
              model: disastersContents,
              as: 'disastersContents',
              include: [
                {
                  model: contents,
                  as: 'contents',
                  attributes: ['id', 'contentName', 'contentImages', 'contentFiles'],
                  include: [
                    {
                      model: producers,
                      as: 'producers',
                      attributes: ['id', 'producerName']
                    }
                  ]
                }
              ]
            },
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
            },
            {
              model: news,
              as: 'news',
              attributes: [
                'id',
                'newsTitle',
                'newsShortDescription',
                'newsAuthor',
                'newsSource',
                'image',
                'status',
                'dateCreated'
              ]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
      }
    }),
  get_one_vndms: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('disasters get_one param: %o | id: ', param, param.disasterVndmsId);
        const disasterVndmsId = param.disasterVndmsId;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(disasters, {
          where: { disasterVndmsId },
          attributes: att,
          logging: console.log,
          include: [
            {
              model: disasterGroups,
              as: 'disasterGroups',
              attributes: ['id', 'disasterGroupName'],
              required: true
            },
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService create: ', entity);
      let whereFilter = {
        disasterName: entity.disasterName
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['disasterName'], whereFilter, 'disasters');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(disasters, {
              where: whereFilter
            }),
            entity.disasterName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.disasters.disasterName' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(disasters, {
              where: {
                disasterVndmsId: entity.disasterVndmsId
              }
            }),
            entity.disasterVndmsId ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.disasters.disasterVndmsId' }
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

      finnalyResult = await MODELS.create(disasters, param.entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });
      // thêm provinces
      console.log('entity.disastersContentss=', entity.disastersContents);
      if (entity.disastersContents) {
        _.each(entity.disastersContents, function(object) {
          if (Number(object.flag) === 1) {
            MODELS.createOrUpdate(
              disastersContents,
              {
                ..._.pick(object, ['disastersId', 'contentsId']),
                ...{ disastersId: finnalyResult.id }
              },
              {
                where: { id: object.id }
              }
            );
          } else {
            MODELS.destroy(disastersContents, {
              where: { id: object.id }
            });
          }
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
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService update: ', entity);

      const foundGateway = await MODELS.findOne(disasters, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'disasters' } },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          disasterName: entity.disasterName || foundGateway.disasterName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['disasterName'], whereFilter, 'disasters');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(disasters, {
                where: whereFilter
              }),
              entity.disasterName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.disasters.disasterName' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(disasters, {
                where: {
                  id: { $ne: param.id },
                  disasterVndmsId: entity.disasterVndmsId
                }
              }),
              entity.disasterVndmsId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.disasters.disasterVndmsId' }
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

        await MODELS.update(disasters, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
        console.log('entity.disastersContents==', entity.disastersContents);
        if (entity.disastersContents) {
          _.each(entity.disastersContents, function(object) {
            let entityUpdate = {
              ..._.pick(object, ['disastersId', 'contentsId']),
              ...{ disastersId: param.id }
            };

            if (Number(object.flag) === 1) {
              MODELS.createOrUpdate(disastersContents, entityUpdate, {
                where: { id: object.id }
              });
            } else {
              MODELS.destroy(disastersContents, {
                where: { id: object.id }
              });
            }
          });
        }

        finnalyResult = await MODELS.findOne(disasters, { where: { id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError']
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(disasters, {
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
              MODELS.update(disasters, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(disasters, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    }),
  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        MODELS.findOne(disasters, {
          where: {
            id
          }
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
              MODELS.destroy(disasters, { where: { id: Number(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(disasters, { where: { id: param.id } })
                    .then(result => {
                      if (result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1 });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'));
      }
    })
};
