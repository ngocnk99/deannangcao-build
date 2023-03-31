import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import moment from 'moment';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
// import errorCode from '../utils/errorCode';
// import viMessage from '../locales/vi';
import * as ApiErrors from '../errors';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
// import logger from '../utils/logger';

const { sequelize, Op, users, mails, receivers, userGroupRoles, sites, mailPositions } = models;

/**
 *
 * @param {*} entities
 * @param {*} parent
 * @param {*} tree
 */
/* const unflattenEntities = (entities, parent = { id: null }, tree = []) =>
  new Promise(resolve => {

    const children = entities.filter(entity => entity.dataValues.mailParentId === parent.id)

    if (!_.isEmpty(children)) {
      if (parent.id == null) {
        tree = children
      } else {
        // parent['children'] = children
        parent = _.assign(parent, { dataValues: { ...parent.dataValues, children } })
      }
      children.map(child => unflattenEntities(entities, child))
    }

    resolve(tree)
  }) */

/**
 *
 * @param {Array} array
 * @param {Object} parent
 * @param {Array} tree
 * @param {Number} arrTreeId
 */

/**
 *
 * @param {Array} array
 * @param {Object} parent
 * @param {Array} tree
 * @param {Number} arrTreeId
 */
/* const makeTreeArrayIncludeParent = (array, parent, tree, arrTreeId) => {
  arrTreeId = typeof arrTreeId !== 'undefined' ? arrTreeId : [];
  tree = typeof tree !== 'undefined' ? tree : [];
  parent = typeof parent !== 'undefined' ? parent : { id: 0 };

  const children = _.filter(array, function (child) {
    // console.log("child.mailParentID: %o, parent.id", child.mailParentId, parent.id)
    const ok = Number(child.parentId) === Number(parent.id);

    if (ok)
      arrTreeId.push(child.id)

    return Number(child.parentId) === Number(parent.id);
  });

  if (!_.isEmpty(children)) {
    if (Number(parent.id) === 0) {
      tree = children;
    } else {
      tree = children;
      // parent['children'] = children;
      parent = _.assign(parent, { dataValues: { ...parent.dataValues, children } })
      // console.log("parent: ", parent.dataValues)
    }
    _.each(children, function (child) { makeTreeArray(array, child, tree, arrTreeId) });
  }

  return {
    tree, arrTreeId
  };
}; */

