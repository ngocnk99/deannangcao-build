import moment from 'moment';
import MODELS from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
const tz = 'ASIA/Ho_Chi_Minh';

const { sequelize, users, /* tblGatewayEntity, Roles */ } = models;

export default {
    statistics: param => new Promise(async (resolve, reject) => {

        try {
          let finnalyResult={};
          const { page ,perPage,FromDate, ToDate  } = param;
          let result = await sequelize.query(
            'call sp_explorers_statistics(:inFromdate,:inTodate,:inPageindex,:inPagesize,@out_row_count);select @out_row_count;',
            {
              replacements: {
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
          console.log("outOutput===",outOutput)
          finnalyResult = { rows: rows, count: outOutput };
    
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

      dashboards: param => new Promise(async (resolve, reject) => {

        try {
          let finnalyResult={};
    
          const { page ,perPage,FromDate,ToDate,type  } = param;
          
          let sql;
    
          if(type ==="targetAudiences")
          {
            sql ='call sp_dashboard_All_targetAudiences(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
          }
          else if(type ==="disasterGroups")
          {
            sql ='call sp_dashboard_All_DisasterGroups(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
          }
          else if(type ==="phasesOfDisasters")
          {
           //  console.log("riverBasins")
            sql ='call sp_dashboard_All_phasesOfDisasters(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
          }
          else if(type ==="producers")
          {
            sql ='call sp_dashboard_All_producers(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
          }
          else if(type ==="monthInYear")
          {
            sql ='call sp_dashboard_All_Date(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
          }
          else if(type ==="communicationProductsGroups")
          {
            sql ='call sp_dashboard_All_communicationProductsGroups(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
          }
          else if(type ==="Year")
          {
            sql ='call sp_dashboard_All_ByYear(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
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
       
    
          // 
          let PieChart =Object.values(result[0]);
          
          let overview =Object.values(result[1]);
          
          const chart = Object.values(result[2]);
          let detail =Object.values(result[3]);
          let legend =Object.values(result[4]);
          result = result.map(e => e['0']);
          const outOutput = result[6]['@out_TotalCount'];
          
          console.log("outOutput===",outOutput)
          finnalyResult = { rows: {chart,detail,overview,PieChart,legend}, count: outOutput };
    
    
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

      dashboardsNews: param => new Promise(async (resolve, reject) => {

        try {
          let finnalyResult={};
    
          const { page ,perPage,FromDate,ToDate,type  } = param;
          
          let sql;
    
          if(type ==="days")
          {
            sql ='call sp_dashboard_news_date(:in_FromDate,:in_ToDate,:in_PageIndex,:in_PageSize,@out_TotalCount);select @out_TotalCount;';
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
       
    
          // 
          let PieChart =Object.values(result[0]);
          
          let overview =Object.values(result[1]);
          
          const chart = Object.values(result[2]);
          let detail =Object.values(result[3]);
          let legend =Object.values(result[4]);
          result = result.map(e => e['0']);
          const outOutput = result[6]['@out_TotalCount'];
          
          console.log("outOutput===",outOutput)
          finnalyResult = { rows: {chart,detail,overview,PieChart,legend}, count: outOutput };
    
    
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
