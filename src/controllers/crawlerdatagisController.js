import crawlerdatagisService from '../services/crawlerdatagisService'
import logger from '../utils/logger';
import loggerFormat, { recordStartTime } from '../utils/loggerFormat';
import * as ApiErrors from '../errors';
import loggerHelpers from '../helpers/loggerHelpers';

export default {
    crawlerProvinces: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log("Request-Body:", req.body);
      const entity = req.body;
      
      console.log("Request-Body entity:", entity);

      const param = { entity }

      crawlerdatagisService.crawlerProvinces(param).then(data => {
        const objLogger = loggerFormat(req, res);

        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          recordStartTime.call(res);
          logger.info('', {
            ...objLogger,
            dataInput: req.body,
            // dataOutput
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
  crawlerDistricts: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log("Request-Body:", req.body);
      const entity = req.body;
      
      console.log("Request-Body entity:", entity);

      const param = { entity }

      crawlerdatagisService.crawlerDistricts(param).then(data => {
        const objLogger = loggerFormat(req, res);

        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          recordStartTime.call(res);
          logger.info('', {
            ...objLogger,
            dataInput: req.body,
            // dataOutput
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
  crawlerWards: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log("Request-Body:", req.body);
      const entity = req.body;
      
      console.log("Request-Body entity:", entity);

      const param = { entity }

      crawlerdatagisService.crawlerWards(param).then(data => {
        const objLogger = loggerFormat(req, res);

        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          recordStartTime.call(res);
          logger.info('', {
            ...objLogger,
            dataInput: req.body,
            // dataOutput
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
  crawlerRiverBasins: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log("Request-Body:", req.body);
      const entity = req.body;
      
      console.log("Request-Body entity:", entity);

      const param = { entity }

      crawlerdatagisService.crawlerRiverBasins(param).then(data => {
        const objLogger = loggerFormat(req, res);

        if (data && data.result) {
          const dataOutput = {
            result: data.result,
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          recordStartTime.call(res);
          logger.info('', {
            ...objLogger,
            dataInput: req.body,
            // dataOutput
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
};