export default {
  get_list: param =>
    new Promise((resolve, reject) => {
      try {
        const filter = param.filter;
        const range = param.range;
        const att = filterHelpers.atrributesHelper(param.attributes);

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);
        const sort = param.sort;

        console.log('get_all filter: ', filter);
        let whereFilter;

        if (!whereFilter) {
          whereFilter = _.omit(filter, ['fullname', 'userReceiversId']);
        }

        MODELS.findAndCountAll(mails, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          attributes: att,
          limit: perPage,
          include: [
            {
              model: users,
              as: 'senders',
              attributes: ['id', 'fullname']
            },
            {
              model: receivers,
              as: 'listReceivers',
              attributes: ['receiversId', 'status'],
              include: [
                {
                  model: users,
                  as: 'receivers',
                  required: true,
                  where: filter.userReceiversId ? { id: filter.userReceiversId } : {},
                  attributes: ['fullname']
                }
              ]
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
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  get_list_user_nhan: async param => {
    try {
      console.log('param', param);
      const range = param.range;

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage) + 1;

      const callresultRoomChats = await sequelize.query(
        'call sp_getList_user_nhan(:in_usersId,:in_pageIndex,:in_pageSize,@out_rowCount);select @out_rowCount;',
        {
          replacements: {
            in_usersId: Number(param.usersId),
            in_pageIndex: page,
            in_pageSize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('callresultRoomChats', callresultRoomChats);
      const rows = Object.values(callresultRoomChats[0]);
      const count = callresultRoomChats[2][0]['@out_rowCount'];

      return {
        rows: rows,
        page: page + 1,
        perPage: perPage,
        total: Number(count)
      };
    } catch (error) {
      console.log('error', error);
      ErrorHelpers.errorThrow(error, 'getListError', 'mailService');
    }
  },
  get_list_user_gui: async param => {
    try {
      console.log('param', param);
      const range = param.range;

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage) + 1;

      const callresultRoomChats = await sequelize.query(
        'call sp_getList_user_gui(:in_usersId,:in_pageIndex,:in_pageSize,@out_rowCount);select @out_rowCount;',
        {
          replacements: {
            in_usersId: Number(param.usersId),
            in_pageIndex: page,
            in_pageSize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('callresultRoomChats', callresultRoomChats);
      const rows = Object.values(callresultRoomChats[0]);
      const count = callresultRoomChats[2][0]['@out_rowCount'];

      return {
        rows: rows,
        page: page + 1,
        perPage: perPage,
        total: Number(count)
      };
    } catch (error) {
      console.log('error', error);
      ErrorHelpers.errorThrow(error, 'getListError', 'mailService');
    }
  },
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("mail Model param: %o | id: ", param, param.id)
      const { id, attributes, idNhan } = param;
      let att = filterHelpers.atrributesHelper(attributes);

      if (!att) att = [];

      const result = await MODELS.findOne(mails, {
        where: { id },
        attributes: att,
        include: [
          {
            model: users,
            as: 'senders',
            attributes: ['id', 'fullname']
          },
          {
            model: receivers,
            as: 'listReceivers',
            attributes: ['receiversId', 'status'],
            include: [
              {
                model: users,
                as: 'receivers',
                required: true,
                attributes: ['fullname']
              }
            ]
          }
        ]
      });

      if (!result) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }

      let found;

      if (result.listReceivers.length > 0) {
        const temp = result.listReceivers.find(l => l.receiversId === idNhan);

        found = temp && temp.receiversId;
      }
      if (found) {
        const receiverFound = await MODELS.findOne(receivers, {
          where: {
            mailsId: id,
            receiversId: found
          }
        });

        await MODELS.update(
          receivers,
          { status: 1 },
          {
            where: { id: receiverFound.id }
          }
        );
      }

      finnalyResult = result;
    } catch (error) {
      console.log('vào đây', error);
      ErrorHelpers.errorThrow(error, 'getListError', 'mailService');
    }

    return finnalyResult;
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(mails, {
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
              MODELS.update(mails, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(mails, { where: { id: param.id } })
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

      console.log('mailsService create: ', entity);
      finnalyResult = await MODELS.create(mails, _.omit(param.entity, ['receivers'])).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'mailsService', 202);
      });

      await Promise.all([
        MODELS.bulkCreate(
          receivers,
          entity.receivers.map(r => ({ mailsId: finnalyResult.id, receiversId: r }))
        ),
        MODELS.update(
          mails,
          {
            conversationsId:
              entity.conversationsId || `${finnalyResult.id}_${moment(new Date()).format('YYYY/MM/DD-HH:mm:ss')}`
          },
          { where: { id: finnalyResult.id } }
        )
      ]);

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'mailsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('mailsService update: ', entity);

      const foundmail = await MODELS.findOne(mails, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'mails' } },
          error
        );
      });

      if (foundmail) {
        let whereFilter = {
          id: { $ne: param.id },
          mailName: entity.mailName || foundmail.mailName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['mailName'], whereFilter, 'mails');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(mails, {
                where: whereFilter
              }),
              entity.mailName || entity.mailName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.mails.name' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(mails, {
                where: {
                  id: entity.mailParentId || foundmail.mailParentId
                }
              }),
              Number(entity.mailParentId) ? true : false,
              TYPE_CHECK.CHECK_EXISTS,
              { parent: 'api.mails.parent' }
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
          const array = [foundmail];

          if (entity.status === 0) {
            await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, mails);
          } else if (entity.status === 1) {
            await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, mails);
          }
          await mails.update(
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
        await MODELS.update(mails, entity, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(mails, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'mailsService');
    }

    return { result: finnalyResult };
  },
  get_many: async param => {
    let finnalyResult;

    try {
      console.log('get_many filter:', param.filter);
      const { filter, /* range, sort, */ auth } = param;
      let whereFilter = filter;

      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'mails');

      // const perPage = (range[1] - range[0]) + 1
      // const page = Math.floor(range[0] / perPage);

      if (!whereFilter) {
        whereFilter = { ...filter };
      }

      const include = await filterHelpers.createIncludeWithAuthorization(auth, [
        [
          {
            model: sites,
            as: 'sites'
          }
        ],
        [
          {
            model: users,
            as: 'usersCreator'
          }
        ]
      ]);

      include.push({
        model: mails,
        as: 'parent'
      });
      include.push({
        model: mailPositions,
        as: 'mailPositions'
      });
      const result = await mails
        .findAll({
          where: whereFilter,
          include
        })
        .catch(error => {
          throw error;
        });

      finnalyResult = result;
    } catch (error) {
      throw error;
    }

    return finnalyResult;
  },
  get_many_old: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('get_many filter:', param.filter);
        const ids = param.filter.id || [];

        MODELS.findAll(mails, {
          where: {
            id: {
              [Op.in]: ids
            }
          },
          include: [
            { model: users, as: 'User' },
            { model: mails, as: 'mailParent', required: false }
          ]
        })
          .then(result => {
            // console.log("result: ", result)
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }),
  find_list_parent_child: async param => {
    let finnalyResult;
    const { filter, range, sort, auth } = param;
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

    if (filter.mailName) {
      nameFilter = {
        mailName: { $like: sequelize.literal(`CONCAT('%','${filter.mailName}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }

    console.log('whereFilter: ', whereFilter);

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await MODELS.findAndCountAll(mails, {
          where: whereFilter,
          // attributes:['id','parentId'],
          order: sort
        }).catch(error => {
          throw error;
        });

        await filterHelpers.makeTreeArrayParentSearch(resultSearch.rows, arrTreeSearchId, mails, filterStatus);
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
      const result = await MODELS.findAndCountAll(mails, {
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
            const treeTemp = makeTreeArray(result.rows, { id: item.mailParentId }, []);

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
      ErrorHelpers.errorThrow(error, 'getListError', 'mailService');
    }

    return finnalyResult;
  },
  find_list_parent_child_one: async param => {
    let finnalyResult;
    const { filter, range, sort, auth } = param;
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

    if (filter.mailName) {
      nameFilter = {
        mailName: { $like: sequelize.literal(`CONCAT('%','${filter.mailName}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }

    console.log('whereFilter: ', whereFilter);

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      if (!_.isEmpty(whereFilter)) {
        const resultSearch = await MODELS.findAndCountAll(mails, {
          where: whereFilter,
          // attributes:['id','parentId'],
          order: sort
        }).catch(error => {
          throw error;
        });

        await filterHelpers.makeTreeParentChildrenArraySearch(resultSearch.rows, arrTreeSearchId, mails, filterStatus);
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
      const result = await MODELS.findAndCountAll(mails, {
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
            const treeTemp = makeTreeArray(result.rows, { id: item.mailParentId }, []);

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
      ErrorHelpers.errorThrow(error, 'getListError', 'mailService');
    }

    return finnalyResult;
  },
  find_all_parent_child: async param => {
    let finnalyResult;
    const { filter, sort, auth } = param;

    let whereFilter = filter,
      nameFilter;

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.name) {
      nameFilter = {
        name: { $like: sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }
    if (filter.placesId) {
      whereFilter = _.omit(whereFilter, ['placesId']);
    }
    console.log('whereFilter: ', whereFilter);
    // { "SiteId": { $not: 3 } }
    /*  const include = await filterHelpers.createIncludeWithAuthorization(auth, [
        [{
          model: sites,
          as: 'sites',
        }],
        [{
          model: users,
          as: 'usersCreator',
        }],
      ]);
  */
    const { placesId } = await filterHelpers.getInfoAuthorization(auth, { placesId: filter.placesId }, true);
    let whereSites = {};

    if (placesId) {
      whereSites.placesId = placesId;
    }
    try {
      const result = await MODELS.findAndCountAll(mails, {
        where: whereFilter,
        order: sort,
        logging: true,
        include: [
          {
            model: mailPositions,
            as: 'mailPositions'
          },
          {
            model: sites,
            as: 'sites',
            required: true,
            attributes: ['id', 'name'],
            where: whereSites
          },
          {
            model: users,
            as: 'usersCreator',
            attributes: ['id', 'fullname'],
            required: true
          },
          {
            model: mailPositions,
            as: 'mailPositions',
            required: true
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        // logger.debug("", { message: 'find_all_parent_child result', result })
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
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

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
        finnalyResult = { rows: tree, count: result.count, page: 1, perPage: result.count };
      }
    } catch (error) {
      console.log('error: ', error);
      ErrorHelpers.errorThrow(error, 'getListError', 'mailService');
    }

    return finnalyResult;
  },
  find_list_parent_child_old: param =>
    new Promise((resolve, reject) => {
      const filter = param.filter;
      const sort = param.sort;

      let whereFilter = filter,
        nameFilter;

      if (filter.name) {
        nameFilter = {
          name: { $like: sequelize.literal(`CONCAT('%','${filter.name}','%')`) }
        };
        whereFilter = _.assign(whereFilter, nameFilter);
      }

      console.log('whereFilter: ', whereFilter);
      // { "SiteId": { $not: 3 } }
      try {
        MODELS.findAndCountAll(mails, {
          where: whereFilter,
          order: sort,
          include: [
            { model: mailPositions, as: 'mailPositions' },
            { model: users, as: 'usersCreator', required: false },
            { model: sites, as: 'sites', required: false }
          ]
        })
          .then(result => {
            // console.log("result: ", result.rows)
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
                  const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

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
              resolve({ rows: tree, count: result.count, page: 1, perPage: result.count });
            }
          })
          .catch(error => {
            reject(error);
            /* reject({
          statusCode: 202,
          code: errorCode.getListError.code,
          error: [new Error(errorCode.getListError.messages[0]), error]
        }) */
          });
      } catch (error) {
        reject(error);
      }
    }),
  // get_mail: async param => {
  //   let finnalyResult;
  //   const { filter, filterChild, sort } = param;

  //   console.log("sort",sort);

  //   console.log("get_mennu filter: ", filter) // { "SiteId": { $not: 3 } }
  //   /* const include = await filterHelpers.createIncludeWithAuthorization(param.auth, [
  //     [{
  //       model: sites,
  //       as: 'sites',
  //     }],
  //     [{
  //       model: users,
  //       as: 'usersCreator',
  //     }],
  //   ]); */
  //   const include =
  //     [{
  //       model: sites, attributes:['id','name'],
  //       as: 'sites',
  //     }];

  //   include.push({
  //     model: roles, as: 'roles',
  //     // attributes: ['id'],
  //     where: filterChild,
  //     required: true
  //   });

  //   try {
  //     const result = await mails.findAndCountAll({
  //       where: filter,
  //       order: sort,
  //       include,
  //       distinct: true,
  //     }).catch(error => {
  //       console.log("get_mail error: ", error)
  //       throw new ApiErrors.BaseError({
  //         statusCode: 202,
  //         type: 'getListError',
  //         error
  //       });
  //     });

  //     if (result) {
  //       // console.log("result: ", result.rows)
  //       const dataTree = makeTreeArray(result.rows, { id: 0 }, [])

  //       let tree = dataTree.tree
  //       const arrTreeId = dataTree.arrTreeId

  //       // console.log("dataTree: ", dataTree)
  //       if (arrTreeId.length > 0) {
  //         const newResult = result.rows.filter(item => {
  //           // console.log("arrTreeId.indexOf(item.id): ", arrTreeId.indexOf(item.id))
  //           if (arrTreeId.indexOf(item.id) === -1) {
  //             return item
  //           }
  //         })

  //         newResult.forEach(item => {
  //           const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, [])

  //           console.log("treeTemp: ", treeTemp)
  //           treeTemp.tree.forEach((item) => {
  //             let isCo = false

  //             tree.forEach((item1) => {
  //               if (item.id === item1.id) {
  //                 isCo = true
  //               }
  //             })
  //             if (!isCo) tree = [...tree, item]
  //           })
  //         })
  //       } else {
  //         const arrChild = [];

  //         result.rows.forEach(item => {
  //           const treeTemp = makeTreeArray(result.rows, { id: item.id }, [])

  //           // console.log("treeTemp: ", treeTemp.tree)
  //           let isCo = false;
  //           const newItem = {
  //             ...item.dataValues,
  //             children: treeTemp.tree
  //           }

  //           treeTemp.tree.forEach(c => arrChild.push(c.id));

  //           tree.forEach((item1) => {
  //             if (item.id === item1.id) {
  //               isCo = true;
  //             }
  //           })
  //           if (!isCo) tree = [...tree, newItem]
  //         })

  //         // console.log("arrChild: ", arrChild)
  //         tree = tree.filter(c => arrChild.indexOf(c.id) === -1)
  //       }
  //       // console.log("tree: ", tree)

  //       return { rows: tree, count: result.count, page: 1, perPage: result.count }
  //     } else {
  //       finnalyResult = { };
  //     }

  //   } catch (error) {
  //     throw(new ApiErrors.BaseError({
  //       statusCode: 202,
  //       type: 'getListError',
  //       error
  //     }))
  //   }

  //   return finnalyResult;
  // },

  get_mail: async param => {
    let finnalyResult;
    const { filter, range, sort, auth, filterChild } = param;
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    let whereFilter = filter,
      nameFilter;
    const filterStatus = _.pick(filter, ['status']);

    console.log('param===', param);

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    if (filter.mailName) {
      nameFilter = {
        mailName: { $like: sequelize.literal(`CONCAT('%','${filter.mailName}','%')`) }
      };
      whereFilter = _.assign(whereFilter, nameFilter);
    }

    console.log('whereFilter: ', whereFilter);

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      console.log('whereFilter*****', whereFilter);
      const result = await mails
        .findAndCountAll({
          where: whereFilter,
          order: sort,
          // distinct: true,
          logging: true,
          attributes: ['id', 'mailName', 'mailParentId', 'url', 'orderby', 'status', 'icon'],
          include: [
            {
              model: userGroupRoles,
              as: 'userGroupRoles',
              where: filterChild,
              required: true
            }
          ]
        })
        .catch(error => {
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
            const treeTemp = makeTreeArray(result.rows, { id: item.parentId }, []);

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
      ErrorHelpers.errorThrow(error, 'getListError', 'mailService');
    }

    return finnalyResult;
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(mails, {
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
              MODELS.update(mails, entity, {
                where: { id: id }
              })
                .then(() => {
                  MODELS.findOne(mails, { where: { id: param.id } })
                    .then(async result => {
                      const arrTreeId = [];

                      const array = [result];

                      if (entity.status === 0) {
                        await filterHelpers.makeTreeArrayChildSearch(array, arrTreeId, mails);
                      } else if (entity.status === 1) {
                        await filterHelpers.makeTreeArrayParentSearch(array, arrTreeId, mails);
                      }
                      await MODELS.update(
                        mails,
                        { status: entity.status },
                        {
                          where: {
                            id: {
                              [Op.in]: arrTreeId
                            }
                          }
                        }
                      );

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
  updateOrder: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('mailService updateOrder: ', entity.orders);

      const updateArr = Array.from(
        await Promise.all(
          entity.orders.map(item =>
            MODELS.update(
              mails,
              {
                orderby: item.orderby
              },
              { where: { id: item.id } }
            )
          )
        ).catch(error => {
          ErrorHelpers.errorThrow(error, 'crudError', 'mailsService');
        })
      );

      console.log('updateArr ', updateArr);
      if (!updateArr[0]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError'
        });
      } else if (!updateArr[1]) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError'
        });
      }

      return { result: updateArr };
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'mailsService');
    }

    return { result: finnalyResult };
  },

  bulkUpdate: async param => {
    let finnalyResult;
    let transaction;

    try {
      const { filter, entity } = param;
      const whereFilter = _.pick(filter, ['id']);

      transaction = await sequelize.transaction();

      await MODELS.update(mails, entity, { where: whereFilter, transaction }).then(_result => {
        finnalyResult = _result;
      });

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      ErrorHelpers.errorThrow(error, 'crudError', 'mailsService');
    }

    return { result: finnalyResult };
  }
};
