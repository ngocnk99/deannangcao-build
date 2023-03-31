import {
    Router
  } from 'express';
  import facebookController from '../controllers/facebookController';
  const router = Router();
  
  // router.post("/", facebookController.post_webhook)
  router.get("/", facebookController.get)
  router.post("/sendText", facebookController.sendText)
  router.post("/pageSendText", facebookController.pageSendText)
  router.post("/subscribeApp", facebookController.subscribeApp)
  router.post("/sendBroadcashMessages", facebookController.sendBroadcashMessages)
  router.post("/sendQuickPhoneRely", facebookController.sendQuickPhoneRely)
  router.post("/sendQuickReplies", facebookController.sendQuickReplies)
  router.post("/markReadMessage", facebookController.markReadMessage)
  router.get("/getAllMessages", facebookController.getAllMessages)
  router.get("/getAllUnreadMessage", facebookController.getAllUnreadMessage)
  router.get("/getConversationId", facebookController.getConversationId)
  router.get("/getLongLiveUserAccessToken", facebookController.getLongLiveUserAccessToken)
  router.get("/getMessagesFromUser", facebookController.getMessagesFromUser)
  router.get("/getPageAccessToken", facebookController.getPageAccessToken)
  router.get("/getPageId", facebookController.getPageId)
  router.get("/getPageInfo", facebookController.getPageInfo)
  router.get("/getUserAccessToken", facebookController.getUserAccessToken)
  router.post('/bulkSendText', facebookController.bulkSendText);
  router.get('/getPlaceMessages', facebookController.getPlaceMessages);
  router.post('/messengerProfile', facebookController.postMessengerProfile);
  router.put('/messengerProfile/:id', facebookController.updateMessengerProfile);
  router.delete('/messengerProfile/:id', facebookController.deleteMessengerProfile);
  router.delete('/messengerProfile/deleteFields/:id', facebookController.deleteFields);
  router.get('/messengerProfile', facebookController.getMessengerProfile);
  router.get("/getPagePosts", facebookController.getPagePosts);
  router.get("/getPostComments", facebookController.getPostComments);
  router.post("/hideComment", facebookController.hideComment);
  router.get("/getCommentDetail", facebookController.getCommentDetail);
  router.delete("/deleteComment", facebookController.deleteComment);
  router.post("/replyComment", facebookController.replyComment);
  router.get("/debugToken", facebookController.debugToken);
  router.post("/like", facebookController.like);
  router.delete("/like", facebookController.unlike);
  router.get("/like", facebookController.getLikes);
  router.post("/publishPost", facebookController.publishPost);
  router.post("/publishPhoto", facebookController.publishPhoto);
  router.post("/editPost", facebookController.editPost);
  router.delete("/deletePost", facebookController.deletePost);
  export default router;
  