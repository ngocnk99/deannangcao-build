/**
 * @param {Object} params
 * @param {String} params.title
 * @param {*} params.payload
 * @param {String} params.type
 * @param {*} params.url
 * @param {*} params.content
 * @param {*} params.phoneCode
 * */
export default (params) => {
  const title = params.title;
  const type = params.type;
  const payload = params.payload;
  const url = params.url;
  const phoneCode = params.phoneCode;
  const content = params.content;
  let _object;

  switch (type) {

    case 'oa.open.url': {
      _object = {
        title,
        payload : {
          url
        }, // object
        type
      };
      break;
    }
    case 'oa.query.show': {
      _object = {
        title,
        payload, // string
        type
      };
      break;
    }
    case 'oa.query.hide': {
      _object = {
        title,
        payload, // string
        type
      };
      break;
    }
    case 'oa.open.sms': {
      _object = {
        title,
        payload: {
          content,
          phone_code: phoneCode
        },
        type
      };
      break;
    }
    case 'oa.open.phone': {
      _object = {
        title,
        payload: {
          phone_code: phoneCode
        },
        type
      };
      break;
    }
    default: {
      break;
    }
  }

  return _object;
}
