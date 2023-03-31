import disastersService from '../services/disastersService'
import logger from '../utils/logger';
import loggerFormat, { recordStartTime } from '../utils/loggerFormat';
import * as ApiErrors from '../errors';
import loggerHelpers from '../helpers/loggerHelpers';
import Excel from 'exceljs';
import moment from 'moment-timezone';
import _ from 'lodash';
const curencyFormat = '#,0;[Red]-#,0';
const tz = 'ASIA/Ho_Chi_Minh';
import { createTemplateDisasters } from '../utils/helper';
import { length } from 'joi/lib/types/array';

export default {
  get_list: (req, res, next) => {
    recordStartTime.call(req);
    console.log("locals", res.locals);
    try {
      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      disastersService.get_list(param).then(data => {
        // const objLogger = loggerFormat(req, res);
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

        res.header('Content-Range', `areasController ${range}/${data.count}`);
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
  dashboard: (req, res, next) => {
    recordStartTime.call(req);
    console.log("locals", res.locals);
    try {
      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      disastersService.dashboard(param).then(data => {
        // const objLogger = loggerFormat(req, res);
        const dataOutput = {
          result: {
            list: data.rows,
            summary: data.overview,
            pagination: {
              current: data.page,
              pageSize: data.perPage,
              total: data.outOutput
            }
          },
          success: true,
          errors: [],
          messages: []
        };

        res.header('Content-Range', `areasController ${range}/${data.outOutput}`);
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
  dashboardVndms: (req, res, next) => {
    recordStartTime.call(req);
    console.log("locals22222", res.locals);
    try {
      let { sort, range, filter, attributes } = res.locals;

      filter.type=4;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      disastersService.dashboard(param).then(data => {
        // const objLogger = loggerFormat(req, res);
        const dataOutput = {
          result: {
            // list: data.rows,
            summary: data.overview,
            // pagination: {
            //   current: data.page,
            //   pageSize: data.perPage,
            //   total: data.outOutput
            // }
          },
          success: true,
          errors: [],
          messages: []
        };

        res.header('Content-Range', `areasController ${range}/${data.outOutput}`);
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
  get_list_export: (req, res, next) => {
    recordStartTime.call(req);
    console.log("locals", res.locals);
    try {
      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      disastersService.get_list(param).then(data => {
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
            key: 'disasterName',
            width: 15,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterLongitude',
            width: 15,
            style: {  alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterLatitude',
            width: 10,
            style: { alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterDescriptions',
            width: 10,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterLevel',
            width: 15,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterIsClosed',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'affectedArea',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterLevelOfRisk',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterTimeStart',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterTimeEnd',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterGroupName',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
        ];

        param.filter.FromDate = param.filter.FromDate ? moment(param.filter.FromDate).tz(tz).format('DD-MM-YYYY') : '';
        param.filter.ToDate = param.filter.ToDate ? moment(param.filter.ToDate).tz(tz).format('DD-MM-YYYY') :'';
        // console.log('filter', param.filter);

        const headerTitleProduct = [
          'STT',
          'Ngày',
          'Tên sự SKTT',
          'Kinh độ',
          'Vĩ độ',
          'Mô tả',
          'Mức độ',
          'Kết thúc',
          'Vùng ảnh hưởng',
          'Cấp độ rủi ro',
          'Thời gian bắt đầu',
          'Thời gian kết thúc',
          'Loại SKTT',
        ];

        const startRow = 6;
              const worksheet = createTemplateDisasters(workbook, {
                startRow,
                headerKey: headerKeyProduct,
                headerTitle: headerTitleProduct,
                reportName: 'DANH SÁCH SỰ KIỆN THIÊN TAI',
                param: { ...param, lastCol: 'M' }
              });
        let currentRow = 7;

        _.forEach(data.rows, (item, index) => {
          // for (var i = 0; i <= 4; i ++){
          const newItem = [
            index + 1,
            moment(item.dateCreated )
            .tz(tz)
            .format('DD-MM-YYYY'),
            item.disasterName,
            item.disasterLongitude || '',
            item.disasterLatitude || '',
            item.disasterDescriptions || '',
            item.disasterLevel || '',
            item.disasterIsClosed || '',
            item.affectedArea || '',
            item.disasterLevelOfRisk || '',
            item.disasterTimeStart || '',
            item.disasterTimeEnd || '',
            item.disasterGroups.disasterGroupName
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
    } catch (error) {
      error.dataQuery = req.query;
      next(error)
    }
  },
  get_one: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, attributes }

      // console.log("districtsService param: ", param)
      disastersService.get_one(param).then(data => {
       
        res.send(data);
        recordStartTime.call(res);
        loggerHelpers.logVIEWED(req, res, {
          dataReqBody: req.body,
          dataReqQuery: req.query,
          dataRes: data
        });
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      error.dataParams = req.params;
      next(error)
    }
  },
  get_list_multi: (req, res, next) => {
    recordStartTime.call(req);

    console.log("req.auth=", req.auth);
    console.log("locals", res.locals);
    try {
      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth, attributes
      };

      disastersService.get_list_multi(param).then(data => {
        const dataOutput = {
          points: data,
          success: true,
          errors: [],
          messages: []
        };

        res.header('Content-Range', `sclSocialAccounts ${range}/${data.count}`);
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
  createOrUpdate: (req, res, next) => {
    recordStartTime.call(req);
    try {
      // console.log("Request-Body:", req.body);
      const entity = res.locals.body;
      const param = { entity }

      disastersService.createOrUpdate(param).then(data => {
       
        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          recordStartTime.call(res);
          loggerHelpers.logCreate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        } 
        // else {
        //   throw new ApiErrors.BaseError({
        //     statusCode: 202,
        //     type: 'crudNotExisted',
        //   });
        // }
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      next(error)
    }
  },
  create: (req, res, next) => {
    recordStartTime.call(req);
    try {
      // console.log("Request-Body:", req.body);
      const entity = res.locals.body;
      const param = { entity }

      disastersService.create(param).then(data => {
       
        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          recordStartTime.call(res);
          loggerHelpers.logCreate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        } 
        // else {
        //   throw new ApiErrors.BaseError({
        //     statusCode: 202,
        //     type: 'crudNotExisted',
        //   });
        // }
      }).catch(error => {
        next(error)
      })
    } catch (error) {
      next(error)
    }
  },
  update: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params
      const entity = res.locals.body
      // const entity = req.body
      const param = { id, entity }

      disastersService.update(param).then(data => {

        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          loggerHelpers.logUpdate(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        } 
        // else {
        //   throw new ApiErrors.BaseError({
        //     statusCode: 202,
        //     type: 'crudNotExisted',
        //   });
        // }
      }).catch(error => {
        error.dataInput = req.body;
        error.dataParams = req.params;
        next(error)
      })
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error)
    }
  },
  update_status: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params
      const entity = res.locals.body
      // const entity = req.body
      const param = { id, entity }

      disastersService.update_status(param).then(data => {
        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);

          recordStartTime.call(res);
          loggerHelpers.logBLOCKDED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          });
        }
      }).catch(error => {
        error.dataInput = req.body;
        error.dataParams = req.params;
        next(error)
      })
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error)
    }
  },
};
