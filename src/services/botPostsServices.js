/* eslint-disable camelcase */
import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import _ from 'lodash';
import helperRename from '../helpers/lodashHelpers';
const {
  /* sequelize, */ botPosts,
  botTrackedObject,
  botTypeOfPosts,
  botPostsTypeOfPosts,
  botTypeOfTrackedObject
} = models;
const addOrDeleteTypeOfPost = async param => {
  // try {
  console.log('param2', param);
  const postsId = param.postsId;
  const typeArray = param.typeArray;
  const old_newsTypeOfNews = await MODELS.findAll(botPostsTypeOfPosts, {
    where: {
      postsId: postsId
    }
  });

  const new_postTypeOfPosts = typeArray.map(type => {
    return {
      postsId: postsId,
      typeOfPostsId: type
    };
  });

  const deleteType = old_newsTypeOfNews.filter(
    oldType =>
      !new_postTypeOfPosts.find(newType => {
        return (
          Number(oldType.postsId) === Number(newType.postsId) &&
          Number(oldType.typeOfPostsId) === Number(newType.typeOfPostsId)
        );
      }, oldType)
  );

  const createType = new_postTypeOfPosts.filter(
    newType =>
      !old_newsTypeOfNews.find(oldType => {
        return (
          Number(oldType.postsId) === Number(newType.postsId) &&
          Number(oldType.typeOfPostsId) === Number(newType.typeOfPostsId)
        );
      }, newType)
  );

  console.log('delete', deleteType);
  console.log('createType', createType);
  if (createType.length > 0) {
    createType.forEach(element => {
      MODELS.create(botPostsTypeOfPosts, element);
    });
  }
  if (deleteType.length > 0) {
    deleteType.forEach(element => {
      MODELS.destroy(botPostsTypeOfPosts, {
        where: {
          id: element.dataValues.id
        }
      });
    });
  }
};

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = _.omit(filter, ['typeOfPostsId']);
        const botTypeOfNewsWhereFilter = _.pick(filter, ['typeOfPostsId']);

        helperRename.rename(botTypeOfNewsWhereFilter, [['typeOfPostsId', 'id']]);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['postContent'], whereFilter, 'botPosts');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter, range[0], perPage);

        MODELS.findAndCountAll(botPosts, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att,
          include: [
            {
              model: botTrackedObject,
              as: 'placePost',
              attributes: ['id', 'trackedObjectId', 'trackedObjectName', 'trackedObjectType'],
              include: [
                {
                  model: botTypeOfTrackedObject,
                  as: 'botTypeOfTrackedObject',
                  attributes: ['id', 'botTypeOfTrackedObjectName', 'botTypeOfTrackedObjectIcon']
                  // required: true
                }
              ]
              // required: true
            },
            {
              model: botTrackedObject,
              as: 'author',
              attributes: ['id', 'trackedObjectId', 'trackedObjectName', 'trackedObjectType'],
              include: [
                {
                  model: botTypeOfTrackedObject,
                  as: 'botTypeOfTrackedObject',
                  attributes: ['id', 'botTypeOfTrackedObjectName', 'botTypeOfTrackedObjectIcon']
                  // required: true
                }
              ]
              // required: true
            },
            {
              model: botTypeOfPosts,
              as: 'botTypeOfPosts',
              attributes: ['id', 'typeOfPostsName', 'keywords', 'status'],
              required: _.isEmpty(botTypeOfNewsWhereFilter) ? false : true,
              where: botTypeOfNewsWhereFilter
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'botPostsServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'botPostsServices'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(botPosts, {
          where: { id },
          attributes: att,
          include: [
            {
              model: botTrackedObject,
              as: 'placePost',
              attributes: ['id', 'trackedObjectId', 'trackedObjectName', 'trackedObjectType'],
              include: [
                {
                  model: botTypeOfTrackedObject,
                  as: 'botTypeOfTrackedObject',
                  attributes: ['id', 'botTypeOfTrackedObjectName', 'botTypeOfTrackedObjectIcon']
                  // required: true
                }
              ]
              // required: true
            },
            {
              model: botTrackedObject,
              as: 'author',
              attributes: ['id', 'trackedObjectId', 'trackedObjectName', 'trackedObjectType'],
              include: [
                {
                  model: botTypeOfTrackedObject,
                  as: 'botTypeOfTrackedObject',
                  attributes: ['id', 'botTypeOfTrackedObjectName', 'botTypeOfTrackedObjectIcon']
                  // required: true
                }
              ]
              // required: true
            },
            {
              model: botTypeOfPosts,
              as: 'botTypeOfPosts',
              attributes: ['id', 'typeOfPostsName', 'keywords', 'status']
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'botPostsServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'botPostsServices'));
      }
    }),
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService update: ', entity);
      await MODELS.update(botPosts, entity, { where: { id: parseInt(param.id) } }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      finnalyResult = await MODELS.findOne(botPosts, {
        where: { id: param.id }
      });
      console.log('entity.botTypeOfPostListId', entity.botTypeOfPostListId);

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterEditError']
        });
      }
      if (entity.botTypeOfPostListId) {
        addOrDeleteTypeOfPost({
          postsId: finnalyResult.id,
          typeArray: entity.botTypeOfPostListId
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'botPostsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(botPosts, {
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
              MODELS.update(botPosts, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(botPosts, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'botPostsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'botPostsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'botPostsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'botPostsService'));
      }
    })
};
