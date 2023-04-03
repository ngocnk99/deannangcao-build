import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const {
  users,
  contents,

  contentSocials,
  socialChannels,
  contentAreas,
  areas,
  contentTargetAudiences,
  targetAudiences,
  contentDisasterGroups,
  disasterGroups,
  socials,
  phasesOfDisasters,
  communicationProductsGroups,
  producers,
  contentReviews
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = filter;

        const whereAnd = [];

        console.log(filter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
          if (filter.FromContentProductionDate && filter.ToContentProductionDate) {
            whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter, 'contentProductionDate', [
              'FromContentProductionDate',
              'ToContentProductionDate'
            ]);
          }
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['contentName'], whereFilter, 'contents');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        let whereFilterdisasterGroupsId;

        if (whereFilter.disasterGroupsId) {
          whereFilterdisasterGroupsId = _.pick(whereFilter, ['disasterGroupsId']);
          whereFilter = _.omit(whereFilter, ['disasterGroupsId']);
          // whereFilter = { ...whereFilter, ...whereFilterriverBasinsId.riverBasinsId }
          whereAnd.push(whereFilterdisasterGroupsId.disasterGroupsId);
        }

        let whereFiltertargetAudiencesId;

        if (whereFilter.targetAudiencesId) {
          whereFiltertargetAudiencesId = _.pick(whereFilter, ['targetAudiencesId']);
          whereFilter = _.omit(whereFilter, ['targetAudiencesId']);
          // whereFilter = { ...whereFilter, ...whereFilterriverBasinsId.riverBasinsId }
          whereAnd.push(whereFiltertargetAudiencesId.targetAudiencesId);
        }

        let whereFilterareasIdId;

        if (whereFilter.areasId) {
          whereFilterareasIdId = _.pick(whereFilter, ['areasId']);
          whereFilter = _.omit(whereFilter, ['areasId']);
          // whereFilter = { ...whereFilter, ...whereFilterriverBasinsId.riverBasinsId }
          whereAnd.push(whereFilterareasIdId.areasId);
        }

        whereFilter = { ...whereFilter, ...{ $and: whereAnd } };

        console.log('where', whereFilter);

        MODELS.findAndCountAll(contents, {
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
              model: communicationProductsGroups,
              as: 'communicationProductsGroups',
              attributes: ['id', 'communicationProductsGroupName'],
              required: false
            },
            {
              model: producers,
              as: 'producers',
              attributes: ['id', 'producerName'],
              required: false
            },
            {
              model: phasesOfDisasters,
              as: 'phasesOfDisasters',
              attributes: ['id', 'phasesOfDisasterName'],
              required: false
            },
            {
              model: contentDisasterGroups,
              as: 'contentDisasterGroups',
              include: [
                {
                  model: disasterGroups,
                  as: 'disasterGroups',
                  attributes: ['id', 'disasterGroupName']
                }
              ]
            },
            {
              model: contentTargetAudiences,
              as: 'contentTargetAudiences',
              include: [
                {
                  model: targetAudiences,
                  as: 'targetAudiences',
                  attributes: ['id', 'targetAudienceName']
                }
              ]
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'contentsService'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        Promise.all([
          MODELS.findOne(contents, {
            where: { id },
            attributes: att,
            include: [
              {
                model: contentAreas,
                as: 'contentAreas',
                include: [
                  {
                    model: areas,
                    as: 'areas',
                    required: true,
                    attributes: ['id', 'areaName']
                  }
                ]
              },
              {
                model: contentDisasterGroups,
                as: 'contentDisasterGroups',
                include: [
                  {
                    model: disasterGroups,
                    as: 'disasterGroups',
                    required: true,
                    attributes: ['id', 'disasterGroupName']
                  }
                ]
              },
              {
                model: contentTargetAudiences,
                as: 'contentTargetAudiences',
                include: [
                  {
                    model: targetAudiences,
                    as: 'targetAudiences',
                    required: true,
                    attributes: ['id', 'targetAudienceName']
                  }
                ]
              },
              {
                model: communicationProductsGroups,
                as: 'communicationProductsGroups',
                attributes: ['id', 'communicationProductsGroupName'],
                required: true
              },
              {
                model: producers,
                as: 'producers',
                attributes: ['id', 'producerName'],
                required: true
              },
              {
                model: phasesOfDisasters,
                as: 'phasesOfDisasters',
                attributes: ['id', 'phasesOfDisasterName'],
                required: true
              },
              {
                model: users,
                as: 'userCreators',
                attributes: ['id', 'username', 'fullname'],
                required: true
              }
            ]
          }),
          MODELS.findAll(contentSocials, {
            attributes: ['contentSocialId', 'contentSocialLink'],

            include: [
              {
                model: contents,
                as: 'contents',
                attributes: [],
                through: {
                  attributes: []
                },
                where: { id }
              },
              {
                model: socialChannels,
                as: 'socialChannels',
                attributes: ['id', 'socialChannelName', 'socialChannelUrl'],
                include: [
                  {
                    model: socials,
                    as: 'socials',
                    attributes: ['socialName']
                  }
                ]
              }
            ]
          })
        ])
          .then(values => {
            if (!values[0]) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            resolve({ result: { ...values[0].dataValues, contentSocials: values[1] } });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentsService'));
      }
    }),
  get_one_for_web: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const { id, range, attributes } = param;
        const att = filterHelpers.atrributesHelper(attributes, ['usersCreatorId']);
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        Promise.all([
          MODELS.findOne(contents, {
            where: { id },
            attributes: att,
            include: [
              {
                model: contentAreas,
                as: 'contentAreas',
                include: [
                  {
                    model: areas,
                    as: 'areas',
                    required: true,
                    attributes: ['id', 'areaName']
                  }
                ]
              },
              {
                model: contentDisasterGroups,
                as: 'contentDisasterGroups',
                include: [
                  {
                    model: disasterGroups,
                    as: 'disasterGroups',
                    required: true,
                    attributes: ['id', 'disasterGroupName']
                  }
                ]
              },
              {
                model: contentTargetAudiences,
                as: 'contentTargetAudiences',
                include: [
                  {
                    model: targetAudiences,
                    as: 'targetAudiences',
                    required: true,
                    attributes: ['id', 'targetAudienceName']
                  }
                ]
              },
              {
                model: communicationProductsGroups,
                as: 'communicationProductsGroups',
                attributes: ['id', 'communicationProductsGroupName'],
                required: true
              },
              {
                model: producers,
                as: 'producers',
                attributes: ['id', 'producerName'],
                required: true
              },
              {
                model: phasesOfDisasters,
                as: 'phasesOfDisasters',
                attributes: ['id', 'phasesOfDisasterName'],
                required: true
              },
              {
                model: users,
                as: 'userCreators',
                attributes: ['id', 'username', 'fullname'],
                required: true
              },
              {
                model: contentReviews,
                as: 'contentReviews',
                where: { status: 1 },
                offset: range[0],
                limit: perPage,
                attributes: ['id', 'username', 'email', 'valueVoted', 'comment'],
                required: false
              }
            ]
          }),
          MODELS.increment(contents, { views: +1 }, { where: { id } })
        ])
          .then(values => {
            if (!values[0]) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            resolve({ result: { ...values[0].dataValues, page: page + 1, perPage } });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'contentsService'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('contentsService create: ', entity);
      let whereFilter = {
        contentName: entity.contentName
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['contentName'], whereFilter, 'contents');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(contents, {
              where: whereFilter
            }),
            entity.contentName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.contents.contentName' }
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

      finnalyResult = await MODELS.create(contents, param.entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      // thêm contentDisasterGroups
      console.log('entity.contentDisasterGroups=', entity.contentDisasterGroups);
      if (entity.contentDisasterGroups) {
        _.each(entity.contentDisasterGroups, function(object) {
          if (object.flag === 1) {
            MODELS.createOrUpdate(
              contentDisasterGroups,
              {
                ..._.pick(object, ['disasterGroupsId', 'contentsId']),
                ...{ contentsId: finnalyResult.id }
              },
              {
                where: { id: object.id }
              }
            );
          } else {
            MODELS.destroy(contentDisasterGroups, {
              where: { id: object.id }
            });
          }
        });
      }
      console.log('entity.contentAreas=', entity.contentAreas);
      if (entity.contentAreas) {
        _.each(entity.contentAreas, function(object) {
          if (object.flag === 1) {
            MODELS.createOrUpdate(
              contentAreas,
              {
                ..._.pick(object, ['areasId', 'contentsId']),
                ...{ contentsId: finnalyResult.id }
              },
              {
                where: { id: object.id }
              }
            );
          } else {
            MODELS.destroy(contentAreas, {
              where: { id: object.id }
            });
          }
        });
      }
      console.log('entity.contentTargetAudiences=', entity.contentTargetAudiences);
      if (entity.contentTargetAudiences) {
        _.each(entity.contentTargetAudiences, function(object) {
          if (object.flag === 1) {
            MODELS.createOrUpdate(
              contentTargetAudiences,
              {
                ..._.pick(object, ['targetAudiencesId', 'contentsId']),
                ...{ contentsId: finnalyResult.id }
              },
              {
                where: { id: object.id }
              }
            );
          } else {
            MODELS.destroy(contentTargetAudiences, {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'contentsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService update: ', entity);

      const foundGateway = await MODELS.findOne(contents, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'contents' } },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          contentName: entity.contentName || foundGateway.contentName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['contentName'], whereFilter, 'contents');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(contents, {
                where: whereFilter
              }),
              entity.contentName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.contents.contentName' }
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

        await MODELS.update(contents, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        // thêm contentDisasterGroups
        console.log('entity.contentDisasterGroups=', entity.contentDisasterGroups);
        if (entity.contentDisasterGroups) {
          _.each(entity.contentDisasterGroups, function(object) {
            if (object.flag === 1) {
              MODELS.createOrUpdate(
                contentDisasterGroups,
                {
                  ..._.pick(object, ['disasterGroupsId', 'contentsId']),
                  ...{ contentsId: param.id }
                },
                {
                  where: { id: object.id }
                }
              );
            } else {
              MODELS.destroy(contentDisasterGroups, {
                where: { id: object.id }
              });
            }
          });
        }
        console.log('entity.contentAreas=', entity.contentAreas);
        if (entity.contentAreas) {
          _.each(entity.contentAreas, function(object) {
            if (object.flag === 1) {
              MODELS.createOrUpdate(
                contentAreas,
                {
                  ..._.pick(object, ['areasId', 'contentsId']),
                  ...{ contentsId: param.id }
                },
                {
                  where: { id: object.id }
                }
              );
            } else {
              MODELS.destroy(contentAreas, {
                where: { id: object.id }
              });
            }
          });
        }
        console.log('entity.contentTargetAudiences=', entity.contentTargetAudiences);
        if (entity.contentTargetAudiences) {
          _.each(entity.contentTargetAudiences, function(object) {
            if (object.flag === 1) {
              MODELS.createOrUpdate(
                contentTargetAudiences,
                {
                  ..._.pick(object, ['targetAudiencesId', 'contentsId']),
                  ...{ contentsId: param.id }
                },
                {
                  where: { id: object.id }
                }
              );
            } else {
              MODELS.destroy(contentTargetAudiences, {
                where: { id: object.id }
              });
            }
          });
        }

        finnalyResult = await MODELS.findOne(contents, {
          where: { id: param.id },
          include: [
            {
              model: contentAreas,
              as: 'contentAreas',
              include: [
                {
                  model: areas,
                  as: 'areas',
                  required: true,
                  attributes: ['id', 'areaName']
                }
              ]
            },
            {
              model: contentDisasterGroups,
              as: 'contentDisasterGroups',
              include: [
                {
                  model: disasterGroups,
                  as: 'disasterGroups',
                  required: true,
                  attributes: ['id', 'disasterGroupName']
                }
              ]
            },
            {
              model: contentTargetAudiences,
              as: 'contentTargetAudiences',
              include: [
                {
                  model: targetAudiences,
                  as: 'targetAudiences',
                  required: true,
                  attributes: ['id', 'targetAudienceName']
                }
              ]
            }
          ]
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
      ErrorHelpers.errorThrow(error, 'crudError', 'contentsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(contents, {
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
              MODELS.update(contents, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(contents, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
      }
    }),
  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        MODELS.findOne(contents, {
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
              MODELS.destroy(contents, { where: { id: Number(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(contents, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
      }
    }),
  updateShares: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(contents, {
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
              MODELS.update(
                contents,
                { ...entity, shares: +findEntity.shares + 1 },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(contents, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentsService'));
      }
    })
};
