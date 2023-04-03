/* eslint-disable camelcase */
import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';

// import witait from './witai/index';

const {
  sequelize,
  users,
  news,
  newsUrlSlugs,
  newGroups
  // newspapers,
  // disasters,
  // disastersNews,
  // configs,
  // typeOfNews,
  // newsTypeOfNews
} = models;

// const addOrDeleteTypeOfNew = async param => {
//   // try {
//   console.log('param2', param);
//   const newsId = param.newsId;
//   const typeArray = param.typeArray;

//   const old_newsTypeOfNews = await MODELS.findAll(newsTypeOfNews, {
//     where: {
//       newsId: newsId
//     }
//   });

//   const new_newsTypeOfNews = typeArray.map(type => {
//     return {
//       newsId: newsId,
//       typeOfNewsId: type
//     };
//   });

//   const deleteType = old_newsTypeOfNews.filter(
//     oldType =>
//       !new_newsTypeOfNews.find(newType => {
//         return (
//           Number(oldType.newsId) === Number(newType.newsId) && Number(oldType.typeOfNewsId === newType.typeOfNewsId)
//         );
//       }, oldType)
//   );

//   const createType = new_newsTypeOfNews.filter(
//     newType =>
//       !old_newsTypeOfNews.find(oldType => {
//         return (
//           Number(oldType.newsId) === Number(newType.newsId) &&
//           Number(oldType.typeOfNewsId) === Number(newType.typeOfNewsId)
//         );
//       }, newType)
//   );

