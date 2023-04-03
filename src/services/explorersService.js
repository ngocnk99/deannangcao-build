import MODELS from '../models/models'
import tokenSerivce from './tokenSerivce';
import disastersService from '../services/disastersService';
import _ from 'lodash';
import models from '../entity/index'
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import moment from 'moment';
import CONFIG from '../config';

const { sequelize,  disasters, users,explorers,explorerGroups } = models;
const tz = 'ASIA/Ho_Chi_Minh';

export default {

  findPointsInMultiPolygons: param => new Promise(async (resolve, reject) => {

    try {
      let finnalyResult={};

      const { page ,perPage,listDisasterGroupId,arrayPolygon,keyword, FromDate, ToDate  } = param;
  
    
      let result = await sequelize.query(
        'call sp_findPointsInMultiPolygons(:inArrayPolygon, :inListDisasterGroupId, :inKeyword,:inFromdate,:inTodate,:inPageindex,:inPagesize,@out_row_count);select @out_row_count;',
        {
          replacements: {
            inArrayPolygon: arrayPolygon || '',
            inListDisasterGroupId: listDisasterGroupId || '',
            inKeyword:keyword || '',
            inFromdate:moment(FromDate).tz(tz).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
            inTodate:moment(ToDate).tz(tz).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
            inPageindex:page,
            inPagesize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );
      // console.log("result===",result)
      const rows = Object.values(result[0]);

      result = result.map(e => e['0']);

      // console.log("rows===",rows)
      const outOutput = result[2]['@out_row_count'];
      // console.log("outOutput===",outOutput)
      finnalyResult = { rows: rows, outOutput };

      console.log("finnalyResult===",finnalyResult)
      resolve({
        ...finnalyResult,
        page,
        perPage
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
    }
  }),
  findPointsInMultiPolygons_ver1: param => new Promise(async (resolve, reject) => {

    try {
      let finnalyResult={};

      const { page ,perPage,listDisasterGroupId,arrayPolygon,keyword, FromDate, ToDate  } = param;
      

   // console.log("Ab=",JSON.stringify(ab))
      let polygon="";

      if(arrayPolygon)
      {
        polygon = JSON.stringify(arrayPolygon);
      }
      // console.log("polygon==",polygon)
      let result = await sequelize.query(
        'call sp_findPointsInMultiPolygons_VER2(:inArrayPolygon, :inListDisasterGroupId, :inKeyword,:inFromdate,:inTodate,:inPageindex,:inPagesize,@out_row_count);select @out_row_count;',
        {
          replacements: {
            inArrayPolygon: polygon,
            inListDisasterGroupId: listDisasterGroupId || '',
            inKeyword:keyword || '',
            inFromdate:moment(FromDate).tz(tz).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
            inTodate:moment(ToDate).tz(tz).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
            inPageindex:page,
            inPagesize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );
     // console.log("result===",result)
      const rows = Object.values(result[0]);

      result = result.map(e => e['0']);

      // console.log("rows===",rows)
      const outOutput = result[2]['@out_row_count'];
      // console.log("outOutput===",outOutput)
      finnalyResult = { rows: rows,count: outOutput };

     // console.log("finnalyResult===",finnalyResult)
      resolve({
        ...finnalyResult,
        page,
        perPage
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
    }
  }),
  findPointsInCircle: param => new Promise(async (resolve, reject) => {

    try {
      let finnalyResult={};

      const { page ,perPage,listDisasterGroupId,radius,centerLatitude,centerLongitude,keyword, FromDate, ToDate  } = param;
      

      let result = await sequelize.query(
        'call sp_findPointsInCircle(:inRadius, :inCenterLatitude,:inCenterLongitude,:inListDisasterGroupId, :inKeyword,:inFromdate,:inTodate,:inPageindex,:inPagesize,@out_row_count);select @out_row_count;',
        {
          replacements: {
            inRadius: radius || 0,
            inCenterLatitude:centerLatitude || 0,
            inCenterLongitude:centerLongitude || 0,
            inListDisasterGroupId: listDisasterGroupId || '',
            inKeyword:keyword || '',
            inFromdate:moment(FromDate).tz(tz).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
            inTodate:moment(ToDate).tz(tz).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
            inPageindex:page,
            inPagesize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );
      console.log("result===",result)
      const rows = Object.values(result[0]);

      result = result.map(e => e['0']);

      console.log("rows===",rows)
      const outOutput = result[2]['@out_row_count'];
      console.log("outOutput===",outOutput)
      finnalyResult = { rows: rows, count: outOutput };

      console.log("finnalyResult===",finnalyResult)
      resolve({
        ...finnalyResult,
        page,
        perPage
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
    }
  }),
  get_list: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, range, sort, attributes } = param;
      let whereFilter = filter;

      console.log(filter);
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        reject(error);
      }

      const perPage = (range[1] - range[0]) + 1
      const page = Math.floor(range[0] / perPage);
      const att = filterHelpers.atrributesHelper(attributes);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['explorerName'], whereFilter, 'explorers');

      if (!whereFilter) {
        whereFilter = { ...filter }
      }

      console.log('where', whereFilter);

      MODELS.findAndCountAll(explorers,{
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        distinct: true,
        attributes: att,
        include: [
          {
            model: disasters,
            as: 'disasters',
            attributes:['id','disasterName'],
            required: false
          },
          {
            model: explorerGroups,
            as: 'explorerGroups',
            attributes:['id','explorerGroupName'],
            required: false
          },
          
          {
            model: users,
            as: 'userCreators',
            attributes: ["id", "username", "fullname"],
            required: true
          },
        ]
      }).then(result => {
        resolve({
          ...result,
          page: page + 1,
          perPage
        })
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
    }
  }),
  findExplorersByDisastersId: param => new Promise(async (resolve, reject) => {

    try {
      let finnalyResult={};

      const { page ,perPage,disastersId  } = param;
      

      let result = await sequelize.query(
        'call sp_findExplorersByDisastersId(:in_disastersId, :inPageindex,:inPagesize,@out_row_count);select @out_row_count;',
        {
          replacements: {
            in_disastersId: disastersId || 0,
            inPageindex:page,
            inPagesize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );
      console.log("result===",result)
      const rows = Object.values(result[0]);

      result = result.map(e => e['0']);

      const outOutput = result[2]['@out_row_count'];
      
      finnalyResult = { rows: rows, count: outOutput };

      console.log("finnalyResult===",finnalyResult)
      resolve({
        ...finnalyResult,
        page,
        perPage
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
    }
  }),
  get_list_vndms: param => new Promise(async (resolve, reject) => {
    try {
      const { filter, auth} = param;
      let whereFilter = {status:1};

      if(filter)
      {
        whereFilter = {...whereFilter,...filter}
      }
      let whereFilterDisasters = {disasterVndmsId:filter.disastersId,attributes:'id,disasterName,disasterLongitude,disasterLatitude'};
      let dataToken ={disastersId: filter.disastersId, userId: auth.userId}
      console.log("whereFilterDisasters==",whereFilterDisasters)
      await disastersService.get_one_vndms(whereFilterDisasters).then(item =>{

          dataToken ={...dataToken,...item.dataValues}
      })

      
      
      let linkExplorer;

      await tokenSerivce.createToken(dataToken).then(data => {
        linkExplorer=CONFIG['WEB_LINK_CLIENT']+'guest-view?token='+ data.token;
      })
      console.log('linkExplorer=', linkExplorer);

      MODELS.findAndCountAll(explorers,{
        where: whereFilter,
        logging:console.log,
        attributes: ['explorerName','disastersId',[sequelize.fn("CONCAT",`${CONFIG.IMAGES_URL}`,sequelize.col('explorerImage')),"explorerImage"],'NWCornerLat','NWCornerLong','NECornerLat','NECornerLong','SECornerLat','SECornerLong','SWCornerLat','SWCornerLong','explorerDescriptions','explorerSources'],
        include: [
          {
            model: disasters,
            as: 'disasters',
            attributes:['id','disasterName'],
            required: true
          },
          {
            model: explorerGroups,
            as: 'explorerGroups',
            attributes:['id','explorerGroupName'],
            required: false
          },
        ]
      }).then(result => {

        console.log("result====",result)

        resolve({
          ...result,
          linkExplorer
        })
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
    }
  }),
  get_one: param => new Promise((resolve, reject) => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id
      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      MODELS.findOne(explorers,{
        where: { id },
        attributes: att,
        include: [
           {
            model: disasters,
            as: 'disasters',
            attributes:['id','disasterName'],
            required: false
          },
          {
            model: explorerGroups,
            as: 'explorerGroups',
            attributes:['id','explorerGroupName'],
            required: false
          },
          {
            model: users,
            as: 'userCreators',
            attributes: ["id", "username", "fullname"],
            required: true
          },
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
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'))
      });
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getInfoError', 'DistrictService'))
    }
  }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("DistrictService create: ", entity);
      let whereFilter = {
        explorerName: entity.explorerName,
        disastersId: entity.disastersId
      }

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['explorerName'], whereFilter, 'explorers');

      const infoArr = Array.from(await Promise.all([
        preCheckHelpers.createPromiseCheckNew(MODELS.findOne(explorers, {
          where: whereFilter
        })
         , entity.explorerName ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.explorers.explorerName' }
        ),

      ]));

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        })
      }

      finnalyResult = await MODELS.create(explorers,param.entity).catch(error => {
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
          message: viMessage['api.message.infoAfterCreateError'],
        }));
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log("DistrictService update: ", entity)

      const foundGateway = await MODELS.findOne(explorers,{
        where: {
          id: param.id
        }
      }).catch(error => { throw preCheckHelpers.createErrorCheck({ typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'explorers' } }, error) });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          explorerName: entity.explorerName || foundGateway.explorerName,
          disastersId: entity.disastersId || foundGateway.disastersId,
        }

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['explorerName'], whereFilter, 'explorers');

        const infoArr = Array.from(await Promise.all([
          preCheckHelpers.createPromiseCheckNew(MODELS.findOne(explorers,
            {
              where: whereFilter
            })
            , entity.districtName || entity.disastersId ? true : false, TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.explorers.explorerName' }
          ),

        ]));

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          })
        }

        await MODELS.update(explorers,
          entity,
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error,
          }));
        });

        finnalyResult = await MODELS.findOne(explorers,{ where: { id: param.id } }).catch(error => {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
            error,
          }));
        })

        if (!finnalyResult) {
          throw (new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
          }));
        }
      } else {
        throw (new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted'],
        }));
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'DistrictService');
    }

    return { result: finnalyResult };
  },
  update_status: param => new Promise((resolve, reject) => {
    try {
      // console.log('block id', param.id);
      const id = param.id;
      const entity = param.entity;

      MODELS.findOne(explorers,
        {
          where: {
            id
          },
          logging:console.log
        }
      ).then(findEntity => {
        // console.log("findPlace: ", findPlace)
        if (!findEntity) {
          reject(new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          }));
        } else {
          MODELS.update(explorers,
            entity
            ,
            {
              where:{id: id}
            }).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(explorers,{ where: { id: param.id } }).then(result => {
              if (!result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else resolve({ status: 1,result: result });
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
  delete: param => new Promise((resolve, reject) => {
    try {
      console.log('delete id', param.id);
      const id = param.id;

      MODELS.findOne(explorers,
        {
          where: {
            id
          }
        }
      ).then(findEntity => {
        // console.log("findPlace: ", findPlace)
        if (!findEntity) {
          reject(new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          }));
        } else {
          MODELS.destroy(explorers,
            { where: { id: Number(param.id) } }
          ).then(() => {
            // console.log("rowsUpdate: ", rowsUpdate)
            MODELS.findOne(explorers,{ where: { id: param.id } }).then(result => {
              if (result) {
                reject(new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'deleteError',
                }));
              } else resolve({ status: 1 });
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'))
            });
          }).catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'))
          })
        }
      }).catch(err => {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'))
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'crudError', 'DistrictService'))
    }
  }),
  dashboards: param => new Promise(async (resolve, reject) => {

    try {
      let finnalyResult={};

      const { page ,perPage,FromDate,ToDate,type  } = param;
      
      let sql;

      if(type ==="provinces")
      {
        sql ='call sp_dashboard_All_Provinces(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
      }
      else if(type ==="areas")
      {
        sql ='call sp_dashboard_All_Areas(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
      }
      else if(type ==="riverBasins")
      {
       //  console.log("riverBasins")
        sql ='call sp_dashboard_All_RiverBasins(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
      }
      else if(type ==="disasterGroups")
      {
        sql ='call sp_dashboard_All_disasterGroups(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
      }
      else if(type ==="monthInYear")
      {
        sql ='call sp_dashboard_All_Date(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
      }
      let result = await sequelize.query(
        sql,
        {
          replacements: {
            in_FromDate:moment(FromDate).tz(tz).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
            in_ToDate: moment(ToDate).tz(tz).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
            in_PageIndex:page,
            in_PageSize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );
      console.log("result===",result)
      const chart = Object.values(result[0]);

      // 
      let detail =Object.values(result[1]);
      let overview =Object.values(result[2]);
      let explorerGroupsPieChart =Object.values(result[3]);
      result = result.map(e => e['0']);
      const outOutput = result[5]['@out_TotalCount'];
      
      console.log("outOutput===",outOutput)
      finnalyResult = { rows: {chart,detail,overview,explorerGroupsPieChart}, count: outOutput };


      // console.log("finnalyResult===",finnalyResult)
      resolve({
        ...finnalyResult,
        page,
        perPage
      })
    } catch (err) {
      reject(ErrorHelpers.errorReject(err, 'getListError', 'DistrictService'))
    }
  }),
}
