import MODELS from '../models/models';
import models from '../entity/index';
// import _ from 'lodash';
// import errorCode from '../utils/errorCode';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import sendEmailService from './sendEmailService';
import CONFIG from '../config';
import tokenSerivce from './tokenSerivce';

const { /* sequelize, Op, */ users,requestDownloads,explorers, /* tblGatewayEntity, Roles */ } = models;

export default {
  get_list: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, range, sort, attributes } = param;
      console.log(sort);

      let whereFilter = filter;
      const att = filterHelpers.atrributesHelper(attributes);

      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        reject(error);
      }

      const perPage = (range[1] - range[0]) + 1
      const page = Math.floor(range[0] / perPage);

       whereFilter = await filterHelpers.makeStringFilterRelatively(['explorerName'], whereFilter, 'explorers');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      MODELS.findAndCountAll(requestDownloads,{
        where: whereFilter,
        order: sort,
        attributes: att,
        offset: range[0],
        limit: perPage, distinct: true,
        include: [
          { model: users, as: 'userCreators',required:true, attributes: ['id','username','fullname'] },
          { model: users, as: 'userApproved',required:false, attributes: ['id','username','fullname'] },
          { model: explorers, as: 'explorers',required:true, attributes: ['id','explorerName'] },
        ]
      }).then(result => {
        resolve({
          ...result,
          page: page + 1,
          perPage
        })
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'ProvinceService'))
    }
  }),
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id
      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      MODELS.findOne(requestDownloads,{
        where: { 'id': id },
        attributes: att,
        include: [
            { model: users, as: 'userCreators',required:true, attributes: ['id','username','fullname'] },
            { model: users, as: 'userApproved',required:false, attributes: ['id','username','fullname'] },
            { model: explorers, as: 'explorers',required:true, attributes: ['id','explorerName'] },
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
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ProvinceService'))
    }
  }),
  create: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;

     
    
      console.log("provinceModel create: ", entity)
      let whereFilter = {
        explorersId: entity.explorersId,
        userCreatorsId: entity.userCreatorsId
      };

      

      const dupProvince = await preCheckHelpers.createPromiseCheckNew(MODELS.findOne(requestDownloads,
        {
          where: whereFilter
        }), entity.explorersId || entity.userCreatorsId ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.requestDownloads.explorers' }
      );

      if (!preCheckHelpers.check([dupProvince])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        })
      }

      finnalyResult = await MODELS.create(requestDownloads,entity).catch(error => {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error,
        }));
      });

      if (!finnalyResult) {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
        }));
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'ProvinceService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      let entity = param.entity;

      const foundProvince = await MODELS.findOne(requestDownloads,{
        where: {
          id: param.id
        }
      }).catch((error) => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của yêu cầu download viễn thám thất bại!',
          error
        })
      });

      if (foundProvince) {
       
        await MODELS.update(requestDownloads,
          entity,
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        finnalyResult = await MODELS.findOne(requestDownloads,{ where: { id: param.id } }).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại',
            error,
          }));
        })

        if (!finnalyResult) {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại'
          }));
        }

      } else {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
        }));
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'ProvinceService');
    }

    return { result: finnalyResult };
  },
  update_status: param => new Promise(async(resolve, reject) => {
    try {
      // console.log('block id', param.id);
      const id = param.id;
      const  entity= param.entity;
      console.log("entity===",entity.status)
      await MODELS.findOne(requestDownloads,
        {
          where: {
            id
          },
          logging:console.log
        }
      ).then(async findEntity => {
        // console.log("findPlace: ", findPlace)
        if (!findEntity) {
          reject(new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          }));
        } 
        else 
        {
          console.log("dataToken1===");
          await MODELS.update(requestDownloads,
            entity
            ,
            {
              where:{id: id}
            }).then(async() => {
            // console.log("rowsUpdate: ", rowsUpdate)
             await MODELS.findOne(requestDownloads,{ where: { id: param.id } }).then(result => {
              if (!result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else
              {
                console.log("dataToken===",entity.status);
                if(entity.status===1)
                {
                  console.log("dataToken===");
                  let dataToken={userId:result.userCreatorsId,explorersId: result.explorersId}
                  console.log("dataToken===",dataToken)
                  console.log("result===",result.dataValues.userCreatorsId)
                  MODELS.findOne(users,{where :{id:result.dataValues.userCreatorsId}}).then(resultUser =>{
                    
                    if(resultUser)
                    {
                    
                      tokenSerivce.createToken(dataToken).then(data => {
                        console.log("resultUser.email===",resultUser.dataValues.email)
                        console.log("data.token===",data.token)
                        sendEmailService.sendGmail(
                          {
                              "emailTo":resultUser.dataValues.email,
                              "subject":"DOWNLOAD DỮ LIỆU VIỄN THÁM - HỆ THỐNG VNDMS - QUẢN LÝ DỮ LIỆU TRUYỀN THÔNG",
                              "sendTypeMail":"html",
                              "body":"Chào bạn, bạn muốn tải dữ liệu viễn thám vui lòng click vào <a href=\""+CONFIG['WEB_LINK_CLIENT']+"download-explorer?token="+data.token+"\">đây</a>!"
                          }
                        );
                      });
                    }
                    
                  })

                  
                }
                else{
                  console.log("Sfdsfff")
                }

                resolve(
                { status: 1,result: result }
                
                );
              }
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'))
            });
          }).catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'))
          })
        }
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'))
    }
  }),
}
