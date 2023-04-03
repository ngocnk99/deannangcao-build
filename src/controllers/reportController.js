import reportService from '../services/reportService'
import logger from '../utils/logger';
import loggerFormat, { recordStartTime } from '../utils/loggerFormat';
import * as ApiErrors from '../errors';
import loggerHelpers from '../helpers/loggerHelpers';
import { createTemplateStatistics } from '../utils/helper';
import Excel from 'exceljs';
import moment from 'moment-timezone';
import _ from 'lodash';

const curencyFormat = '#,0;[Red]-#,0';
const tz = 'ASIA/Ho_Chi_Minh';

export default {
    statistics: (req, res, next) => {
    recordStartTime.call(req);
    const entity = res.locals.body;
    console.log("entity===",entity)
    try {

        reportService.statistics(entity).then(data => {
        const objLogger = loggerFormat(req, res);

        console.log("data===",data)
        const dataOutput = {
          result: {
            list: data.rows,
            pagination: {
              current: data.page,
              pageSize: data.perPage,
              total: data.count
            }
          },
          success: true,
          errors: [],
          messages: []
        };

        res.header('Content-Range', `areasController ${data.page}/${data.count}`);
        res.send(dataOutput);
        // write log
        recordStartTime.call(res);
        // logger.info('', {
        //   ...objLogger,
        //   dataQuery: req.query,
        //   // dataOutput: CONFIG.LOGGING_DATA_OUTPUT === 'true' ? dataOutput : null
        // });
      }).catch(error => {
        error.dataQuery = req.query;
        next(error)
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error)
    }
  },
  dashboards: (req, res, next) => {
    recordStartTime.call(req);
    const entity = res.locals.body;
    console.log("entity=== dashboards",entity)
    
    try {

      reportService.dashboards(entity).then(data => {
        console.log("data===",data)
        const dataOutput = {
          result: {
            list: data.rows,
            pagination: {
              current: data.page,
              pageSize: data.perPage,
              total: data.count
            }
          },
          success: true,
          errors: [],
          messages: []
        };

        res.header('Content-Range', `areasController ${data.page}/${data.count}`);
        res.send(dataOutput);
        // write log
        recordStartTime.call(res);
        loggerHelpers.logVIEWED(req, res, {
          dataReqBody: req.body,
          dataReqQuery: req.query,
          dataRes: dataOutput
        });
      }).catch(error => {
        error.dataQuery = req.query;
        next(error)
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error)
    }
  },
  dashboardsNews: (req, res, next) => {
    recordStartTime.call(req);
    const entity = res.locals.body;
    console.log("entity=== dashboards",entity)
    
    try {

      reportService.dashboardsNews(entity).then(data => {
        console.log("data===",data)
        const dataOutput = {
          result: {
            list: data.rows,
            pagination: {
              current: data.page,
              pageSize: data.perPage,
              total: data.count
            }
          },
          success: true,
          errors: [],
          messages: []
        };

        res.header('Content-Range', `areasController ${data.page}/${data.count}`);
        res.send(dataOutput);
        // write log
        recordStartTime.call(res);
        loggerHelpers.logVIEWED(req, res, {
          dataReqBody: req.body,
          dataReqQuery: req.query,
          dataRes: dataOutput
        });
      }).catch(error => {
        error.dataQuery = req.query;
        next(error)
      })
    } catch (error) {
      error.dataQuery = req.query;
      next(error)
    }
  },
  statisticsExport: (req, res, next) => {
    recordStartTime.call(req);
    const entity = res.locals.body;
    console.log("entity===",entity)

    try {

        reportService.statistics(entity).then(data => {
        const objLogger = loggerFormat(req, res);



        const workbook = new Excel.Workbook();

        const font = { name: 'Times New Roman', size: 11, color: { argb: '000000' } };
        const headerKeyProduct = [
          {
            key: 'no',
            width: 8,
            style: { alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'dateCreated',
            width: 12,
            style: { alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }, font: font }
          },
          {
            key: 'totalEnabled',
            width: 15,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'totalDisabled',
            width: 15,
            style: {  alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'totalBlocked',
            width: 10,
            style: { alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'totalApproved',
            width: 10,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'totalRejected',
            width: 15,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'totalWaitingForApproval',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
        ];

        entity.FromDate =
        moment(entity.FromDate)
          .tz(tz)
          .format('DD-MM-YYYY') || moment().format('DD-MM-YYYY');
          entity.ToDate =
          moment(entity.ToDate)
            .tz(tz)
            .format('DD-MM-YYYY') || moment().format('DD-MM-YYYY');
        // console.log('filter', param.filter);

        const headerTitleProduct = [
          'STT',
          'Ngày',
          'Ảnh viễn thám kích hoạt',
          'Ảnh viễn thám ẩn',
          'Ảnh viễn thám xóa',
          'Duyệt tải dữ liệu',
          'Từ chối tải dữ liệu',
          'Lượt chờ duyệt tải'
        ];

        const startRow = 6;
              const worksheet = createTemplateStatistics(workbook, {
                startRow,
                headerKey: headerKeyProduct,
                headerTitle: headerTitleProduct,
                reportName: 'THỐNG KÊ DỮ LIỆU HỆ THỐNG VIỄN THÁM',
                param: { ...entity, lastCol: 'H' }
              });
        let currentRow = 7;

        _.forEach(data.rows, (item, index) => {
          // for (var i = 0; i <= 4; i ++){
          const newItem = [
            index + 1,
            moment(item.dateCreated )
            .tz(tz)
            .format('DD-MM-YYYY'),
            item.totalEnabled,
            item.totalDisabled,
            item.totalBlocked,
            item.totalApproved,
            item.totalRejected,
            item.totalWaitingForApproval
          ];

          worksheet.spliceRows(currentRow, 0, newItem);
          const row = worksheet.getRow(currentRow);

          row.eachCell(cell => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });

          // if(currentRow % 30 === 0)
          // {
          //    row.addPageBreak();
          // }
          currentRow += 1;
          // }
        });

        // data.rows.length > 0 && worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
              // worksheet.getCell(`A${currentRow}`).value = 'Tổng cộng';
              // worksheet.getCell(`A${currentRow}`).fill = {
              //   type: 'pattern',
              //   pattern: 'darkTrellis',
              //   fgColor: { argb: 'FFFFFF00' },
              //   bgColor: { argb: 'f2f2f2f2' }
              // };
              // worksheet.getCell(`C${currentRow}`).value = data.rows.username;
              // worksheet.getCell(`D${currentRow}`).value = data.rows.fullname;
              // worksheet.getCell(`E${currentRow}`).value = data.rows.mobile;
              // worksheet.getCell(`F${currentRow}`).value = data.rows.workUnit;
              // worksheet.getCell(`G${currentRow}`).value = data.rows.email;
              // worksheet.getCell(`H${currentRow}`).value = data.rows.userGroupName;
              // worksheet.getRow(currentRow).height = 30;
              // worksheet.getRow(currentRow).eachCell({ includeEmpty: true }, cell => {
              //   cell.alignment = { vertical: 'middle', horizontal: 'center' };
              //   cell.font = { size: 12, bold: true, color: { argb: '993300' } };
              //   cell.border = {
              //     top: { style: 'thin' },
              //     left: { style: 'thin' },
              //     bottom: { style: 'thin' },
              //     right: { style: 'thin' }
              //   };
              // });
              // worksheet.mergeCells(`I${currentRow + 2}:J${currentRow + 2}`);
              // worksheet.getCell(`I${currentRow + 2}`).value = 'Người phê duyệt';
              // worksheet.getCell(`I${currentRow + 2}`).font = {
              //   name: 'Times New Roman',
              //   size: 12,
              //   bold: true,
              //   color: { argb: '000000' }
              // };
              // worksheet.mergeCells(`I${currentRow + 3}:J${currentRow + 3}`);
              // worksheet.getCell(`I${currentRow + 3}`).value = '(Ký và ghi rõ họ tên)';
              // worksheet.getCell(`I${currentRow + 3}`).font = {
              //   name: 'Times New Roman',
              //   size: 12,
              //   italic: true,
              //   color: { argb: '000000' }
              // };

              
              workbook.xlsx.writeBuffer().then(function (s) {
                res.send(s.toString('base64'));
              });
             
            })
            .catch(error => {
              // const statusCode = 480;

              // res.status(statusCode).send({ status: false, message: error.message, stack: error.stack })
              next(error);
            });


        


        // console.log("data===",data)
        // const dataOutput = {
        //   result: {
        //     list: data.rows,
        //     pagination: {
        //       current: data.page,
        //       pageSize: data.perPage,
        //       total: data.count
        //     }
        //   },
        //   success: true,
        //   errors: [],
        //   messages: []
        // };

        // res.header('Content-Range', `areasController ${data.page}/${data.count}`);
        // res.send(dataOutput);
        // // write log
        // recordStartTime.call(res);
        // logger.info('', {
        //   ...objLogger,
        //   dataQuery: req.query,
        //   // dataOutput: CONFIG.LOGGING_DATA_OUTPUT === 'true' ? dataOutput : null
        // });
      // }).catch(error => {
      //   error.dataQuery = req.query;
      //   next(error)
      // })
    } catch (error) {
      error.dataQuery = req.query;
      next(error)
    }
  },
};
