/* eslint-disable camelcase */
import _ from 'lodash';
import MODELS from '../models/models';
import sendEmailService from './sendEmailService';
import CONFIG from '../config';
// import groupUsersModel from '../models/groupUsers';
import models from '../entity/index';
import { md5 } from '../utils/crypto';
// import errorCode from '../utils/errorCode';
import Promise from '../utils/promise';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';

import tokenSerivce from './tokenSerivce';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import viMessage from '../locales/vi';

const { sequelize, Op, users, userGroups, provinces } = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, auth, attributes } = param;
      // console.log(filter);
      let whereFilter = _.omit(filter, 'placesId');
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);
      const att = filterHelpers.atrributesHelper(attributes, ['password']);

      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      whereFilter = await filterHelpers.makeStringFilterRelatively(
        ['username', 'fullname', 'email', 'mobile'],
        whereFilter,
        'users'
      );

      console.log('whereFilter: ', whereFilter);

      const result = await Promise.all([
        MODELS.findAndCountAll(users, {
          // subQuery: false,
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          attributes: att,
          distinct: true,
          include: [
            { model: userGroups, as: 'userGroups', required: true, attributes: ['id', 'userGroupName'] },
            { model: provinces, as: 'provinces', required: false, attributes: ['id', 'provinceName'] }
          ]
        })
      ]).catch(error => {
        ErrorHelpers.errorThrow(error, 'getListError', 'UserServices');
      });

      // console.log(result);

      finnalyResult = {
        rows: result[0].rows,
        count: result[0].count,
        page: page + 1,
        perPage
      };
    } catch (error) {
      // reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'))
      ErrorHelpers.errorThrow(error, 'getListError', 'UserServices');
    }

    return finnalyResult;
  },
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("BloArticle Model param: %o | id: ", param, param.id)
      const { id, auth } = param;
      const whereFilter = { id };

      const result = await MODELS.findOne(users, {
        where: whereFilter,
        attributes: {
          // include: [],
          exclude: ['password']
        },
        include: [
          { model: userGroups, as: 'userGroups', attributes: ['id', 'userGroupName'] },
          { model: provinces, as: 'provinces', required: false, attributes: ['id', 'provinceName'] }
        ]
      }).catch(error => {
        ErrorHelpers.errorThrow(error, 'getInfoError', 'UserServices');
      });

      finnalyResult = result;
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      // console.log("error: ", error)
      ErrorHelpers.errorThrow(error, 'getInfoError', 'UserServices');
    }

    return finnalyResult;
  },
  find_one: param =>
    new Promise((resolve, reject) => {
      try {
        MODELS.findOne(users, {
          logging : true,
          where: {
            username: param.userName
          },
          include: [
            {
              model: userGroups,
              as: 'userGroups',
              attributes: ['id', 'userGroupName']
            }
          ]
          /* include: [
          {
            model: roles,
            as: 'roleDetails',
            required: false,
            include: [
              { model: menus, as: 'menu', required: false }
            ]
          }
        ] */
        })
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
          });
      } catch (error) {
        reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
      }
    }),
  find: param =>
    new Promise((resolve, reject) => {
      try {
        MODELS.findOne(users, {
          where: param,
          attributes: {
            // include: [],
            exclude: ['password']
          },
          include: [
            {
              model: userGroups,
              as: 'userGroups',
              attributes: ['id', 'userGroupName']
            }
          ]
        })
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
          });
      } catch (error) {
        reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      let { entity } = param;

      console.log('User create: ', entity);

      let whereFilter = {
        username: entity.username
      };
      let whereFilterEmail = {
        email: entity.email
      };
      // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'users');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, {
              where: whereFilter
            }),
            entity.username ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.username' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, {
              where: whereFilterEmail
            }),
            entity.email ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.email' }
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

      const passMd5 = md5(entity.password);

      entity = Object.assign(param.entity, { password: passMd5 });

      console.log('entity ', entity);
      finnalyResult = await MODELS.create(users, entity).catch(err => {
        console.log('create user err: ', err);
        throw err;
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({ statusCode: 202, message: 'Tạo mới thất bại' });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { result: finnalyResult, status: 1 };
  },
  register: async param => {
    let finnalyResult;

    try {
      let { entity } = param;

      console.log('User create: ', entity);

      let whereFilter = {
        username: entity.username
      };
      let whereFilterEmail = {
        email: entity.email
      };
      // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'users');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, {
              where: whereFilter
            }),
            entity.username ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.username' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, {
              where: whereFilterEmail
            }),
            entity.email ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.email' }
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

      const passMd5 = md5(entity.password);

      entity = Object.assign(param.entity, { password: passMd5 });

      console.log('entity ', entity);
      finnalyResult = await MODELS.create(users, entity).catch(err => {
        console.log('create user err: ', err);
        throw err;
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({ statusCode: 202, message: 'Tạo mới thất bại' });
      } else {
        tokenSerivce.createToken(finnalyResult.dataValues).then(data => {
          sendEmailService.sendGmail({
            emailTo: finnalyResult.email,
            subject: 'KÍCH HOẠT TÀI KHOẢN HỆ THỐNG VNDMS - QUẢN LÝ DỮ LIỆU TRUYỀN THÔNG',
            sendTypeMail: 'html',
            body:
              'Xin chao ' +
              finnalyResult.fullname +
              ' <br/> Bạn đã đăng ký tài khoản trên HỆ THỐNG VNDMS - ẢNH VIỄN THÁM. <br/> Để kích hoạt tài khoản vui lòng click vào link dưới <a href="' +
              CONFIG['WEB_LINK_CLIENT'] +
              'active-user?token=' +
              data.token +
              '">đây</a>.'
          });
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { result: finnalyResult, status: 1 };
  },
  update: async param => {
    let finnalyResult;

    try {
      const { entity } = param;

      const foundUser = await MODELS.findOne(users, {
        where: {
          id: param.id
        }
      });

      if (foundUser) {
        let whereFilter = {
          id: { $ne: param.id },
          username: entity.username || foundUser.username
        };

        let whereFilterEmail = {
          id: { $ne: param.id },
          email: entity.email || foundUser.email
        };
        // whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'users');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(users, {
                where: whereFilter
              }),
              entity.username ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.users.username' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(users, {
                where: whereFilterEmail
              }),
              entity.email ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.users.email' }
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

        await MODELS.update(users, entity, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            error
          });
        });

        finnalyResult = await MODELS.findOne(users, { where: { id: param.id } }).catch(err => {
          throw err;
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
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { status: 1, result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(users, {
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
              MODELS.update(users, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(users, { where: { id: param.id } })
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
  changePass: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('changePass param: ', param);
        let newPassMd5;
        let { entity } = param;

        if (entity.NewPassWord === undefined || entity.NewPassWord === '') {
          reject({ status: 0, message: 'Mật khẩu mới không hợp lệ' });
        }
        if (
          entity.channel === 'normal' &&
          entity.UserChanged > 1 &&
          (entity.OldPassWord === undefined || entity.OldPassWord === '')
        ) {
          reject({ status: 0, message: 'Mật khẩu cũ không hợp lệ' });
        }
        if (
          entity.OldPassWord !== undefined &&
          entity.NewPassWord !== undefined &&
          entity.NewPassWord === entity.OldPassWord
        ) {
          reject({ status: 0, message: 'Mật khẩu mới giống mật khẩu cũ' });
        }

        const oldPassMd5 = md5(entity.OldPassWord);
        // const whereFiter = entity.channel !== "normal" && entity.UserChanged < 1 ? { id: param.id } : { id: param.id,password: oldPassMd5 };
        const whereFiter = { id: param.id, password: oldPassMd5 };

        console.log('whereFiter: ', whereFiter);
        MODELS.findOne(users, { where: whereFiter })
          .then(findUser => {
            if (findUser) {
              newPassMd5 = md5(entity.NewPassWord);
              entity = Object.assign(param.entity, { password: newPassMd5 });
              MODELS.update(users, entity, {
                where: { id: Number(param.id) }
                // fields: ['password']
              })
                .then(rowsUpdate => {
                  console.log('rowsUpdate: ', rowsUpdate);
                  // usersModel.findById(param.id).then(result => {

                  // })
                  if (rowsUpdate[0] > 0) {
                    resolve({ status: 1, message: 'Thành Công' });
                  } else {
                    reject({ status: 0, message: 'Thay đổi thất bại' });
                  }
                })
                .catch(error => {
                  reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
                });
            } else {
              console.log('not found user');
              reject({ status: 0, message: 'Mật khẩu cũ không đúng.' });
            }
          })
          .catch(error => {
            reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
          });
      } catch (error) {
        console.log('error changepass:', error);
        reject({ status: 0, message: 'Lỗi cơ sở dữ liệu' });
      }
    }),
  resetPass: param =>
    new Promise(resolve => {
      try {
        console.log('param: ', param);
        let { entity } = param;

        if (entity.password === undefined || entity.password === '') {
          resolve({ status: 0, message: 'Mạt khẩu không hợp lệ!' });
        }
        const passMd5 = md5(entity.password);

        console.log('md5: ', passMd5);
        entity = Object.assign({}, { password: passMd5 });
        MODELS.update(users, entity, {
          where: { id: Number(param.id) }
          // fields: ['password']
        })
          .then(rowsUpdate => {
            console.log('rowsUpdate: ', rowsUpdate);
            if (rowsUpdate[0] > 0) {
              MODELS.findOne(users, { where: { id: param.id } }).then(resultUser => {
                if (resultUser) {
                  sendEmailService.sendGmail({
                    emailTo: resultUser.dataValues.email,
                    subject: 'HỆ THỐNG VNDMS - QUẢN LÝ DỮ LIỆU TRUYỀN THÔNG - THÔNG BÁO ĐỔI MẬT KHẨU',
                    sendTypeMail: 'html',
                    body: 'Chào bạn, Mật khẩu mới của bạn là ' + entity.password
                  });
                }
              });

              resolve({ status: 1, message: 'Thành Công' });
            } else {
              resolve({ status: 0, message: 'Mật khẩu cũ giống mật khẩu mới' });
            }
          })
          .catch(err => {
            console.log('create user err: ', err);
            resolve({ status: -2, message: err.errors.message });
          });
      } catch (error) {
        resolve({ status: -1, message: `Lỗi cơ sở dữ liệu: ${error}` });
      }
    }),
  requestForgetPass: param =>
    new Promise(async (resolve, reject) => {
      let result;

      try {
        console.log('param: ', param);

        const objectUser = await MODELS.findOne(users, {
          where: { email: param.email }
        });

        if (objectUser) {
          console.log('objectUser==', objectUser);
          if (objectUser.dataValues || objectUser.dataValues.status === -1 || objectUser.dataValues.status === 0) {
            reject(
              new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudNotExisted',
                message: viMessage['api.users.notexists.status']
              })
            );
          } else {
            tokenSerivce.createToken(objectUser.dataValues).then(data => {
              sendEmailService.sendGmail({
                emailTo: param.email,
                subject: 'QUÊN MẬT KHẨU HỆ THỐNG VNDMS - QUẢN LÝ DỮ LIỆU TRUYỀN THÔNG',
                sendTypeMail: 'html',
                body:
                  'Chào bạn, bạn muốn lấy lại mật khẩu vui lòng click vào <a href="' +
                  CONFIG['WEB_LINK_CLIENT'] +
                  'password-recovery?token=' +
                  data.token +
                  '">đây</a>!'
              });
              result = { success: true };
              resolve(result);
            });
          }
        } else {
          reject(
            new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted',
              message: viMessage['api.users.notexists.email']
            })
          );
          // result = {sucess:false}
        }
      } catch (error) {
        reject(
          new ApiErrors.BaseError({
            statusCode: 202,
            type: 'ERRORS',
            message: error
          })
        );
      }
    })
};
