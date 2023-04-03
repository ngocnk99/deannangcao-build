// import facebookService from '../services/facebookService';
import loggerHelpers from '../helpers/loggerHelpers';
// import { recordStartTime } from '../utils/loggerFormat';
// import { codeMessage } from '../../utils';
// import errorCode from '../../utils/errorCode';
// import * as ApiErrors from '../../errors';
import CONFIG from '../config';
import sendQuickReplies from '../services/facebook/sendQuickReplies';
import sendText from '../services/facebook/sendText';
import sendQuickPhoneRely from '../services/facebook/sendQuickPhoneRely';
import markReadMessage from '../services/facebook/markReadMessage';
import getAllMessages from '../services/facebook/getAllMessages';
import getAllUnreadMessage from '../services/facebook/getAllUnreadMessage';
import getConversationId from '../services/facebook/getConversationId';
import getLongLiveUserAccessToken from '../services/facebook/getLongLiveUserAccessToken';
import getPageId from '../services/facebook/getPageId';
import getPageAccessToken from '../services/facebook/getPageAccessToken';
import getPageInfo from '../services/facebook/getPageInfo';
import getUserAccessToken from '../services/facebook/getUserAccessToken';
import sendBroadcashMessages from '../services/facebook/sendBroadcashMessages';
import subscribeApp from '../services/facebook/subscribeApp';
import blukSendText from '../services/facebook/blukSendText';
import pageSendText from '../services/facebook/pageSendText';
import messengerProfile from '../services/facebook/messengerProfile';
import getPagePosts from '../services/facebook/getPagePosts';
import getPostComments from '../services/facebook/getPostComments';
import hideComment from '../services/facebook/hideComment';
import getCommentDetail from '../services/facebook/getCommentDetail';
import deleteComment from '../services/facebook/deleteComment';
import replyComment from '../services/facebook/replyComments';
import debugToken from '../services/facebook/debugToken';
import like from '../services/facebook/like';
import unlike from '../services/facebook/unlike';
import getLikes from '../services/facebook/getLikes';
import publishPost from '../services/facebook/publishPost';
import publishPhoto from '../services/facebook/publishPhoto';
import updatePost from '../services/facebook/updatePost';
import deletePost from '../services/facebook/deletePost';
import savePageToken from '../services/facebook/savePageToken';
import getStatistics from '../services/facebook/getStatistics';
import getGroup from '../services/facebook/getGroup';
import checkAccesToken from '../services/facebook/checkAccesToken';
export default {
  get: (req, res) => {
    console.log(JSON.stringify(req.body));
    const VERIFY_TOKEN = CONFIG.FB_VERIFY_TOKEN;

    // const VERIFY_TOKEN = 'nbm@@2020';

    const arrayVERIFY = VERIFY_TOKEN.split(',');

    console.log('VERIFY_TOKEN', arrayVERIFY);

    // console.log("req.query". req.query);
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    let checkToken = false;

    for (let i = 0; i < arrayVERIFY.length; i++) {
      if (arrayVERIFY[i] === token) {
        checkToken = true;
        break;
      }
    }

    if (mode && token) {
      if (mode === 'subscribe' && checkToken) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(403);
    }
  },

  sendText: (req, res, next) => {
    try {
      const entity = req.body;

      const param = {
        entity
      };

      sendText
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  savePageToken: (req, res, next) => {
    try {
      const entity = req.body;
      const userCreatorsId = req.auth.userId;
      const param = {
        entity,
        userCreatorsId
      };

      savePageToken
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  checkAccesToken: (req, res, next) => {
    try {
      const entity = req.body;
      const userCreatorsId = req.auth.userId;
      const param = {
        entity,
        userCreatorsId
      };

      checkAccesToken
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  pageSendText: (req, res, next) => {
    try {
      const entity = req.body;

      const param = {
        entity
      };

      pageSendText
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  bulkSendText: (req, res, next) => {
    try {
      blukSendText(req.body)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  subscribeApp: (req, res, next) => {
    try {
      const entity = req.body;

      const param = {
        entity
      };

      subscribeApp
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  sendBroadcashMessages: (req, res, next) => {
    try {
      const entity = req.body;

      const param = {
        entity
      };

      sendBroadcashMessages
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  sendQuickReplies: (req, res, next) => {
    try {
      const entity = req.body;

      // const param = entity;

      sendQuickReplies
        .connectFacebookApi(entity)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  sendQuickPhoneRely: (req, res, next) => {
    try {
      const entity = req.body;

      const param = {
        entity
      };

      sendQuickPhoneRely
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  markReadMessage: (req, res, next) => {
    try {
      const entity = req.body;

      const param = {
        entity
      };

      console.log('param: ', param);

      markReadMessage
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getAllMessages: (req, res, next) => {
    try {
      const { accessToken, pageId, messageSize, pageSize, range } = req.query;

      const entity = {
        accessToken,
        pageId,
        messageSize,
        pageSize,
        range
      };
      const param = {
        entity
      };

      console.log('param: ', param);

      getAllMessages
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getPlaceMessages: (req, res, next) => {
    try {
      const { placeId, range } = req.query;

      const entity = {
        placeId,
        range
      };
      const param = {
        entity
      };

      console.log('param: ', param);

      getPlaceMessages
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getAllUnreadMessage: (req, res, next) => {
    try {
      const { accessToken, pageId } = req.query;

      const entity = {
        accessToken,
        pageId
      };

      const param = {
        entity
      };

      console.log('param: ', param);

      getAllUnreadMessage
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getConversationId: (req, res, next) => {
    try {
      const { accessToken, pageId, userId } = req.query;

      const entity = {
        accessToken,
        pageId,
        userId
      };

      const param = {
        entity
      };

      console.log('param: ', param);

      getConversationId
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getLongLiveUserAccessToken: (req, res, next) => {
    try {
      const { accessToken } = req.query;

      const entity = {
        accessToken
      };

      const param = {
        entity
      };

      console.log('param: ', param);

      getLongLiveUserAccessToken
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getMessagesFromUser: (req, res, next) => {
    try {
      const { accessToken, conversationId, pageSize, range } = req.query;

      const entity = {
        accessToken,
        conversationId,
        pageSize,
        range
      };

      const param = {
        entity
      };

      console.log('param: ', param);

      getMessagesFromUser
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getPageAccessToken: (req, res, next) => {
    try {
      const { accessToken, pageId } = req.query;

      const entity = {
        accessToken,
        pageId
      };

      const param = {
        entity
      };

      console.log('param: ', param);

      getPageAccessToken
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getPageId: (req, res, next) => {
    try {
      const { accessToken } = req.query;

      const entity = {
        accessToken
      };

      const param = {
        entity
      };

      console.log('param: ', param);

      getPageId
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getGroup: (req, res, next) => {
    try {
      const { accessToken, limit, after, admin_only } = req.body;

      const entity = {
        accessToken,
        limit,
        after,
        admin_only
      };

      const param = {
        entity
      };

      console.log('param: ', param);

      getGroup
        .getGroup(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getPageInfo: (req, res, next) => {
    try {
      const { accessToken, pageId } = req.query;

      const entity = {
        accessToken,
        pageId
      };

      const param = {
        entity
      };

      console.log('param: ', param);

      getPageInfo
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  getUserAccessToken: (req, res, next) => {
    try {
      const { code, redirectUri } = req.query;

      const entity = {
        code,
        redirectUri
      };

      const param = {
        entity
      };

      console.log('param: ', param);

      getUserAccessToken
        .connectFacebookApi(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },

  postMessengerProfile: (req, res, next) => {
    try {
      const entity = req.body;

      // const param = entity;
      messengerProfile
        .postMessengerProfile(entity)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  updateMessengerProfile: (req, res, next) => {
    try {
      const entity = req.body;
      const { id } = req.params;

      const param = {
        id,
        entity
      };
      // const param = entity;

      messengerProfile
        .updateMessengerProfile(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getMessengerProfile: (req, res, next) => {
    try {
      const { socialChannelsId } = req.query;

      console.log(socialChannelsId);

      messengerProfile
        .getMessengerProfile(socialChannelsId)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getPagePosts: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await getPagePosts(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getPostComments: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await getPostComments(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  hideComment: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await hideComment(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getCommentDetail: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await getCommentDetail(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  deleteComment: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await deleteComment(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  replyComment: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await replyComment(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  debugToken: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await debugToken(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  deleteMessengerProfile: (req, res, next) => {
    try {
      const { id } = req.params;

      const param = { id };

      messengerProfile
        .deleteMessengerProfile(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  deleteFields: (req, res, next) => {
    try {
      const { id } = req.params;
      const params = req.query;
      const param = { id, ...params };

      messengerProfile
        .deleteFields(param)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  like: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await like(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  unlike: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await unlike(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getLikes: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await getLikes(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  publishPost: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await publishPost(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  publishPhoto: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await publishPhoto(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  editPost: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await updatePost(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  deletePost: async (req, res, next) => {
    try {
      const params = req.query;
      console.log(params);
      await deletePost(params).then(data => {
        res.send(data);
        loggerHelpers.logInfor(req, res, {
          dataParam: req.params,
          dataQuery: req.query
        });
      });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  getStatistics: async (req, res, next) => {
    try {
      const { id } = req.params;

      const entity = {
        id
      };

      getStatistics
        .connectFacebookApi(entity)
        // write log
        .then(data => {
          res.send(data);
          loggerHelpers.logInfor(req, res, {
            dataParam: req.params,
            dataQuery: req.query
          });
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  }
};
