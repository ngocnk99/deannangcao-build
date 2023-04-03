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

const { /* sequelize, */ users,contentReviews, contents} = models;

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

      whereFilter = await filterHelpers.makeStringFilterRelatively(['username','email'], whereFilter, 'contentReviews');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      MODELS.findAndCountAll(contentReviews,{
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        distinct: true,
        attributes: att,
        include: [
          {
            model: contents,
            as: 'contents',
            attributes: ["id", "contentName"],
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
        reject(ErrorHelpers.errorReject(err, 'getListError', 'contentReviewsService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'contentReviewsService'))
    }
  }),
  get_list_for_web: param => new Promise(async (resolve, reject) => {
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

      whereFilter = await filterHelpers.makeStringFilterRelatively(['username','email'], whereFilter, 'contentReviews');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      MODELS.findAndCountAll(contentReviews,{
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        distinct: true,
        attributes: att
      }).then(result => {
        resolve({
          ...result,
          page: page + 1,
          perPage
        })
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'contentReviewsService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'contentReviewsService'))
    }
  }),


  get_one: param => new Promise((resolve, reject) => {
    try {
      console.log("disasters get_one param: %o | id: ", param, param.id)
      const { id, attributes} = param
      const att = filterHelpers.atrributesHelper(attributes);

      MODELS.findOne(contentReviews,{
        where: { id },
        attributes: att,
        logging:console.log,
        include: [
          {
            model: contents,
            as: 'contents',
            attributes:['id','contentName'],
            required: true
          }
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
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'))
    }
  }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("contentReviewsService create: ", entity);
      let whereFilter = {
        username: entity.username,
        email: entity.email
      }

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['username','email'], whereFilter, 'contentReviews');

      const found = await MODELS.findOne(contentReviews, {
        where: whereFilter,
        attributes: ['id']
      });

      if (found) {
        await MODELS.update(contentReviews, entity, {
          where: {
            id: found.id
          }
        }).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        finnalyResult = await MODELS.findOne(contentReviews, {where: {id: found.id}});
      } else {
        finnalyResult = await MODELS.create(contentReviews, entity).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });
      }

      if (!finnalyResult) {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError'],
        }));
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'contentReviewsService');
    }

    return { result: finnalyResult };
  },
  update_status: param => new Promise((resolve, reject) => {
    try {
      // console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      MODELS.findOne(contentReviews,
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
          MODELS.update(contentReviews,
            entity
            ,
            {
              where:{id: id}
            }).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(contentReviews,{ where: { id: param.id } }).then(result => {
              if (!result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else resolve({ status: 1,result: result });
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'crudError', 'contentReviewsService'))
            });
          }).catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'contentReviewsService'))
          })
        }
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentReviewsService'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentReviewsService'))
    }
  }),
  bulk_remove: param => new Promise((resolve, reject) => {
    try {
      console.log('param ===', param);

      MODELS.destroy(contentReviews,
        {
          where: param,
          logging:console.log
        }
      ).then(findEntity => {
        // console.log("findPlace: ", findPlace)
        resolve({result: findEntity});
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'contentReviewsService'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'contentReviewsService'))
    }
  })
}
