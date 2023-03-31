import MODELS from '../models/models';
// import sitesModel from '../models/sites'
import models from '../entity/index';
import _ from 'lodash';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
// import errorCode from '../utils/errorCode';
// import viMessage from '../locales/vi';
import * as ApiErrors from '../errors';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
// import logger from '../utils/logger';
import witai from './witai/index';

const { Op, users, newKindOfDisaster } = models;

const rename = str => {
  let str1 = str;

  str1 = str1.replace(/[\]\[\)\(-\+&,./?:';|-]/g, '');
  str1 = str1.replace(/[!=~@#$%^&*_{}"<>]/g, '');
  str1 = str1.replace(/–/g, '');
  str1 = str1.replace(/-/g, '');
  str1 = str1.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a');
  str1 = str1.replace(/[ÀÁẠÃẢĂẮẰẲẴẶÂẤẦẪẬẨ]/g, 'a');
  str1 = str1.replace(/[èéẹẻẽêềếệểễ]/g, 'e');
  str1 = str1.replace(/[ÈẸÉẼẺÊẾỄỆỂỀ]/g, 'e');
  str1 = str1.replace(/[ìíịỉĩ]/g, 'i');
  str1 = str1.replace(/[ÌÍỊỈĨ]/g, 'I');
  str1 = str1.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o');
  str1 = str1.replace(/[ÒỌÕÓỎÔƠỜỚỢỞỠỒỐỘỔỖ]/g, 'o');
  str1 = str1.replace(/[ùúụủũưừứựửữ]/g, 'u');
  str1 = str1.replace(/[ÙÚỤỦŨƯƯỨỰÙỮ]/g, 'U');
  str1 = str1.replace(/[ỳýỵỷỹ]/g, 'y');
  str1 = str1.replace(/[ỲÝỴỸỶ]/g, 'Y');
  str1 = str1.replace(/đ/g, 'd');
  str1 = str1.replace(/Đ/g, 'D');
  str1 = str1.replace(/    /g, '_');
  str1 = str1.replace(/   /g, '_');
  str1 = str1.replace(/  /g, '_');
  str1 = str1.replace(/ /g, '_');
  str1 = str1.replace(/[ ]/g, '_');
  str1 = str1.replace(/---/g, '_');
  str1 = str1.replace(/--/g, '_');
  str1 = str1.replace(/[-]/g, '_');

  return str1;
};

export default {
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id, attributes } = param;
      const att = filterHelpers.atrributesHelper(attributes, ['userCreatorsId']);

      const result = await MODELS.findOne(newKindOfDisaster, {
        where: { id },
        attributes: att,
        logging: true,
        include: [
          {
            model: users,
            as: 'userCreators',
            required: true,
            attributes: ['id', 'fullname', 'username']
          }
        ]
      });

      if (!result) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }

      finnalyResult = result;
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('newKindOfDisaster Service create: ', entity);
      let whereFilter = {
        newKindOfDisasterName: entity.newKindOfDisasterName
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(
        ['newKindOfDisasterName'],
        whereFilter,
        'newKindOfDisaster'
      );

      console.log('whereFilter====', whereFilter);
      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(newKindOfDisaster, {
              where: whereFilter
            }),
            entity.newKindOfDisasterName || entity.newKindOfDisasterName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.newKindOfDisaster.newKindOfDisasterName' }
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
      const nameElIntents = rename(entity.newKindOfDisasterName);

      console.log('nameElIntents', nameElIntents);

      if (entity.witaiKeywords && entity.witaiKeywords.length > 0) {
        const newTrain = [];

        entity.witaiKeywords.forEach(newKey => {
          newTrain.push({
            text: newKey,
            intent: 'thien_tai',
            entities: [
              {
                entity: `${nameElIntents}:${nameElIntents}`,
                start: 0,
                end: newKey.length,
                body: newKey,
                entities: []
              }
            ],
            traits: []
          });
        });

        const entityKeywords = entity.witaiKeywords.map(e => {
          return { keyword: e, synonyms: [e] };
        });
        const bodyEntity = {
          name: nameElIntents,
          roles: [nameElIntents],
          lookups: ['keywords'],
          keywords: entityKeywords
        };

        await witai.create_entities(bodyEntity);
        await witai.train(newTrain);
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Phải tồn tại ít nhất 1 từ khóa'
        });
      }

      finnalyResult = await MODELS.create(newKindOfDisaster, {
        ...param.entity,
        witAiEntityName: nameElIntents
      }).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'MenusService', 202);
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('newKindOfDisaster Service update: ', entity);

      const foundMenu = await MODELS.findOne(newKindOfDisaster, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'newKindOfDisaster' } },
          error
        );
      });

      if (foundMenu) {
        let whereFilter = {
          id: { $ne: param.id },
          newKindOfDisasterName: entity.newKindOfDisasterName || foundMenu.newKindOfDisasterName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(
          ['newKindOfDisasterName'],
          whereFilter,
          'newKindOfDisaster'
        );

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(newKindOfDisaster, {
                where: whereFilter
              }),
              entity.newKindOfDisasterName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.newKindOfDisaster.newKindOfDisasterName' }
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

        const nameElIntents = rename(entity.newKindOfDisasterName);

        if (entity.witaiKeywords && entity.witaiKeywords.length > 0) {
          const oldKeywords = foundMenu.witaiKeywords;

          const entityKeywords = entity.witaiKeywords.map(e => {
            return { keyword: e, synonyms: [e] };
          });
          const bodyEntity = {
            name: nameElIntents,
            roles: [nameElIntents],
            lookups: ['keywords'],
            keywords: entityKeywords
          };

          const newTrain = entity.witaiKeywords
            .filter(x => !oldKeywords.includes(x))
            .map(e => {
              return {
                text: e,
                intent: 'thien_tai',
                entities: [
                  {
                    entity: `${nameElIntents}:${nameElIntents}`,
                    start: 0,
                    end: e.length,
                    body: e,
                    entities: []
                  }
                ],
                traits: []
              };
            });
          const deleteTrain = oldKeywords
            .filter(x => !entity.witaiKeywords.includes(x))
            .map(e => {
              return {
                text: e
              };
            });

          console.log('newTrain', newTrain);
          console.log('deleteTrain', deleteTrain);
          deleteTrain.length > 0 && (await witai.delete_train(deleteTrain));

          await witai.update_entities(foundMenu.witAiEntityName, bodyEntity);
          await witai.train(newTrain);
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            message: 'Phải tồn tại ít nhất 1 từ khóa'
          });
        }

        await MODELS.update(
          newKindOfDisaster,
          { ...entity, witAiEntityName: nameElIntents, witaiKeywords: entity.witaiKeywords },
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(newKindOfDisaster, { where: { id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      console.log('error: ', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'MenusService');
    }

    return { result: finnalyResult };
  },
  delete: async param => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id } = param;

      const final = await MODELS.findOne(newKindOfDisaster, {
        where: { id }
      });

      if (!final) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }

      if (final.witAiEntityName && final.witaiKeywords) {
        const deleteTrain = [];

        final.witaiKeywords.forEach(keyTrain => {
          deleteTrain.push({ text: keyTrain });
        });
        console.log('deleteTrain', deleteTrain);
        deleteTrain.length > 0 && (await witai.delete_train(deleteTrain));

        await witai.delete_entities(final.witAiEntityName);
      }
      await MODELS.destroy(newKindOfDisaster, {
        where: { id: final.id }
      });
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return { status: 1 };
  },
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        console.log('filter', filter);
        let whereFilter = _.omit(filter, ['includesKeyWords']);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const att = filterHelpers.atrributesHelper(attributes);

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['newKindOfDisasterName'],
          whereFilter,
          'newKindOfDisaster'
        );

        console.log('whereFilter ==================', whereFilter);

        let result = await MODELS.findAndCountAll(newKindOfDisaster, {
          where: whereFilter,
          attributes: att,
          order: sort,
          offset: range[0],
          limit: perPage,
          distinct: true,
          subQuery: false,
          logging: console.log,

          include: [
            {
              model: users,
              as: 'userCreators',
              attributes: ['id', 'username', 'fullname'],
              required: true
            }
          ]
        }).catch(err => {
          reject(ErrorHelpers.errorReject(err, 'getListError', 'newsService'));
        });

        resolve({
          ...result,
          page: page + 1,
          perPage
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'newsService'));
      }
    })
};
