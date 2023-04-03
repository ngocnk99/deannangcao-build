import MODELS from '../models/models';
// import provinceModel from '../models/provinces'
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
// import _ from 'lodash';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import _ from 'lodash';

const { photoInterviews, users, wards, districts, provinces } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = _.omit(filter, ['']);

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
          ['photoInterviewsName'],
          whereFilter,
          'photoInterviews'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(photoInterviews, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          attributes: att,
          include: [
            {
              model: wards,
              as: 'wards',
              attributes: ['id', 'wardName'],
              required: false
            },
            {
              model: districts,
              as: 'districts',
              attributes: ['id', 'districtName']
            },
            {
              model: provinces,
              as: 'provinces',
              attributes: ['id', 'provinceName']
            },
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'fullname', 'username'],
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'photoInterviewservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'photoInterviewservice'));
      }
    }),

  get_one: param =>
    new Promise(async (resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        let id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['userCreatorsId']);

        if (isNaN(Number(id))) {
          const findByUrlSlug = await MODELS.findOne(photoInterviews, {
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
        MODELS.findOne(photoInterviews, {
          where: { id },
          attributes: att,
          include: [
            {
              model: wards,
              as: 'wards',
              attributes: ['id', 'wardName'],
              required: false
            },
            {
              model: districts,
              as: 'districts',
              attributes: ['id', 'districtName']
            },
            {
              model: provinces,
              as: 'provinces',
              attributes: ['id', 'provinceName']
            },
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'fullname', 'username'],
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'photoInterviewservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'photoInterviewservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('photoInterviewservice create: ', entity);
      let whereFilter = {
        photoInterviewsName: entity.photoInterviewsName
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(
        ['photoInterviewsName'],
        whereFilter,
        'photoInterviews'
      );

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(photoInterviews, {
              attributes: ['id'],
              where: whereFilter
            }),
            entity.photoInterviewsName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.photoInterviews.photoInterviewsName' }
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

      finnalyResult = await MODELS.create(photoInterviews, entity).catch(error => {
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

      if (finnalyResult.urlSlug) {
        const checkDulicate = await MODELS.findOne(photoInterviews, {
          where: {
            id: { $ne: finnalyResult.id },
            urlSlug: finnalyResult.urlSlug
          }
        });

        if (checkDulicate) {
          await MODELS.update(
            photoInterviews,
            {
              urlSlug: finnalyResult + '-' + finnalyResult.id
            },
            {
              id: finnalyResult.id
            }
          );
        }
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'photoInterviewservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('photoInterviewservice update: ', entity);

      const foundGateway = await MODELS.findOne(photoInterviews, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'photoInterviews' } },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          photoInterviewsName: entity.photoInterviewsName || foundGateway.photoInterviewsName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(
          ['photoInterviewsName'],
          whereFilter,
          'photoInterviews'
        );

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(photoInterviews, {
                attributes: ['id'],
                where: whereFilter
              }),
              entity.photoInterviewsName || entity.provincesId ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.photoInterviews.photoInterviewsName' }
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

        if (entity.urlSlug && entity.urlSlug !== foundGateway.urlSlug) {
          const checkDulicate = await MODELS.findOne(photoInterviews, {
            where: {
              id: { $ne: finnalyResult.id },
              urlSlug: entity.urlSlug
            }
          });

          if (checkDulicate) {
            entity.urlSlug = entity.urlSlug + '-' + foundGateway.id;
          }
        }
        await MODELS.update(
          photoInterviews,
          { ...entity, dateUpdated: new Date() },
          { where: { id: parseInt(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(photoInterviews, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'photoInterviewservice');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(photoInterviews, {
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
                photoInterviews,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(photoInterviews, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'photoInterviewsServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'photoInterviewsServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'photoInterviewsServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'photoInterviewsServices'));
      }
    }),
  delete: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('delete id', param.id);
        const id = param.id;

        MODELS.findOne(photoInterviews, {
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
              MODELS.destroy(photoInterviews, { where: { id: Number(param.id) } })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(photoInterviews, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'photoInterviewservice'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'photoInterviewservice'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'photoInterviewservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'photoInterviewservice'));
      }
    }),
  bulk_create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('entity', entity);
      if (entity.photoInterviews) {
        finnalyResult = await Promise.all(
          entity.photoInterviews.map(element => {
            console.log('status', element.status);

            return MODELS.createOrUpdate(
              photoInterviews,
              {
                provincesId: entity.provincesId,
                photoInterviewsName: element.photoInterviewsName,
                userCreatorsId: entity.userCreatorsId,
                status: element.status,
                districtIdentificationCode: element.districtIdentificationCode
              },
              {
                where: { photoInterviewsName: element.photoInterviewsName, provincesId: entity.provincesId }
              }
            ).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });
          })
        );
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'WardService');
    }

    return { result: finnalyResult ? true : false };
  }
};
