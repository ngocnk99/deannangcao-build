import axios from 'axios';
import Model from '../../models/models';
import models from '../../entity/index';
import CONFIG from '../../config';
import * as ApiErrors from '../../errors';
import ErrorHelpers from '../../helpers/errorHelpers';
import filterHelpers from '../../helpers/filterHelpers';

const {
  socialChannels,
  socialGroupChannels,
  socialChannelProps,
} = models;

export default {
  postMessengerProfile: async data => {
    let output, finnalyResult;

    try {

      const socialChannelsId = data.socialChannelsId || '';
      const version = CONFIG.FB_GRAPH_VERSION;
      const host = CONFIG.FB_GRAPH_HOST;


      const foundSocialChannel = await Model.findOne(socialChannels, {
        where: {
          id: socialChannelsId
        },
        attributes: ['id', 'token', 'placesId', 'link'],
        include: [{
          model: socialGroupChannels,
          as: 'socialGroupChannels',
          attributes: ['name','id']
        }],
        logging:console.log
      });

      console.log("foundSocialChannel=",JSON.stringify(foundSocialChannel) )
      console.log("foundSocialChannel=",foundSocialChannel.socialGroupChannels.id )
      const token = foundSocialChannel.token;

      console.log("token==",token)

      const foundTemplate = await Model.findOne(socialChannelProps, {
        where: {
          socialChannelsId: socialChannelsId,
        }
      }).catch(err => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          error: err
        });

      });

      console.log("foundTemplate=",foundTemplate)

      const options = {
        "get_started": {
          "payload": "get_started"
        },
        "greeting": data.greeting || [],
        "persistent_menu": [{
          "locale": "default",
          "composer_input_disabled": false,
          "call_to_actions": data.persistentMenu || [],
        }]
      };

      if (!data.getStarted) data.getStarted = true;

      /* eslint-disable no-alert, no-console */
      if (!data.getStarted) delete options.get_started;
      if (!data.greeting) delete options.greeting;
      if (!data.persistentMenu) delete options.persistent_menu;
  
      if(foundSocialChannel.socialGroupChannels.id===1)
      {
        let Fburl = `${host}/${version}/me/messenger_profile?access_token=${token}`;

        /* eslint-enable no-alert */
        // console.log(JSON.stringify(options, null, 2), token);
        console.log("url=", Fburl);
        await axios({
          method: 'post',
          url: `${Fburl}`,
          data: options,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function (response) {
          // console.log('kết thúc response', response.data);
          output = {
            result: response.data.result,
            data: finnalyResult
          };
        })
        .catch(function (error) {
          ErrorHelpers.errorThrow(error, 'crudError', 'messService')
        });
      }
      

      if (!foundTemplate) {
        finnalyResult = await Model.create(socialChannelProps, data).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });

        });

        output = {
          data: finnalyResult,
          success: true,
        };
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudExisted',
          message: "Bản ghi tồn tại"
        });

      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'messService');
    }

    return output;
  },
  updateMessengerProfile: async param => {
    const data = param.entity;
    const id = param.id;
    let output, finnalyResult;
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG.FB_GRAPH_HOST;

    try {


      const foundTemplate = await Model.findOne(socialChannelProps, {
        where: {
          id: id,
        }
      }).catch(err => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          error: err,
        });
      });

      if (!foundTemplate) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: "Không tìm thấy bản ghi"
        });
      }
      const foundSocialChannel = await Model.findOne(socialChannels, {
        where: {
          id: foundTemplate.socialChannelsId,
        },
        attributes: ['id', 'token', 'placesId', 'link'],
        include: [{
          model: socialGroupChannels,
          as: 'socialGroupChannels',
          attributes: ['name']
        }]
      }).catch(err => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          error: err,
        });
      });
      const token = foundSocialChannel.token;


      const options = {
        "get_started": {
          "payload": "get_started"
        },
        "greeting": data.greeting || [],
        "persistent_menu": [{
          "locale": "default",
          "composer_input_disabled": false,
          "call_to_actions": data.persistentMenu || [],
        }]
      };

      if (!data.getStarted) data.getStarted = 1;

      console.log('data', data)

      /* eslint-disable no-alert, no-console */
      if (!data.getStarted) delete options.get_started;
      if (!data.greeting || !data.greeting[0]) delete options.greeting;
      if (!data.persistentMenu || !data.greeting[0]) delete options.persistent_menu;
      /* eslint-enable no-alert */
      console.log(JSON.stringify(options, null, 2));
      if(foundSocialChannel.socialGroupChannels.id===1)
      {
        await axios({
          method: 'post',
          url: `${host}/${version}/me/messenger_profile?access_token=` + token,
          data: options,
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(function (response) {
            // console.log('kết thúc response', response.data);
            output = {
              result: response.data.result
            };

          })
          .catch(function (error) {
            ErrorHelpers.errorThrow(error, 'crudError', 'messService')
          });
      }
      finnalyResult = await Model.update(socialChannelProps, data, {
        where: {
          id: id,
        }
      }).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'messService')
      });

      output = {
        result: finnalyResult,
        success: true,
      };
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'messService');
    }

    return output;
  },
  getMessengerProfile: async (param) => {
    const socialChannelsId = param;
    let finnalyResult;

    try {
      finnalyResult = await Model.findOne(socialChannelProps, {
        where: {
          socialChannelsId: socialChannelsId
        }
      }).catch(error => {
        ErrorHelpers.errorThrow(error, 'crudError', 'messService');
      });
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'messService');
    }

    return {
      result: finnalyResult,
      success: true,
    };
  },
  deleteMessengerProfile: async (data) => {
    let finnalyResult;
    let result;
    let output;

    try {
      const id = data.id;
      const version = CONFIG.FB_GRAPH_VERSION;
      const host = CONFIG.FB_GRAPH_HOST;
      console.log(id);
      finnalyResult = await Model.findOne(socialChannelProps, {
        where: {
          id: id
        },
        attributes: ['id', 'socialChannelsId']
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          error
        });
      });
      const options = {
        "fields": [
          "get_started",
          "greeting",
          "persistent_menu"
        ]
      };
      console.log(options);
      if (finnalyResult) {
        console.log(finnalyResult.socialChannelsId);
        const foundSocialChannel = await Model.findOne(socialChannels, {
          where: {
            id: finnalyResult.socialChannelsId
          },
          attributes: ['id', 'token', 'placesId', 'link'],
          include: [{
            model: socialGroupChannels,
            as: 'socialGroupChannels',
            attributes: ['name']
          }]
        }).catch(err => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            error: err,
          });
        });
        const token = foundSocialChannel.token;
        
        if(foundSocialChannel.socialGroupChannels.id===1)
        {
          await axios({
            method: 'delete',
            url: `${host}/${version}/me/messenger_profile?access_token=` + token,
            data: options,
            headers: {
              'Content-Type': 'application/json'
            }
          })
            .then(function (response) {
              // console.log('kết thúc response', response.data);
              output = {
                result: response.data.result
              };

            })
            .catch(function (error) {
              ErrorHelpers.errorThrow(error, 'deleteError', 'messService')
            });
        }


        result = await Model.destroy(socialChannelProps, {
          where: {
            id: id
          }
        })
      }
      else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
        });
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'deleteError', 'messService');
    }

    return {
      result: 'success',
      success: true,
    };
  },
  deleteFields: async (data) => {
    let finnalyResult;
    let result;
    let output;

    try {
      let fields = data.fields || "";
      const id = data.id;
      const version = CONFIG.FB_GRAPH_VERSION;
      const host = CONFIG.FB_GRAPH_HOST;
      let entity = {
      }
      const items = Array.from(fields.split(',')) || [];

      items.forEach(item => {
        if (item === 'get_started') entity = { ...entity, getStarted: false }
        if (item === 'greeting') entity = { ...entity, greeting: null }
        if (item === 'persistent_menu') entity = { ...entity, persistentMenu: null }
      })
      /*eslint-disable */


      /*eslint-enable */
      console.log(entity)
      finnalyResult = await Model.findOne(socialChannelProps, {
        where: {
          id: id
        },
        attributes: ['id', 'socialChannelsId']
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          error
        });
      });
      const options = {
        "fields": items,
      };
      console.log(options)
      if (finnalyResult) {
        console.log(finnalyResult.socialChannelsId);
        const foundSocialChannel = await Model.findOne(socialChannels, {
          where: {
            id: finnalyResult.socialChannelsId
          },
          attributes: ['id', 'token', 'placesId', 'link'],
          include: [{
            model: socialGroupChannels,
            as: 'socialGroupChannels',
            attributes: ['name']
          }]
        }).catch(err => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            error: err,
          });
        });
        const token = foundSocialChannel.token;
        
        if(foundSocialChannel.socialGroupChannels.id===1)
        {
          await axios({
            method: 'delete',
            url: `${host}/${version}/me/messenger_profile?access_token=` + token,
            data: options,
            headers: {
              'Content-Type': 'application/json'
            }
          })
            .then(function (response) {
              // console.log('kết thúc response', response.data);
              output = {
                result: response.data.result
              };

            })
            .catch(function (error) {
              ErrorHelpers.errorThrow(error, 'deleteError', 'messService')
            });
        }
        console.log('ddem')
        result = await Model.update(socialChannelProps,
          entity, {
          where: {
            id: id
          }
        })
      }
      else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
        });
      }

    } catch (error) {
      ErrorHelpers.errorThrow(error, 'deleteError', 'messService');
    }

    return {
      result: 'success'
    };
  }
};
