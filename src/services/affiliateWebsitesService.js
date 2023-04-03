import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
// import _ from 'lodash';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { affiliateWebsites } = models;

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

        whereFilter = await filterHelpers.makeStringFilterRelatively(['affiliateWebsitesName'], whereFilter, 'affiliateWebsites');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(affiliateWebsites, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att
          // include: [
          //   {
          //     model: provinces,
          //     as: 'provinces',
          //     attributes: ['id', 'provincesName'],
          //     required: true
          //   }
          // ]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'affiliateWebsiteservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'affiliateWebsiteservice'));
      }
    }),

  get_one: param =>
    new Promise(async (resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        let id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['userCreatorsId']);

        if (isNaN(Number(id))) {
          const findByUrlSlug = await MODELS.findOne(affiliateWebsites, {
            where: { urlSlug: id },
            attributes: ['id']
          });

          if (!findByUrlSlug) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'getInfoError'
            });
          } else {
            id = findByUrlSlug.id;
          }
        }
        MODELS.findOne(affiliateWebsites, {
          where: { id },
          attributes: att
          // include: [
          //   {
          //     model: provinces,
          //     as: 'provinces',
          //     attributes: ['id', 'provincesName'],
          //     required: true
          //   }
          // ]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'affiliateWebsiteservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'affiliateWebsiteservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('affiliateWebsites create: ', entity);
      let whereFilter = {
        affiliateWebsitesName: entity.affiliateWebsitesName
      };

      
      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['affiliateWebsitesName'], whereFilter, 'affiliateWebsites');
      console.log('whereFilter',whereFilter)
      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew( 
            MODELS.findOne(affiliateWebsites, {
              attributes: ['id'],
              where: whereFilter
            }),
            entity.affiliateWebsitesName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.affiliateWebsites.affiliateWebsitesName' }
          ),
        ])
      );

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }

      finnalyResult = await MODELS.create(affiliateWebsites, entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'affiliateWebsiteservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('affiliateWebsiteservice update: ', entity);

      const foundGateway = await MODELS.findOne(affiliateWebsites, {
        where: {
          id: param.id
        }
      }).catch(error => {
        console.log(" vào catch MODELS.findOne")
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'affiliateWebsites' } },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          affiliateWebsitesName: entity.affiliateWebsitesName || foundGateway.affiliateWebsitesName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['affiliateWebsitesName'], whereFilter, 'affiliateWebsites');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(affiliateWebsites, {
                attributes: ['id'],
                where: whereFilter
              }),
              entity.affiliateWebsitesName || entity.provincesId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.affiliateWebsites.affiliateWebsitesName' }
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

        await MODELS.update(
          affiliateWebsites,
          { ...entity, dateUpdated: new Date() },
          { where: { id: parseInt(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(affiliateWebsites, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'affiliateWebsiteservice');
    }

    console.log("trước return ----------")
    
    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(affiliateWebsites, {
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
                affiliateWebsites,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(affiliateWebsites, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'affiliateWebsitesServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'affiliateWebsitesServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'affiliateWebsitesServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'affiliateWebsitesServices'));
      }
    }),
};
