/* eslint-disable require-jsdoc */
import Joi from '../utils/joi/lib/index';
import models from '../entity/index'
import _ from 'lodash';

const noArguments = { noArguments : true };
const {  sequelize } = models;
export { noArguments, Joi };

/**
 *
 */
export default class ValidateJoi {

  /**
   *
   * @param {*} schema
   * @param {*} updates
   */
  static assignSchema(schema, updates) {
    const copySchema = _.assign({}, schema);
    // console.log(schema);
    // console.log(updates);

    _.forIn(updates, (v, k) => {
      copySchema[k] = Object.keys(v).reduce(
        (schemaProp, opsK) => {
          // console.log("opsK: %o , schemaProp: %o, schemaProp[opsK]: %o", opsK, schemaProp, schemaProp[opsK])
          return v[opsK] === noArguments ? schemaProp[opsK]() : schemaProp[opsK](v[opsK])
        }
        , copySchema[k]);
    });

    return copySchema;
  }

  /**
   *
   * @param {*} options
   */
  static createSchemaProp(options) {

    // console.log('options',options);

    return Object.keys(options).reduce((r, k) => options[k] === noArguments ? r[k]() : r[k](options[k])
    , Joi);
  }

  /**
   *
   * @param {*} objectSchemas
   */
  static createArraySchema(objectSchemas) {
    return Joi.array().items(objectSchemas);
  }

  /**
   *
   * @param {*} object
   */
  static createObjectSchema(object) {
    return Joi.object(object);
  }

  /**
   * Utility helper for Joi validation.
   *
   * @param   {object}  data
   * @param   {object}  schema
   * @returns {Promise}
   */
  static validate(data, schema) {
    data = _.pickBy(data, (prop) => prop !== undefined);

    return Joi.validate(data, schema, { abortEarly: false }, err => {

      if (err) {
        return Promise.reject(err);
      }

      return Promise.resolve(data);
    });
  }

  /**
   *
   * @param {*} obj
   * @param {*} key
   */
  static transStringToArray(obj, key) {
    const arr = obj[key].split(',');

    if (arr.length === 1) {
      obj[key] = parseInt(obj[key]);
    } else {
      obj[key] = arr.map(n => parseInt(n));
      obj[key] = {
        "$in": obj[key]
      };
    }

    return obj;
  }


  static transStringToExcludedArray(obj, key) {
    const arr = obj[key].split(',');

    if (arr.length === 1) {
      obj[key] = [parseInt(obj[key])]
    } else {
      obj[key] = arr.map(n => parseInt(n));
    }
    obj[key] = {
      "$notIn": obj[key]
    };

    return obj;
  }

    /**
   *
   * @param {*} obj
   * @param {*} key
   */
  static StransStringToArray(obj, key) {
    const arr = obj[key].split(',');

    if (arr.length === 1) {
      //obj[key] = parseInt(obj[key]);
    } else {
      obj[key] = arr.map(n => n);
      obj[key] = {
        "$in": obj[key]
      };
    }

    return obj;
  }

   /**
   *
   * @param {*} obj
   * @param {*} key
   */
  static ArticleGetByCategoriesParentToArray(obj, key) {
    const arr = obj[key].split(',');

    if (arr.length === 1) {
      obj[key] = { "$or": sequelize.literal("EXISTS (select id from categories as t where (t.parentId in ("+obj[key]+") or t.id in ("+obj[key]+")) and t.id =article.categoriesId)")
      }
    } else {
      obj[key] = arr.map(n => n);
      obj[key] = {
        "$or": sequelize.literal("EXISTS (select id from categories as t where (t.parentId in ("+obj[key]+") or t.id in ("+obj[key]+")) and t.id =article.categoriesId)")
      };
    }
    return obj;
  }

  static TemplateGetByTemplateGroupParentToArray(obj, key) {
    const arr = obj[key].split(',');

    if (arr.length === 1) {
      obj[key] = { "$or": sequelize.literal("EXISTS (select id from templateGroups as t where (t.parentId in ("+obj[key]+") or t.id in ("+obj[key]+")) and t.id =templates.templateGroupsId)")
      }
    } else {
      obj[key] = arr.map(n => n);
      obj[key] = {
        "$or": sequelize.literal("EXISTS (select id from templateGroups as t where (t.parentId in ("+obj[key]+") or t.id in ("+obj[key]+")) and t.id =templates.templateGroupsId)")
      };
    }
    return obj;
  }

  /**
   *
   * @param {*} obj
   * @param {*} key
   */

  static transStringToArrayContentsAreasId(obj, key) {
    const arr = obj[key].split(',');

    if (arr.length >= 1) {
      obj[key] = { "$and": sequelize.literal("EXISTS (select contentAreas.id from contentAreas where contentAreas.areasId in ("+obj[key]+") and contentAreas.contentsId=contents.id)")
      }
    }

    return obj;
  }

   /**
   *
   * @param {*} obj
   * @param {*} key
   */

  static transStringToArrayContentsTargetAudiencesId(obj, key) {
    const arr = obj[key].split(',');

    if (arr.length >= 1) {
      obj[key] = { "$and": sequelize.literal("EXISTS (select contentTargetAudiences.id from contentTargetAudiences where contentTargetAudiences.targetAudiencesId in ("+obj[key]+") and contentTargetAudiences.contentsId=contents.id)")
      }
    }

    return obj;
  }
  static transStringToArrayContentsDisasterGroupsId(obj, key) {
    const arr = obj[key].split(',');

    if (arr.length >= 1) {
      obj[key] = { "$and": sequelize.literal("EXISTS (select contentDisasterGroups.id from contentDisasterGroups where contentDisasterGroups.disasterGroupsId in ("+obj[key]+") and contentDisasterGroups.contentsId=contents.id)")
      }
    }

    return obj;
  }
}