//   console.log('delete', deleteType);
//   console.log('createType', createType);
//   if (createType.length > 0) {
//     createType.forEach(element => {
//       MODELS.create(newsTypeOfNews, element);
//     });
//   }
//   if (deleteType.length > 0) {
//     deleteType.forEach(element => {
//       MODELS.destroy(newsTypeOfNews, {
//         where: {
//           id: element.dataValues.id
//         }
//       });
//     });
//   }
// };

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.omit(filter, ['disasterVndmsId', 'typeOfNewsId', 'isReports']);
        const reportWhereFilter = _.pick(filter, ['isReports']);
        const typeOfNewsWhereFilter = _.pick(filter, ['typeOfNewsId']);
        const disastersWhereFilter = _.pick(filter, ['disasterVndmsId']); // helperRename.rename(_.pick(filter,['disastersId']),[['disasterVndmsId', 'disastersId']]);
        // helperRename.rename(typeOfNewsWhereFilter, [['typeOfNewsId', 'id']]);

        console.log('typeOfNewsWhereFilter', typeOfNewsWhereFilter);
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter, 'dateUpdated', [
            'FromDateApproved',
            'ToDateApproved'
          ]);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        // if (attributes) {
        //   attfinal = [
        //     ...att,
        //     [sequelize.literal('fn_disastersByNewsId(news.id)'), 'disasters'],
        //     [sequelize.literal('fn_typeOfNewsByNewsId(news.id)'), 'typeOfNews'],
        //     [sequelize.literal('fn_reports_byNewsId(news.id)'), 'reports']
        //   ];
        // } else {
        //   attfinal = {
        //     include: [
        //       [sequelize.literal('fn_disastersByNewsId(news.id)'), 'disasters'],
        //       [sequelize.literal('fn_typeOfNewsByNewsId(news.id)'), 'typeOfNews'],
        //       [sequelize.literal('fn_reports_byNewsId(news.id)'), 'reports']
        //     ]
        //   };
        // }

        whereFilter = await filterHelpers.makeStringFilterRelatively(['newsTitle'], whereFilter, 'news');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('whereFilter 1==================', whereFilter);

        console.log('typeOfNewsWhereFilter.isReports-=', reportWhereFilter.isReports);

        console.log('whereFilter ==================', whereFilter);

        console.log('where', whereFilter);
        console.log('vào sort', disastersWhereFilter);
        MODELS.findAndCountAll(news, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          subQuery: false,
          logging: true,
          attributes: att,
          include: [
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
            },
            {
              model: newGroups,
              as: 'newGroups',
              attributes: ['id', 'newGroupsName'],
              where: { status: 1 },
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'newsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'newsService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        let where;

        if (!isNaN(Number(id))) {
          where = { id: id };
        } else {
          where = {
            $and: sequelize.literal(
              "EXISTS (select id from newsUrlSlugs as t where t.urlSlug='" + id + "' and t.newsId=news.id)"
            )
          };
        }
        console.log('where', where);
        MODELS.findOne(news, {
          where: { id: 1 },
          // attributes: att,
          logging: true,
          include: [
            // {
            //   model: users,
            //   as: 'userCreators',
            //   attributes: ['id', 'username', 'fullname'],
            //   required: true
            // },
            // {
            //   model: newsUrlSlugs,
            //   as: 'newsUrlSlugs',
            //   attributes: ['id', 'urlSlug'],
            //   required: true
            // },
            // {
            //   model: newGroups,
            //   as: 'newGroups'
            // }
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
            console.log('e2', err);
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'newsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'newsService'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('newsService create: ', entity);

      finnalyResult = await MODELS.create(news, { ...entity }).catch(error => {
        console.log('e', error);
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      await sequelize.query('call sp_news_urlSlugs(:in_newsId, :in_urlSlug)', {
        replacements: {
          in_newsId: finnalyResult.id || 0,
          in_urlSlug: entity.url || ''
        },
        type: sequelize.QueryTypes.SELECT
      });

      console.log('entity.disastersNews', entity.disastersNews);
      // if (entity.disastersNews) {
      //   _.each(entity.disastersNews, function(object) {
      //     if (Number(object.flag) === 1) {
      //       MODELS.createOrUpdate(
      //         disastersNews,
      //         {
      //           ..._.pick(object, ['disastersId', 'newsId']),
      //           ...{ newsId: finnalyResult.id }
      //         },
      //         {
      //           where: { id: object.id }
      //         }
      //       );
      //     } else {
      //       MODELS.destroy(disastersNews, {
      //         where: { id: object.id }
      //       });
      //     }
      //   });
      // }
      // if (entity.typeOfNewsListId) {
      //   addOrDeleteTypeOfNew({
      //     newsId: finnalyResult.id,
      //     typeArray: entity.typeOfNewsListId
      //   });
      // }
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'newsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService update: ', entity);
      entity.dateUpdated = new Date();
      await MODELS.update(news, entity, { where: { id: parseInt(param.id) } }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (entity.url) {
        await sequelize.query('call sp_news_urlSlugs(:in_newsId, :in_urlSlug)', {
          replacements: {
            in_newsId: param.id || 0,
            in_urlSlug: entity.url || ''
          },
          type: sequelize.QueryTypes.SELECT
        });
      }

      finnalyResult = await MODELS.findOne(news, {
        where: { id: param.id }
      });
      // thêm vào thiên tai
      // if (entity.disastersNews) {
      //   _.each(entity.disastersNews, function(object) {
      //     if (Number(object.flag) === 1) {
      //       MODELS.createOrUpdate(
      //         disastersNews,
      //         {
      //           ..._.pick(object, ['disastersId', 'newsId']),
      //           ...{ newsId: finnalyResult.id }
      //         },
      //         {
      //           where: { id: object.id }
      //         }
      //       );
      //     } else {
      //       MODELS.destroy(disastersNews, {
      //         where: { id: object.id }
      //       });
      //     }
      //   });
      // }
      // if (entity.typeOfNewsListId) {
      //   addOrDeleteTypeOfNew({
      //     newsId: finnalyResult.id,
      //     typeArray: entity.typeOfNewsListId
      //   });
      // }
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterEditError']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'newsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        console.log('en', entity);

        MODELS.findOne(news, {
          where: {
            id
          },
          logging: console.log
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            // if (entity.invalid === true) {
            //   witait.train([
            //     {
            //       text: findEntity.newsTitle,
            //       entities: [],
            //       traits: []
            //     }
            //   ]);
            // }
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              entity.dateUpdated = new Date();
              MODELS.update(news, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(news, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'newsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'newsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'newsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'newsService'));
      }
    })
};
