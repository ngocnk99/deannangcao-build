import Promise from '../utils/promise.js';
import * as ApiErrors from '../errors';
import _ from 'lodash';

/**
 * ModelEntity Class
 */
class ModelEntity {
  /**
   *
   * @param {Model} model
   * @param {Object} options
   */
  static count(model, options) {
    return Promise.try(() => {
      return model.count(options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: model + 'Entity'
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {Object} options
   */
  static findAndCountAll(model, options) {
    return Promise.try(() => {
      return model.findAndCountAll(options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: model + 'Entity'
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {Object} entity
   * @param {Object} options
   */
  static create(model, entity, options = {}) {
    return Promise.try(() => {
      // console.log("entity in model: ", entity);

      return model.create(entity, options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudError',
        error,
        name: model + 'Entity'
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {Object} entity
   */
  // static createOrUpdate(model, entity) {
  //   return Promise.try(() => {
  //     console.log("entity in model: ", entity);
  //
  //     return model.createOrUpdate(entity);
  //   }).catch(error => {
  //     throw new ApiErrors.BaseError({
  //       statusCode: 202,
  //       type: 'crudError',
  //       error,
  //       name: model + 'Entity'
  //     });
  //   });
  // }

  /**
   *
   * @param {Object} model
   * @param {Object} entity
   * @param {Object} options
   */
  static bulkCreate(model, entity, options = {}) {
    return Promise.try(() => {
      return model.bulkCreate(entity, options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudError',
        error,
        name: 'ServicePackagesArticleEntity'
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {Object} entity
   * @param {Object} options
   */
  static update(model, entity, options) {
    return Promise.try(() => {
      return model.update(entity, options).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
          name: model + 'Entity'
        });
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {Object} options
   */
  static destroy(model, options) {
    return Promise.try(() => {
      return model.destroy(options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'deleteError',
        error,
        name: model + 'Entity'
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {Object} options
   */
  static findOne(model, options) {
    return Promise.try(() => {
      // console.log("findOne=== options=========",options)

      return model.findOne(options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getInfoError',
        error,
        name: model + 'Entity'
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {Object} options
   */
  static findAll(model, options) {
    return Promise.try(() => {
      // console.log("findAll=========",options)
      return model.findAll(options);
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: model + 'Entity'
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {*} options
   */
  static findOrCreate(model, options) {
    return Promise.try(() => {
      return model.findOrCreate(options);
      // .spread(async (findReportImExCreate, created) => {
    }).catch(error => {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: model + 'Entity'
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {Object} entity
   * @param {Object} options
   */
  static createOrUpdate(model, entity, options) {
    return new Promise((resolve, reject) => {
      console.log('options', options);

      const newOptions = _.omit(options, ['where']);

      console.log('newOptions', newOptions);

      return model
        .findOne(options)
        .then(foundItem => {
          if (!foundItem) {
            // console.log("tao moi==============")

            console.log('cre');

            return model
              .create(entity, newOptions)
              .then(data1 => {
                // console.log('item create: ', data1.dataValues);

                const output = {
                  item: data1.dataValues,
                  created: true
                };

                resolve(output);
              })
              .catch(error => {
                reject(error);
              });
          }

          return model
            .update(entity, options)
            .then(async data1 => {
              // console.log("update foundItem.id ",foundItem.id);
              await model
                .findOne({
                  where: {
                    id: foundItem.id
                  }
                })
                .then(data2 => {
                  // console.log('data find khi update 2: ');
                  // console.log('data find khi update: ', data2.dataValues);
                  const output = {
                    item: data2.dataValues,
                    created: false
                  };

                  resolve(output);
                })
                .catch(error => {
                  reject(error);
                });
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(error => {
          reject(error);
        });
      // .spread(async (findReportImExCreate, created) => {
    }).catch(error => {
      console.log('err4');
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getListError',
        error,
        name: model + 'Entity'
      });
    });
  }

  /**
   *
   * @param {Model} model
   * @param {Object} entity
   * @param {Object} options
   */
  static upsert(model, entity, options) {
    return Promise.try(() => {
      return model.upsert(entity, options).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
          name: model + 'Entity'
        });
      });
    });
  }
}

export default ModelEntity;
