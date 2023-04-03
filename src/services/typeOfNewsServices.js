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

const { sequelize, Op, users, typeOfNews } = models;

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

const makeTreeArray = (array, parent, tree, arrTreeId) => {
  arrTreeId = typeof arrTreeId !== 'undefined' ? arrTreeId : [];
  tree = typeof tree !== 'undefined' ? tree : [];
  parent = typeof parent !== 'undefined' ? parent : { id: 0 };

  const children = _.filter(array, function(child) {
    const ok = Number(child.typeOfNewParentId) === Number(parent.id);

    if (ok) arrTreeId.push(child.id);

    return Number(child.typeOfNewParentId) === Number(parent.id);
  });

  if (!_.isEmpty(children)) {
    if (Number(parent.id) === 0) {
      tree = children;
    } else {
      tree = children;
      // parent['children'] = children;
      parent = _.assign(parent, { ...parent, children });
      // console.log("parent: ", parent.dataValues)
    }
    _.each(children, function(child) {
      makeTreeArray(array, child, tree, arrTreeId);
    });
  }

  return {
    tree,
    arrTreeId
  };
};

export default {
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const { id, attributes } = param;
      const att = filterHelpers.atrributesHelper(attributes, ['userCreatorsId']);

      const result = await MODELS.findOne(typeOfNews, {
        where: { id },
        attributes: att,
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
      if (result.witAiIntentName) {
        const witAiKeywordResult = await witai.get_one_intents(result.witAiIntentName, true, { throwErr: 'no' });

        if (witAiKeywordResult)
          result.dataValues.witaiKeywords = witAiKeywordResult.entities.map(eKeyword => {
            return {
              keyword: eKeyword.keywords[0].keyword,
              synonyms: eKeyword.keywords[eKeyword.keywords.length - 1].synonyms
            };
          });
      } else {
        result.dataValues.witaiKeywords = [];
      }
      finnalyResult = result;
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(typeOfNews, {
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
              MODELS.update(typeOfNews, entity, {
                where: { id: id }
              })
                .then(async () => {
                  // console.log("rowsUpdate: ", rowsUpdate)

                  if (entity.hasOwnProperty('status')) {
                    const arrTreeId = [];
                    const array = [findEntity];

                    if (Number(entity.status) === 0) {
                      await filterHelpers.makeTreeArrayChildSearch_typeOfnews(array, arrTreeId, typeOfNews);
                    } else if (Number(entity.status) === 1) {
                      await filterHelpers.makeTreeArrayParentSearch_typeOfnews(array, arrTreeId, typeOfNews);
                    }
                    await typeOfNews.update(
                      { status: entity.status },
                      {
                        where: {
                          id: {
                            [Op.in]: arrTreeId
                          }
                        }
                      }
                    );
                  }

                  MODELS.findOne(typeOfNews, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('typeOfNews Service create: ', entity);
      let whereFilter = {
        typeOfNewName: entity.typeOfNewName
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['typeOfNewName'], whereFilter, 'typeOfNews');

      console.log('whereFilter====', whereFilter);
      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(typeOfNews, {
              where: whereFilter
            }),
            entity.typeOfNewName || entity.typeOfNewName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.typeOfNews.typeOfNewName' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(typeOfNews, {
              where: {
                id: entity.typeOfNewParentId
              }
            }),
            Number(entity.typeOfNewParentId) !== 0 ? true : false,
            TYPE_CHECK.CHECK_EXISTS,
            { parent: 'api.typeOfNews.typeOfNewParentId' }
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
      const nameElIntents = rename(entity.typeOfNewName);

      if (entity.witaiKeywords) {
        const newEntity = [];
        const newTrain = [];

        entity.witaiKeywords.forEach(newE => {
          const nameEl = rename(newE.keyword);

          newEntity.push({
            name: nameEl,
            roles: [nameEl],
            lookups: ['keywords'],
            keywords: [
              {
                keyword: newE.keyword,
                synonyms: newE.synonyms
              }
            ]
          });
          newE.synonyms.forEach(newKey => {
            newTrain.push({
              text: newKey,
              intent: nameElIntents,
              entities: [
                {
                  entity: `${nameEl}:${nameEl}`,
                  start: 0,
                  end: newKey.length,
                  body: newKey,
                  entities: []
                }
              ],
              traits: []
            });
          });
        });
        await witai.create_intents(nameElIntents);
        newEntity.length > 0 &&
          (await Promise.all(
            newEntity.map(async e => {
              await witai.create_entities(e);
            })
          ));

        await witai.train(newTrain);
      }
      finnalyResult = await MODELS.create(typeOfNews, { ...param.entity, witAiIntentName: nameElIntents }).catch(
        error => {
          ErrorHelpers.errorThrow(error, 'crudError', 'MenusService', 202);
        }
      );

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

      console.log('typeOfNews Service update: ', entity);

      const foundMenu = await MODELS.findOne(typeOfNews, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'typeOfNews' } },
          error
        );
      });

      if (foundMenu) {
        let whereFilter = {
          id: { $ne: param.id },
          typeOfNewName: entity.typeOfNewName || foundMenu.typeOfNewName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['typeOfNewName'], whereFilter, 'typeOfNews');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(typeOfNews, {
                where: whereFilter
              }),
              entity.typeOfNewName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.typeOfNews.typeOfNewName' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(typeOfNews, {
                where: {
                  id: entity.typeOfNewParentId || foundMenu.typeOfNewParentId
                }
              }),
              Number(entity.typeOfNewParentId) ? true : false,
              TYPE_CHECK.CHECK_EXISTS,
              { parent: 'api.menus.parent' }
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
        if (entity.hasOwnProperty('status')) {
          const arrTreeId = [];
          const array = [foundMenu];

          if (Number(entity.status) === 0) {
            await filterHelpers.makeTreeArrayChildSearch_typeOfnews(array, arrTreeId, typeOfNews);
          } else if (Number(entity.status) === 1) {
            await filterHelpers.makeTreeArrayParentSearch_typeOfnews(array, arrTreeId, typeOfNews);
          }
          await typeOfNews.update(
            { status: entity.status },
            {
              where: {
                id: {
                  [Op.in]: arrTreeId
                }
              }
            }
          );
        }

        if (entity.witaiKeywords && foundMenu.witAiIntentName) {
          const witAiKeywordResult = await witai.get_one_intents(foundMenu.witAiIntentName, true, { throwErr: 'no' });
          console.log('witAiKeywordResult', JSON.stringify(witAiKeywordResult));
          const newEntity = [];
          const updateEntity = [];
          const removeEntity = [];
          const newTrain = [];

          entity.witaiKeywords.forEach(newE => {
            const nameEl = rename(newE.keyword);
            const findOld = witAiKeywordResult.entities.find(eOld => {
              return nameEl === eOld.name;
            });

            if (!findOld) {
              newEntity.push({
                name: nameEl,
                roles: [nameEl],
                lookups: ['keywords'],
                keywords: [
                  {
                    keyword: newE.keyword,
                    synonyms: newE.synonyms
                  }
                ]
              });
            } else {
              updateEntity.push({
                name: nameEl,
                roles: [nameEl],
                lookups: ['keywords'],
                keywords: [
                  {
                    keyword: newE.keyword,
                    synonyms: newE.synonyms
                  }
                ]
              });
            }
            newE.synonyms.forEach(newKey => {
              newTrain.push({
                text: newKey,
                intent: foundMenu.witAiIntentName,
                entities: [
                  {
                    entity: `${nameEl}:${nameEl}`,
                    start: 0,
                    end: newKey.length,
                    body: newKey,
                    entities: []
                  }
                ],
                traits: []
              });
            });
          });

          const deleteTrain = [];

          witAiKeywordResult.entities.forEach(eOld => {
            const findE = entity.witaiKeywords.find(newE => {
              return eOld.name === rename(newE.keyword);
            });

            if (eOld.keywords && eOld.keywords[0] && eOld.keywords[0].synonyms)
              eOld.keywords[0].synonyms.forEach(keyTrain => {
                deleteTrain.push({ text: keyTrain });
              });
            if (!findE) {
              removeEntity.push({
                name: eOld.name
              });
            }
          });

          deleteTrain.length > 0 && (await witai.delete_train(deleteTrain));

          newEntity.length > 0 &&
            (await Promise.all(
              newEntity.map(async e => {
                await witai.create_entities(e);
              })
            ));
          updateEntity.length > 0 &&
            (await Promise.all(
              updateEntity.map(async e => {
                await witai.update_entities(e.name, e);
              })
            ));
          removeEntity.length > 0 &&
            (await Promise.all(
              removeEntity.map(async e => {
                await witai.delete_entities(e.name);
              })
            ));
          await witai.train(newTrain);
        }

        await MODELS.update(typeOfNews, { ...entity, isLoad: 1 }, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(typeOfNews, { where: { id: param.id } }).catch(error => {
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
  find_list_parent_child: async param => {
    let finnalyResult;
    const { filter, range, sort } = param;
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter,
      nameFilter;
    const filterStatus = _.pick(filter, ['status']);

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.typeOfNewName) {
      nameFilter = {
        typeOfNewName: { $like: sequelize.literal(`CONCAT('%','${filter.typeOfNewName}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }

    console.log('whereFilter: ', whereFilter);

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await MODELS.findAndCountAll(typeOfNews, {
          where: whereFilter,
          // attributes:['id','parentId'],
          order: sort
        }).catch(error => {
          throw error;
        });

        await filterHelpers.makeTreeArrayParentSearch(resultSearch.rows, arrTreeSearchId, typeOfNews, filterStatus);
        if (whereFilter) {
          whereFilter = {
            $or: [
              {
                id: {
                  $in: arrTreeSearchId
                }
              },
              { ...whereFilter }
            ]
          };
        }
      }

      console.log('arrTreeSearchId', arrTreeSearchId);
      const result = await MODELS.findAndCountAll(typeOfNews, {
        where: whereFilter,
        order: sort,
        // distinct: true,
        include: [
          {
            model: users,
            as: 'userCreators',
            attributes: ['id', 'fullname', 'username'],
            required: true
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        console.log('a');
        result.rows = JSON.parse(JSON.stringify(result.rows));
        result.rows = await Promise.all(
          result.rows.map(async e => {
            if (e.witAiIntentName) {
              const witAiKeywordResult = await witai.get_one_intents(e.witAiIntentName, true, { throwErr: 'no' });

              console.log('witAiKeyword', JSON.stringify(witAiKeywordResult));
              e.witaiKeywords =
                witAiKeywordResult &&
                witAiKeywordResult.entities.map(eKeyword => {
                  return {
                    keyword: eKeyword.keywords[0].keyword,
                    synonyms: eKeyword.keywords[eKeyword.keywords.length - 1].synonyms
                  };
                });

              return e;
            } else {
              return e;
            }
          })
        );
        console.log('result.rows', result.rows);
        const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
        let tree = dataTree.tree;
        const arrTreeId = dataTree.arrTreeId;

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item;
            }
          });

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.typeOfNewParentId }, []);

            console.log('treeTemp: ', treeTemp);
            treeTemp.tree.forEach(item => {
              let isCo = false;

              tree.forEach(item1 => {
                if (item.id === item1.id) {
                  isCo = true;
                }
              });
              if (!isCo) tree = [...tree, item];
            });
          });
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, []);

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item,
              children: treeTemp.tree
            };

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach(item1 => {
              if (item.id === item1.id) {
                isCo = true;
              }
            });
            if (!isCo) tree = [...tree, newItem];
          });

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1);
        }
        // console.log("tree: ", tree)
        finnalyResult = {
          rows: tree.slice(range[0], range[1] + 1),
          count: tree.length, // result.count,
          page: page + 1,
          perPage: perPage
        };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  find_list_parent_child_one: async param => {
    let finnalyResult;
    const { filter, range, sort } = param;
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter,
      nameFilter;
    const filterStatus = _.pick(filter, ['status', 'sitesId']);

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.typeOfNewName) {
      nameFilter = {
        typeOfNewName: { $like: sequelize.literal(`CONCAT('%','${filter.typeOfNewName}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }

    console.log('whereFilter: ', whereFilter);

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await MODELS.findAndCountAll(typeOfNews, {
          where: whereFilter,
          // attributes:['id','parentId'],
          order: sort
        }).catch(error => {
          throw error;
        });

        await filterHelpers.makeTreeParentChildrenArraySearch_typeOfnews(
          resultSearch.rows,
          arrTreeSearchId,
          typeOfNews,
          filterStatus
        );
        if (whereFilter) {
          whereFilter = {
            $or: [
              {
                id: {
                  $in: arrTreeSearchId
                }
              },
              { ...whereFilter }
            ]
          };
        }
      }

      console.log('arrTreeSearchId', arrTreeSearchId);
      const result = await MODELS.findAndCountAll(typeOfNews, {
        where: whereFilter,
        order: sort,
        distinct: true,
        include: [
          {
            model: users,
            as: 'userCreators',
            attributes: ['id', 'fullname'],
            required: true
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        result.rows = JSON.parse(JSON.stringify(result.rows));
        result.rows = await Promise.all(
          result.rows.map(async e => {
            if (e.witAiIntentName) {
              const witAiKeywordResult = await witai.get_one_intents(e.witAiIntentName, true, { throwErr: 'no' });

              console.log('witAiKeyword', JSON.stringify(witAiKeywordResult));

              e.witaiKeywords = witAiKeywordResult.entities.map(eKeyword => {
                return {
                  keyword: eKeyword.keywords[0].keyword,
                  synonyms: eKeyword.keywords[eKeyword.keywords.length - 1].synonyms
                };
              });

              return e;
            } else {
              return e;
            }
          })
        );
        const dataTree = makeTreeArray(result.rows, { id: 0 }, []);
        let tree = dataTree.tree;
        const arrTreeId = dataTree.arrTreeId;

        // console.log("dataTree: ", dataTree)
        if (arrTreeId.length > 0) {
          const newResult = result.rows.filter(item => {
            // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
            if (arrTreeId.indexOf(item.id) === -1) {
              return item;
            }
          });

          newResult.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.typeOfNewParentId }, []);

            console.log('treeTemp: ', treeTemp);
            treeTemp.tree.forEach(item => {
              let isCo = false;

              tree.forEach(item1 => {
                if (item.id === item1.id) {
                  isCo = true;
                }
              });
              if (!isCo) tree = [...tree, item];
            });
          });
        } else {
          const arrChild = [];

          result.rows.forEach(item => {
            const treeTemp = makeTreeArray(result.rows, { id: item.id }, []);

            // console.log("treeTemp: ", treeTemp.tree)
            let isCo = false;
            const newItem = {
              ...item,
              children: treeTemp.tree
            };

            treeTemp.tree.forEach(c => arrChild.push(c.id));

            tree.forEach(item1 => {
              if (item.id === item1.id) {
                isCo = true;
              }
            });
            if (!isCo) tree = [...tree, newItem];
          });

          // console.log("arrChild: ", arrChild)
          tree = tree.filter(c => arrChild.indexOf(c.id) === -1);
        }
        // console.log("tree: ", tree)
        finnalyResult = {
          rows: tree.slice(range[0], range[1] + 1),
          count: tree.length, // result.count,
          page: page + 1,
          perPage: perPage
        };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  },
  bulkUpdate: async param => {
    let finnalyResult;
    let transaction;

    try {
      const { filter, entity } = param;
      const whereFilter = _.pick(filter, ['id']);

      transaction = await sequelize.transaction();

      await MODELS.update(typeOfNews, { ...entity, isLoad: 1 }, { where: whereFilter, transaction }).then(_result => {
        finnalyResult = _result;
      });

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      ErrorHelpers.errorThrow(error, 'crudError', 'typeOfNewsService');
    }

    return { result: finnalyResult };
  }
};
