import sendEmailService from '../services/sendEmailService';
import { recordStartTime } from '../utils/loggerFormat';
import loggerHelpers from '../helpers/loggerHelpers';
export default {
    sendGmail: (req, res, next) => {
        recordStartTime.call(req);
        console.log("locals", req.body);
        try {
          const param = req.body;
    
          sendEmailService.sendGmail(param).then(data => {
            const dataOutput = {
              result: {
                data,
              },
              success: true,
              errors: [],
              messages: []
            };
    
            res.header('Content-Range', `sendGmail`);
            res.send(dataOutput);
            // write log
            recordStartTime.call(res);
            loggerHelpers.logInfor(req, res, {
              dataParam: req.params,
              dataQuery: req.query,
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
}