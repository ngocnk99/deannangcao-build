import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import helperRename from '../helpers/lodashHelpers';
import witait from './witai/index';
const {
  sequelize,
  users,
  news,
  newspapers,
  newsUrlSlugs,
  disasters,
  disastersNews,
  configs,
  typeOfNews,
  newsTypeOfNews
} = models;

const addOrDeleteTypeOfNew = async param => {
  // try {
  console.log('param2', param);
  const newsId = param.newsId;
  const typeArray = param.typeArray;
  const old_newsTypeOfNews = await MODELS.findAll(newsTypeOfNews, {
    where: {
      newsId: newsId
    }
  });

  const new_newsTypeOfNews = typeArray.map(type => {
    return {
      newsId: newsId,
      typeOfNewsId: type
    };
  });

  const deleteType = old_newsTypeOfNews.filter(
    oldType =>
      !new_newsTypeOfNews.find(newType => {
        return oldType.newsId == newType.newsId && oldType.typeOfNewsId == newType.typeOfNewsId;
      }, oldType)
  );

  const createType = new_newsTypeOfNews.filter(
    newType =>
      !old_newsTypeOfNews.find(oldType => {
        return oldType.newsId == newType.newsId && oldType.typeOfNewsId == newType.typeOfNewsId;
      }, newType)
  );

  console.log('delete', deleteType);
  console.log('createType', createType);
  if (createType.length > 0) {
    createType.forEach(element => {
      MODELS.create(newsTypeOfNews, element);
    });
  }
  if (deleteType.length > 0) {
    deleteType.forEach(element => {
      MODELS.destroy(newsTypeOfNews, {
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
        console.log('filter', filter);
        let whereFilter = _.omit(filter, ['disasterVndmsId', 'typeOfNewsId', 'isReports']);
        let reportWhereFilter = _.pick(filter, ['isReports']);
        let typeOfNewsWhereFilter = _.pick(filter, ['typeOfNewsId']);
        let disastersWhereFilter = _.pick(filter, ['disasterVndmsId']); // helperRename.rename(_.pick(filter,['disastersId']),[['disasterVndmsId', 'disastersId']]);
        // helperRename.rename(typeOfNewsWhereFilter, [['typeOfNewsId', 'id']]);
        console.log('disastersWhereFilter', disastersWhereFilter);
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

        let attfinal;

        if (attributes) {
          attfinal = [
            ...att,
            [sequelize.literal('fn_disastersByNewsId(news.id)'), 'disasters'],
            [sequelize.literal('fn_typeOfNewsByNewsId(news.id)'), 'typeOfNews'],
            [sequelize.literal('fn_reports_byNewsId(news.id)'), 'reports']
          ];
        } else {
          attfinal = {
            include: [
              [sequelize.literal('fn_disastersByNewsId(news.id)'), 'disasters'],
              [sequelize.literal('fn_typeOfNewsByNewsId(news.id)'), 'typeOfNews'],
              [sequelize.literal('fn_reports_byNewsId(news.id)'), 'reports']
            ]
          };
        }

        whereFilter = await filterHelpers.makeStringFilterRelatively(['newsTitle'], whereFilter, 'news');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }
        let sql = '';

        if (disastersWhereFilter.disasterVndmsId) {
          sql +=
            'exists (select * from disastersNews where disastersNews.newsId= news.id and disastersNews.disastersId in (' +
            disastersWhereFilter.disasterVndmsId +
            '))';
        }
        console.log('whereFilter 1==================', whereFilter);
        if (typeOfNewsWhereFilter.typeOfNewsId) {
          if (sql !== '') {
            sql += ' and ';
          }
          sql +=
            'exists (select * from newsTypeOfNews where newsTypeOfNews.newsId= news.id and newsTypeOfNews.typeOfNewsId in (' +
            typeOfNewsWhereFilter.typeOfNewsId +
            '))';
        }
        console.log('typeOfNewsWhereFilter.isReports-=', reportWhereFilter.isReports);
        if (Number(reportWhereFilter.isReports) === 1) {
          if (sql !== '') {
            sql += ' and ';
          }
          sql += ' exists (select id from reportsNews where newsId=news.id)';
        }

        if (Number(reportWhereFilter.isReports) === 0) {
          if (sql !== '') {
            sql += ' and ';
          }
          sql += ' not exists (select id from reportsNews where newsId=news.id)';
        }

        whereFilter = {
          ...whereFilter,
          ...{
            $and: sequelize.literal(sql)
          }
        };
        console.log('whereFilter ==================', whereFilter);
        let require = Object.keys(typeOfNewsWhereFilter).length === 0 ? false : true;
        console.log('require', require);
        console.log('where', whereFilter);
        console.log('vào sort', disastersWhereFilter);
        MODELS.findAndCountAll(news, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          subQuery: false,
          logging: console.log,
          attributes: attfinal,
          include: [
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
            },
            {
              model: users,
              as: 'userApproveds',
              attributes: ['id', 'username', 'fullname']
            },
            {
              model: newspapers,
              as: 'newspapers',
              attributes: ['id', 'newspaperName', 'newspaperUrl'],
              required: true
            }
            // {
            //   model: disastersNews,
            //   as: 'disastersNews',
            //   attributes: ['id', 'disastersId', 'newsId'],
            //   include:[
            //     {
            //       model: disasters, as :'disasters',attributes: ['disasterVndmsId', 'disasterName'],required:true,
            //     }
            //   ],
            //   required: true,// _.isEmpty(disastersWhereFilter) ? false : true,
            //   where: disastersWhereFilter
            // },
            // {
            //   model: disasters,
            //   as: 'disasters',
            //   attributes: ['id', 'disasterName', 'disasterVndmsId', 'disasterGroupsId', 'disasterLevel'],
            //   required: _.isEmpty(disastersWhereFilter) ? false : true,
            //   where: disastersWhereFilter
            // },
            // {
            //   model: newsTypeOfNews,
            //   as: 'newsTypeOfNews',
            //   attributes: ['id', 'newsId', 'typeOfNewsId'],
            //   include:[
            //     {
            //       model: typeOfNews, as :'typeOfNews',attributes: ['id', 'typeOfNewName'],required:true,
            //     }
            //   ],
            //   required: true,// _.isEmpty(typeOfNewsWhereFilter) ? false : true,
            //   where: typeOfNewsWhereFilter
            // }

            // {
            //   model: typeOfNews,
            //   as: 'typeOfNews',
            //   attributes: ['id', 'typeOfNewName', 'typeOfNewParentId'],
            //   required: _.isEmpty(typeOfNewsWhereFilter) ? false : true,
            //   where: typeOfNewsWhereFilter
            // }
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

        MODELS.findOne(news, {
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
              model: users,
              as: 'userApproveds',
              attributes: ['id', 'username', 'fullname']
            },
            {
              model: newspapers,
              as: 'newspapers',
              attributes: ['id', 'newspaperName', 'newspaperUrl'],
              required: true
            },
            {
              model: newsUrlSlugs,
              as: 'newsUrlSlugs',
              attributes: ['id', 'urlSlug'],
              required: true
            },
            {
              model: disasters,
              as: 'disasters',
              attributes: ['id', 'disasterName', 'disasterVndmsId', 'disasterGroupsId', 'disasterLevel']
            },
            {
              model: typeOfNews,
              as: 'typeOfNews',
              attributes: ['id', 'typeOfNewName', 'typeOfNewParentId'],
              required: false
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
      const negativeKeyword = await MODELS.findOne(configs, {
        where: { id: 1 }
      });
      let manualUpdate = 1;

      finnalyResult = await MODELS.create(news, { ...entity, manualUpdate: manualUpdate }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      const resultNewsSlugs = sequelize.query('call sp_news_urlSlugs(:in_newsId, :in_urlSlug)', {
        replacements: {
          in_newsId: finnalyResult.id || 0,
          in_urlSlug: entity.url || ''
        },
        type: sequelize.QueryTypes.SELECT
      });
      //thêm vào thiên tai
      console.log('entity.disastersNews', entity.disastersNews);
      if (entity.disastersNews) {
        _.each(entity.disastersNews, function(object) {
          if (Number(object.flag) === 1) {
            MODELS.createOrUpdate(
              disastersNews,
              {
                ..._.pick(object, ['disastersId', 'newsId']),
                ...{ newsId: finnalyResult.id }
              },
              {
                where: { id: object.id }
              }
            );
          } else {
            MODELS.destroy(disastersNews, {
              where: { id: object.id }
            });
          }
        });
      }
      if (entity.typeOfNewsListId) {
        addOrDeleteTypeOfNew({
          newsId: finnalyResult.id,
          typeArray: entity.typeOfNewsListId
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
      ErrorHelpers.errorThrow(error, 'crudError', 'newsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('DistrictService update: ', entity);
      await MODELS.update(news, entity, { where: { id: parseInt(param.id) } }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (entity.url) {
        const resultArticleSlugs = sequelize.query('call sp_news_urlSlugs(:in_newsId, :in_urlSlug)', {
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
      if (entity.disastersNews) {
        _.each(entity.disastersNews, function(object) {
          if (Number(object.flag) === 1) {
            MODELS.createOrUpdate(
              disastersNews,
              {
                ..._.pick(object, ['disastersId', 'newsId']),
                ...{ newsId: finnalyResult.id }
              },
              {
                where: { id: object.id }
              }
            );
          } else {
            MODELS.destroy(disastersNews, {
              where: { id: object.id }
            });
          }
        });
      }
      if (entity.typeOfNewsListId) {
        addOrDeleteTypeOfNew({
          newsId: finnalyResult.id,
          typeArray: entity.typeOfNewsListId
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
            if (entity.invalid === true) {
              witait.train([
                {
                  text: findEntity.newsTitle,
                  entities: [],
                  traits: []
                }
              ]);
            }
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
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
    }),
  get_list_for_web: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = _.omit(filter, ['url']);
        let whereFilterurlSlugs;

        if (_.pick(filter, ['url']).url) {
          whereFilterurlSlugs = {
            $and: sequelize.literal(
              "EXISTS (select id from newsUrlSlugs as t where t.urlSlug='" +
                _.pick(filter, ['url']).url +
                "' and t.newsId=news.id)"
            )
          };
          console.log('whereFilterurlSlugs', whereFilterurlSlugs);
        }
        console.log(filter);
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

        whereFilter = await filterHelpers.makeStringFilterRelatively(['newsTitle'], whereFilter, 'news');

        if (!whereFilter) {
          whereFilter = { ..._.omit(filter, ['url']) };
        }
        if (whereFilterurlSlugs) whereFilter = { ...whereFilter, ...whereFilterurlSlugs };

        console.log('where', whereFilter);
        console.log('vào sort', sort);
        MODELS.findAndCountAll(news, {
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
              model: users,
              as: 'userApproveds',
              attributes: ['id', 'username', 'fullname']
            },
            {
              model: newspapers,
              as: 'newspapers',
              attributes: ['id', 'newspaperName', 'newspaperUrl', 'type']
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
    })
};
