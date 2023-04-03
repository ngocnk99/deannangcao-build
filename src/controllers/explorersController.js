import explorersService from '../services/explorersService'
import logger from '../utils/logger';
import loggerFormat, { recordStartTime } from '../utils/loggerFormat';
import * as ApiErrors from '../errors';
import loggerHelpers from '../helpers/loggerHelpers';
import { createTemplateExplorers } from '../utils/helper';
import Excel from 'exceljs';
import moment from 'moment-timezone';
import _ from 'lodash';

const curencyFormat = '#,0;[Red]-#,0';
const tz = 'ASIA/Ho_Chi_Minh';

export default {
  findPointsInMultiPolygons: (req, res, next) => {
    recordStartTime.call(req);
    const entity = res.locals.body;
    console.log("entity===",entity)
    try {

      explorersService.findPointsInMultiPolygons(entity).then(data => {
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
  findPointsInMultiPolygons_ver1: (req, res, next) => {
    recordStartTime.call(req);
    const entity = res.locals.body;
    // console.log("entity===",entity)
    
    try {

      explorersService.findPointsInMultiPolygons_ver1(entity).then(data => {
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
  findPointsInCircle: (req, res, next) => {
    recordStartTime.call(req);
    const entity = res.locals.body;
    console.log("entity===",entity)
    try {

      explorersService.findPointsInCircle(entity).then(data => {


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

      explorersService.get_list(param).then(data => {
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

      explorersService.get_list(param).then(data => {

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
            key: 'explorerName',
            width: 15,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
         
          {
            key: 'NWCornerLat',
            width: 15,
            style: {  alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'NWCornerLong',
            width: 10,
            style: { alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'NECornerLat',
            width: 10,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'NECornerLong',
            width: 15,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'SECornerLat',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'SECornerLong',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'SWCornerLat',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'SWCornerLong',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'explorerDescriptions',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'explorerSources',
            width: 13,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
          {
            key: 'disasterName',
            width: 15,
            style: {alignment: { vertical: 'middle', horizontal: 'center' }, font: font }
          },
        ];

        param.filter.FromDate =
        moment(param.filter.FromDate)
          .tz(tz)
          .format('DD-MM-YYYY') || moment().format('DD-MM-YYYY');
        param.filter.ToDate =
          moment(param.filter.ToDate)
            .tz(tz)
            .format('DD-MM-YYYY') || moment().format('DD-MM-YYYY');
        // console.log('filter', param.filter);

        const headerTitleProduct = [
          'STT',
          'Ngày',
          'Tên ảnh viễn thám',
          'Vĩ độ 1',
          'Kinh độ 1',
          'Vĩ độ 2',
          'Kinh độ 2',
          'Vĩ độ 3',
          'Kinh độ 3',
          'Vĩ độ 4',
          'Kinh độ 4',
          'Mô tả',
          'Nguồn',
          'Sự kiện thiên tai',
        ];

        const startRow = 6;
              const worksheet = createTemplateExplorers(workbook, {
                startRow,
                headerKey: headerKeyProduct,
                headerTitle: headerTitleProduct,
                reportName: 'DANH SÁCH DỮ LIỆU VIỄN THÁM',
                param: { ...param, lastCol: 'N' }
              });
        let currentRow = 7;

        _.forEach(data.rows, (item, index) => {
          // for (var i = 0; i <= 4; i ++){
          const newItem = [
            index + 1,
            moment(item.dateCreated )
            .tz(tz)
            .format('DD-MM-YYYY'),
            item.explorerName,
            item.NWCornerLat,
            item.NWCornerLong,
            item.NECornerLat,
            item.NECornerLong,
            item.SECornerLat,
            item.SECornerLong,
            item.SWCornerLat,
            item.SWCornerLong,
            item.explorerDescriptions,
            item.explorerSources,
            item.disasters && item.disasters.disasterName || ''
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
      explorersService.get_one(param).then(data => {


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

  create: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log("Request-Body:", req.body);
      const entity = res.locals.body;
      const param = { entity }

      explorersService.create(param).then(data => {
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
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
          });
        }
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

      explorersService.update(param).then(data => {
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
  update_status: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params
      const entity = res.locals.body
      // const entity = req.body
      const param = { id, entity }

      explorersService.update_status(param).then(data => {
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
  getlist_vndms: (req, res, next) => {
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

      explorersService.get_list_vndms(param).then(data => {
        const dataOutput = {
          list: data,
          success: true
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
  findExplorersByDisastersId: (req, res, next) => {
    recordStartTime.call(req);
    const entity = res.locals.body;
    // console.log("entity===",entity)
    
    try {

      explorersService.findExplorersByDisastersId(entity).then(data => {
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
  dashboards: (req, res, next) => {
    recordStartTime.call(req);
    const entity = res.locals.body;
    console.log("entity=== dashboards",entity)
    
    try {

      explorersService.dashboards(entity).then(data => {
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
};
