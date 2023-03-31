import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';
const DEFAULT_SCHEMA = {
  senderId: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: 'Id người gửi tin nhắn',
    required:true,
  }),
  recipientId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: 'Id người nhận tin nhắn',
    required:true,
  }),
};

export default {
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, range } = req.query;

    res.locals.range = range ? JSON.parse(range) : [0, 49];
    if (filter) {
      const { senderId, recipientId} = JSON.parse(filter);
      const district = { senderId, recipientId};

      // console.log(district)
      const SCHEMA = {
        ...DEFAULT_SCHEMA,
      };

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then((data) => {

          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
    } else {
      res.locals.filter = {};
      next()
    }
  },
}
