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

const { sequelize, Op, users, botTypeOfPosts } = models;

const makeTreeArray = (array, parent, tree, arrTreeId) => {
  arrTreeId = typeof arrTreeId !== 'undefined' ? arrTreeId : [];
  tree = typeof tree !== 'undefined' ? tree : [];
  parent = typeof parent !== 'undefined' ? parent : { id: 0 };

  const children = _.filter(array, function(child) {
    const ok = Number(child.typeOfPostsParentId) === Number(parent.id);

    if (ok) arrTreeId.push(child.id);

    return Number(child.typeOfPostsParentId) === Number(parent.id);
  });

  if (!_.isEmpty(children)) {
    if (Number(parent.id) === 0) {
      tree = children;
    } else {
      tree = children;
      // parent['children'] = children;
      parent = _.assign(parent, { dataValues: { ...parent.dataValues, children } });
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

      const result = await MODELS.findOne(botTypeOfPosts, {
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

        MODELS.findOne(botTypeOfPosts, {
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
              MODELS.update(botTypeOfPosts, entity, {
                where: { id: id }
              })
                .then(async () => {
                  // console.log("rowsUpdate: ", rowsUpdate)

                  if (entity.hasOwnProperty('status')) {
                    const arrTreeId = [];
                    const array = [findEntity];

                    if (Number(entity.status) === 0) {
                      await filterHelpers.makeTreeArrayChildSearch_botTypeOfPosts(array, arrTreeId, botTypeOfPosts);
                    } else if (Number(entity.status) === 1) {
                      await filterHelpers.makeTreeArrayParentSearch_botTypeOfPosts(array, arrTreeId, botTypeOfPosts);
                    }
                    await botTypeOfPosts.update(
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

                  MODELS.findOne(botTypeOfPosts, { where: { id: param.id } })
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

      console.log('botTypeOfPosts Service create: ', entity);
      let whereFilter = {
        typeOfPostsName: entity.typeOfPostsName
      };

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['typeOfPostsName'], whereFilter, 'botTypeOfPosts');

      console.log('whereFilter====', whereFilter);
      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(botTypeOfPosts, {
              where: whereFilter
            }),
            entity.typeOfPostsName || entity.typeOfPostsName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.botTypeOfPosts.typeOfPostsName' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(botTypeOfPosts, {
              where: {
                id: entity.typeOfPostsParentId
              }
            }),
            Number(entity.typeOfPostsParentId) !== 0 ? true : false,
            TYPE_CHECK.CHECK_EXISTS,
            { parent: 'api.botTypeOfPosts.typeOfPostsParentId' }
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

      finnalyResult = await MODELS.create(botTypeOfPosts, param.entity).catch(error => {
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

      console.log('botTypeOfPosts Service update: ', entity);

      const foundMenu = await MODELS.findOne(botTypeOfPosts, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'botTypeOfPosts' } },
          error
        );
      });

      if (foundMenu) {
        let whereFilter = {
          id: { $ne: param.id },
          typeOfPostsName: entity.typeOfPostsName || foundMenu.typeOfPostsName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(
          ['typeOfPostsName'],
          whereFilter,
          'botTypeOfPosts'
        );

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(botTypeOfPosts, {
                where: whereFilter
              }),
              entity.typeOfPostsName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.botTypeOfPosts.typeOfPostsName' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(botTypeOfPosts, {
                where: {
                  id: entity.typeOfPostsParentId || foundMenu.typeOfPostsParentId
                }
              }),
              Number(entity.typeOfPostsParentId) ? true : false,
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
            await filterHelpers.makeTreeArrayChildSearch_botTypeOfPosts(array, arrTreeId, botTypeOfPosts);
          } else if (Number(entity.status) === 1) {
            await filterHelpers.makeTreeArrayParentSearch_botTypeOfPosts(array, arrTreeId, botTypeOfPosts);
          }
          await botTypeOfPosts.update(
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
        await MODELS.update(botTypeOfPosts, { ...entity, isLoad: 1 }, { where: { id: Number(param.id) } }).catch(
          error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          }
        );

        finnalyResult = await MODELS.findOne(botTypeOfPosts, { where: { id: param.id } }).catch(error => {
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

    if (filter.typeOfPostsName) {
      nameFilter = {
        typeOfPostsName: { $like: sequelize.literal(`CONCAT('%','${filter.typeOfPostsName}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }

    console.log('whereFilter: ', whereFilter);

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await MODELS.findAndCountAll(botTypeOfPosts, {
          where: whereFilter,
          // attributes:['id','parentId'],
          order: sort
        }).catch(error => {
          throw error;
        });

        await filterHelpers.makeTreeArrayParentSearch(resultSearch.rows, arrTreeSearchId, botTypeOfPosts, filterStatus);
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
      const result = await MODELS.findAndCountAll(botTypeOfPosts, {
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
            const treeTemp = makeTreeArray(result.rows, { id: item.typeOfPostsParentId }, []);

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
              ...item.dataValues,
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
    const filterStatus = _.pick(filter, ['status']);

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.typeOfPostsName) {
      nameFilter = {
        typeOfPostsName: { $like: sequelize.literal(`CONCAT('%','${filter.typeOfPostsName}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }

    console.log('whereFilter: ', whereFilter);

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await MODELS.findAndCountAll(botTypeOfPosts, {
          where: whereFilter,
          // attributes:['id','parentId'],
          order: sort
        }).catch(error => {
          throw error;
        });

        await filterHelpers.makeTreeParentChildrenArraySearch_botTypeOfPosts(
          resultSearch.rows,
          arrTreeSearchId,
          botTypeOfPosts,
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
      const result = await MODELS.findAndCountAll(botTypeOfPosts, {
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
            const treeTemp = makeTreeArray(result.rows, { id: item.typeOfPostsParentId }, []);

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
              ...item.dataValues,
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
  }
};
