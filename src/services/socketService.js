import r from 'rethinkdb';
import CONFIG from '../config';
import _ from 'lodash';
import { profile } from 'winston';
// eslint-disable-next-line require-jsdoc
export const getNotifcations =  ({ usersId, range }) => new Promise(async resolve => {
    let finalResult;

      range = range && typeof range === 'string' ? JSON.parse(range) : [0, 10];
      const perPage = range[1] - range[0] + 1;
      const connection = await r.connect({
        host: CONFIG.RETHINKDB_SERVER,
        port: CONFIG.RETHINKDB_PORT,
        db: CONFIG.RETHINKDB_DB
      });
      
      console.log("range chat = ",range)

      let result= await r
        .table('conversations')
        // .eqJoin("conversationId",r.table("conversationGroups"))
        .filter(function(user) {
          return ((user("sender")("id").eq(usersId.toString())).or(user("recipient").contains(function (recipient){
            return recipient("id").eq(usersId.toString())
          })));
          })
        // .zip()
        .group('conversationId')
        .ungroup()
      
        .orderBy(r.desc('time'))
        .run(connection, function(err,result) {
          if (err) {
            console.log('rethinkDB failed %s:%s\n%s', err.name, err.msg, err.message);
          }
          // console.log("range chat result=",result);
   
      });
     
      let filterMessage = [];
      const conversationGroup = [];

      await r.table('conversationGroups')
      // .get("85cafcf3-39f7-4d6c-bbaf-ad4ec6a766da")
      .run(connection, function(err,cursor) {
        if (err) {
          console.log('rethinkDB failed %s:%s\n%s', err.name, err.msg, err.message);
        }
      
        cursor.each(function(error, item) {
          conversationGroup.push(item);
        })
      });
      // console.log("range chat conversationGroup=",conversationGroup);
      if (result) {

          await result.forEach(async (item) => {
            const userMessages = [];
  
            userMessages.push(item.reduction);
            const groupInfor = _.filter(conversationGroup,{id:item.group});

             console.log("groupInfor=",groupInfor);
              userMessages.forEach( (item) => {
                  let totalUnread = 0;
  
                item = _.orderBy(item, ['time'], ['desc']);
  
                item.forEach(cv => {
                  
                  let arrayReadUser =  _.filter(groupInfor[0].read,["id",usersId.toString()]);
  
                  let timeReadUser;
      
                  if(_.size(arrayReadUser) >0)
                  {
                    timeReadUser = arrayReadUser[0].time;
                    if(timeReadUser < cv.time)
                    {
                      totalUnread += 1;
                    }
                  }
                  else
                  {
                    totalUnread += 1;
                  }
                });
                
                item = { ...item[0],..._.omit(groupInfor[0],["id","time","status"]), totalUnread };
                // console.log("item====",item)
                filterMessage.push(item);
  
              });
              filterMessage = _.orderBy(filterMessage, 'time', ['desc']);
  
              const end = perPage > filterMessage.length ? filterMessage.length : perPage;
  
              filterMessage = filterMessage.slice(range[0], end);
          })

       
      }
    
      // console.log("filterMessage*************",filterMessage);
      let totalUnread = 0;
      
      if(filterMessage)
      {
        filterMessage.forEach(cv => {

          

          if(cv.totalUnread>0)
          {
            totalUnread += 1;
          }
      
        });
      }
        

        // console.log("filterMessage===",filterMessage)
        finalResult = { list: filterMessage,channel: 'chat', totalUnread: totalUnread };
   
      // console.log("finalResult chat ===",finalResult)
      resolve(finalResult) 
})
;

export const getNotifcationsEmail = async ({ usersId, range }) => {
  try {
    let finalResult;

    range = range && typeof range === 'string' ? JSON.parse(range) : [0, 10];
    const perPage = range[1] - range[0] + 1;
    const connection = await r.connect({
      host: CONFIG.RETHINKDB_SERVER,
      port: CONFIG.RETHINKDB_PORT,
      db: CONFIG.RETHINKDB_DB
    });

    await r
      .table('mails')
      .filter(
        function(user) {
        return user("status").eq(1).and((user("sender")("id").eq(usersId.toString()).and(user("mailReplyId").ne("0"))).or(user("receivers").contains(function (receiver){
          return receiver("id").eq(usersId.toString())
        })));
        }
      )
      .group('conversationsId')
      .ungroup()
      .orderBy(r.desc('mailSendingDate'))
      .run(connection, async function(err, result) {
        if (err) {
          console.log('rethinkDB failed %s:%s\n%s', err.name, err.msg, err.message);
        }
        const userMessages = [];
        let filterMessage = [];

        // console.log("result email ==",result)
        if (result && Array.isArray(result)) {
          result.forEach(item => {
             userMessages.push(item.reduction);
          });
          userMessages.forEach(item => {
            let totalUnread = 0;

            item = _.orderBy(item, ['mailSendingDate'], ['desc']);
            item.forEach(cv => {
              // if (cv.status === true) unreadCount += 1;
              // console.log("cv==",cv)
                _.find(cv.receivers, function(o){
                  if(o.id === usersId.toString() && o.read ==="0") totalUnread += 1;
                });
            });
            item = { ...item[0], totalUnread };
            filterMessage.push(item);
          });
          filterMessage = _.orderBy(filterMessage, 'mailSendingDate', ['desc']);


          const end = perPage > filterMessage.length ? filterMessage.length : perPage;

          filterMessage = await filterMessage.slice(range[0], end);
        }
        // console.log("filterMessage email ==",filterMessage)
        // let res = filterMessage.reduce((r, {...object }) => {
        //   // console.log(socialGroupChannels);
        //   let temp;

        //   if (!temp) r.push((temp = { conversations: [] }));
        //   temp.conversations.push({ ...object });

        //   return r;
        // }, []);
  
        let totalUnread = 0;

        if (filterMessage && Array.isArray(filterMessage)) {
          filterMessage.forEach(item => {
                if(item.totalUnread>0)
                {
                  totalUnread += 1;
                }
          });
        }
        finalResult={list: filterMessage,channel: 'email', totalUnread: totalUnread };
     
      });
      // console.log("finalResult email===",finalResult)
      
      return finalResult;
  } catch (e) {
    console.log('catch getnotify', e);
  }
};

// eslint-disable-next-line require-jsdoc
export const getMessages = async ({  usersId, range }) => new Promise(async resolve => {
  let finalResult;
  // console.log("===sTART getMessages");

  range = (typeof range === 'string') ? JSON.parse(range) : range ? range : [0, 10];
  const perPage = range[1] - range[0] + 1;
  const connection = await r.connect({
    host: CONFIG['RETHINKDB_SERVER'],
    port: CONFIG['RETHINKDB_PORT'],
    db: CONFIG['RETHINKDB_DB']
  });

  let result= await r
    .table('conversations')
    .filter(
      function(user) {
      return ((user("sender")("id").eq(usersId.toString())).or(user("recipient").contains(function (recipient){
        return recipient("id").eq(usersId.toString())
      })));
      }
    )
    .group('conversationId')
    .ungroup()
    .run(connection, async function(err, result) {
      if (err) {
        console.log('DB failed] %s:%s\n%s', err.name, err.msg, err.message);
      }
    });

      const userMessages = [];
      let filterMessage = [];
      let conversationGroup = [];

      await r.table('conversationGroups')
      // .get("85cafcf3-39f7-4d6c-bbaf-ad4ec6a766da")
      .run(connection, function(err,cursor) {
        if (err) {
          console.log('rethinkDB failed %s:%s\n%s', err.name, err.msg, err.message);
        }
      
        cursor.each(function(error, item) {
          conversationGroup.push(item);
        })
      });
      // console.log("range chat conversationGroup=",conversationGroup);
      if (result) {

          await result.forEach(async (item) => {
            const userMessages = [];
  
            userMessages.push(item.reduction);
            const groupInfor = _.filter(conversationGroup,{id:item.group});

             //   console.log("groupInfor=",groupInfor);
              userMessages.forEach( (item) => {
                  let totalUnread = 0;
  
                item = _.orderBy(item, ['time'], ['desc']);
  
                item.forEach(cv => {
                  
                  let arrayReadUser =  _.filter(groupInfor[0].read,["id",usersId.toString()]);
  
                  let timeReadUser;
      
                  if(_.size(arrayReadUser) >0)
                  {
                    timeReadUser = arrayReadUser[0].time;
                    if(timeReadUser < cv.time)
                    {
                      totalUnread += 1;
                    }
                  }
                  else
                  {
                    totalUnread += 1;
                  }
                });
                
                item = { ...item[0],..._.omit(groupInfor[0],["id","time","status"]), totalUnread };
                // console.log("item====",item)
                filterMessage.push(item);
  
              });
              filterMessage = _.orderBy(filterMessage, 'time', ['desc']);
  
              const end = perPage > filterMessage.length ? filterMessage.length : perPage;
  
              filterMessage = filterMessage.slice(range[0], end);
          })

       
      }
    
      // console.log("filterMessage*************",filterMessage);
      let totalUnread = 0;
      
      if(filterMessage)
      {
        filterMessage.forEach(cv => {

          if(cv.totalUnread>0)
          {
            totalUnread += 1;
          }
      
        });
      }

      finalResult = { list: filterMessage,channel: 'chat', totalUnread: totalUnread };

    // console.log("finalResult kakakaka ==",finalResult)

    resolve(finalResult) ;
});
export const getMessagesByConversationAndUsersId = async ({ usersId,conversationId, range }) => new Promise(async resolve => {
  let finalResult;

  // console.log("input getMessagesByConversationAndUsersId==",usersId, conversationId, range);

  range = (typeof range === 'string') ? JSON.parse(range) : range ? range : [0, 10];
  const perPage = range[1] - range[0] + 1;
  const connection = await r.connect({
    host: CONFIG['RETHINKDB_SERVER'],
    port: CONFIG['RETHINKDB_PORT'],
    db: CONFIG['RETHINKDB_DB']
  });

  let result= await r
    .table('conversations')
    .filter(
      function(user) {
      return ((user("sender")("id").eq(usersId.toString())).or(user("recipient").contains(function (recipient){
        return recipient("id").eq(usersId.toString())
      }))).and(user("conversationId").eq(conversationId));
      }
    )
    .group('conversationId')
    .ungroup()
    .run(connection, async function(err, result) {
      if (err) {
        console.log('DB failed] %s:%s\n%s', err.name, err.msg, err.message);
      }
    });
      const userMessages = [];
      let filterMessage = [];
      const conversationGroup = [];

      await r.table('conversationGroups')
      // .get("85cafcf3-39f7-4d6c-bbaf-ad4ec6a766da")
      .run(connection, function(err,cursor) {
        if (err) {
          console.log('rethinkDB failed %s:%s\n%s', err.name, err.msg, err.message);
        }
      
        cursor.each(function(error, item) {
          conversationGroup.push(item);
        })
      });

      // console.log("range chat conversationGroup=",conversationGroup);
      if (result) {

          await result.forEach(async (item) => {
            const userMessages = [];
  
            userMessages.push(item.reduction);
            const groupInfor = _.filter(conversationGroup,{id:item.group});

              // console.log("groupInfor=",groupInfor);
              userMessages.forEach( (item) => {
                  let totalUnread = 0;
  
                item = _.orderBy(item, ['time'], ['desc']);
  
                item.forEach(cv => {
                  
                  let arrayReadUser =  _.filter(groupInfor[0].read,["id",usersId.toString()]);
  
                  let timeReadUser;
      
                  if(_.size(arrayReadUser) >0)
                  {
                    timeReadUser = arrayReadUser[0].time;
                    if(timeReadUser < cv.time)
                    {
                      totalUnread += 1;
                    }
                  }
                  else
                  {
                    totalUnread += 1;
                  }
                });
                
                item = { ...item[0],..._.omit(groupInfor[0],["id","time","status"]), totalUnread };
                // console.log("item====",item)
                filterMessage.push(item);
  
              });
              filterMessage = _.orderBy(filterMessage, 'time', ['desc']);
  
              const end = perPage > filterMessage.length ? filterMessage.length : perPage;
  
              filterMessage = filterMessage.slice(range[0], end);
          })

       
      }
    
      // console.log("filterMessage*************",filterMessage);
      let totalUnread = 0;
      
      if(filterMessage)
      {
        filterMessage.forEach(cv => {

          

          if(cv.totalUnread>0)
          {
            totalUnread += 1;
          }
      
        });
      }
        
      finalResult = { list: filterMessage,channel: 'chat', totalUnread: totalUnread };

    // console.log("finalResult==",finalResult)

    resolve(finalResult) ;
});
export const getEmail = async ({  usersId, range,filter }) => {
  let finalResult;
  let totalRow;
   console.log("filter===",filter,"===usersId=",usersId,"===range=",range);
 
 let { mailTitle, receiversId,senderId,FromDate,ToDate } = filter || {};

  range = (typeof range === 'string') ? JSON.parse(range) : range ? range : [0, 10];
  const perPage = range[1] - range[0] + 1;
  const page = Math.floor(range[0] / perPage);
  const connection = await r.connect({
    host: CONFIG['RETHINKDB_SERVER'],
    port: CONFIG['RETHINKDB_PORT'],
    db: CONFIG['RETHINKDB_DB']
  });

  let filterFinal= function(user) {
    return user("status").eq(1).and((user("sender")("id").eq(usersId.toString()).and(user("mailReplyId").ne("0"))).or(user("receivers").contains(function (receiver){
      return receiver("id").eq(usersId.toString())
    })))
    .and(user("mailTitle").match(mailTitle || ""))
    .and(user("sender")("id").eq(r.branch(r.expr(senderId || "0").eq("0"),user("sender")("id"),senderId || "0")))
    .and(
      user("receivers").contains(function (receiver){
        return  receiver("id").eq(r.branch(r.expr(receiversId || "0").eq("0"),receiver("id"),receiversId || "0"))
      })
    )
    .and(
      user("mailSendingDate").gt(FromDate || '1970-01-01 00:00:00')
     .and(user("mailSendingDate").lt(ToDate || '3000-01-01 00:00:00'))

    )
    ;
    }

 

  await r
    .table('mails')
    .filter(filterFinal)
    .group('conversationsId')
    .ungroup()
    .run(connection, async function(err, result) {
      if (err) {
        console.log('DB failed] %s:%s\n%s', err.name, err.msg, err.message);
      }
      const userMessages = [];
      let filterMessage = [];
     
      if (result && Array.isArray(result)) {
        result.forEach(item => {
          userMessages.push(item.reduction);
        });
        console.log("userMessages===",userMessages)
        userMessages.forEach(item => {
          // console.log(item.conversationId);
          // const unreadCount = await getUnreadCount({ conversationId: item.conversationId });
          // console.log(unreadCount);
          // item = { ...item, unreadCount };
          let totalUnread = 0;

          item = _.orderBy(item, ['mailSendingDate'], ['desc']);
          item.forEach(cv => {
            // if(cv.read.length===0)
            // {
            //   totalUnread += 1;
            // }
            // else
            // {
              _.find(cv.receivers, function(o){
                // console.log("o.id==",o.id)
                if(o.id === usersId.toString() && o.read ==="0") totalUnread += 1;
              });
            // }
          });

          item = { ...item[0], totalUnread };
          filterMessage.push(item);
        });
        
        filterMessage = _.orderBy(filterMessage, 'mailSendingDate', ['desc']);
        console.log("perPage===",perPage)
        const end = perPage > filterMessage.length ? filterMessage.length : perPage;
        console.log("end===",end)
        totalRow = filterMessage.length;
        filterMessage = await filterMessage.slice(range[0], range[0] + end);
      }
      console.log("filterMessage===",filterMessage)

      // let res = filterMessage.reduce((r, object) => {

      // let temp;

      // if (!temp) r.push((temp = { conversations: [] }));
      // temp.conversations.push(object);


      //   return r;
      // }, []);
      let totalUnread = 0;

      if (filterMessage && Array.isArray(filterMessage)) {
        filterMessage.forEach(item => {
          totalUnread += item.totalUnread || 0
        
        });
      }
      finalResult = {
                      list:filterMessage,channel:'email',totalUnread:totalUnread
                      // ,pagination:{
                      //     current: page,
                      //     pageSize: perPage,
                      //     total: totalRow
                      // }
                    };
      });
    // console.log("finalResult==",finalResult)
  
    return finalResult;
};


export const getSendedEmail = async ({  usersId, range,filter }) => {
  let finalResult;
  let totalRow;
 // console.log(usersId, range);
 console.log("filter===",filter,"===usersId=",usersId,"===range=",range);
 
 let { mailTitle, receiversId,senderId,FromDate,ToDate } = filter || {};

  range = (typeof range === 'string') ? JSON.parse(range) : range ? range : [0, 10];
  const perPage = range[1] - range[0] + 1;
  const page = Math.floor(range[0] / perPage);
  const connection = await r.connect({
    host: CONFIG['RETHINKDB_SERVER'],
    port: CONFIG['RETHINKDB_PORT'],
    db: CONFIG['RETHINKDB_DB']
  });

  await r
    .table('mails')
    .filter(  function(user) {
      return user("status").eq(1).and((user("sender")("id").eq(usersId.toString())))
                  .and(user("mailTitle").match(mailTitle || ""))
                  .and(user("sender")("id").eq(r.branch(r.expr(senderId || "0").eq("0"),user("sender")("id"),senderId || "0")))
                  .and(
                    user("receivers").contains(function (receiver){
                      return  receiver("id").eq(r.branch(r.expr(receiversId || "0").eq("0"),receiver("id"),receiversId || "0"))
                    })
                  )
                  .and(
                    user("mailSendingDate").gt(FromDate || '1970-01-01 00:00:00')
                   .and(user("mailSendingDate").lt(ToDate || '3000-01-01 00:00:00'))
              
                  )
                ;
      })
    .group('conversationsId')
    .ungroup()
    .run(connection, async function(err, result) {
      if (err) {
        console.log('DB failed] %s:%s\n%s', err.name, err.msg, err.message);
      }
      const userMessages = [];
      let filterMessage = [];
     
      if (result && Array.isArray(result)) {
        result.forEach(item => {
          userMessages.push(item.reduction);
        });
        console.log("userMessages===",userMessages)
        userMessages.forEach(item => {
          let totalUnread = 0;

          item = _.orderBy(item, ['mailSendingDate'], ['desc']);
          item.forEach(cv => {
              _.find(cv.receivers, function(o){
                if(o.id === usersId.toString() && o.read ==="0") totalUnread += 1;
              });
          });

          item = { ...item[0], totalUnread };
          filterMessage.push(item);
        });
        
        filterMessage = _.orderBy(filterMessage, 'mailSendingDate', ['desc']);
        console.log("perPage===",perPage)
        const end = perPage > filterMessage.length ? filterMessage.length : perPage;
        console.log("end===",end)
        totalRow = filterMessage.length;
        filterMessage = await filterMessage.slice(range[0], range[0] + end);
      }
      console.log("filterMessage===",filterMessage)

      let totalUnread = 0;


      filterMessage.forEach(item => {
        totalUnread += item.totalUnread || 0
       
      });
      finalResult = {
                      list:filterMessage,channel:'email',totalUnread:totalUnread
                      // ,pagination:{
                      //     current: page,
                      //     pageSize: perPage,
                      //     total: totalRow
                      // }
                    };
      });
    // console.log("finalResult==",finalResult)
  
    return finalResult;
};

// eslint-disable-next-line require-jsdoc
export const getMessagesFromUserConversations = async ({ conversationId,usersId, range })  => new Promise(async resolve => {
  let finnalyResult;
  let totalRow;
  // console.log('getMessagesFromUser', { conversationId,usersId, range });

  try {
    // const id = conversationId.split('_');

    range = range ? range : [0, 7];
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);
    const connection = await r.connect({
      host: CONFIG.RETHINKDB_SERVER,
      port: CONFIG.RETHINKDB_PORT,
      db: CONFIG.RETHINKDB_DB
    });
  
    let result = await r
      .table('conversations')
      .filter(
          function(user) {
            return ((user("sender")("id").eq(usersId.toString())).or(user("recipient").contains(function (recipient){
              return recipient("id").eq(usersId.toString())
            })).and( user("conversationId").eq(conversationId.toString())));
            }
      )
      .orderBy(r.desc('time'))
      .skip(page)
      .limit(perPage)
      .run(connection, function(err, result) {
        if (err) {
          console.log('DB---->Insert failed] %s:%s\n%s', err.name, err.msg, err.message);
        }
        
        // console.log(JSON.stringify(result, null, 2));
        // result.map(item => {
        //   return {
        //     message: item.message,
        //     senderId: item.sender,
        //     recipientId: item.recipient,
        //     status: item.status,
        //     time: item.time
        //   };
        // });

        // finnalyResult = {list:result,channel:'chat'}

      });

      const userMessages = [];
      let filterMessage = [];
      const conversationGroup = [];

      let groupInfor = await r.table('conversationGroups')
      .get(conversationId)
      .run(connection, function(err,cursor) {
        if (err) {
          console.log('rethinkDB failed %s:%s\n%s', err.name, err.msg, err.message);
        }
      });

      // console.log("range chat groupInfor=",groupInfor);
      if (result) {

        await result.forEach(async (item) => {
              let totalUnread=0;
              let arrayReadUser =  _.filter(groupInfor.read,["id",usersId.toString()]);

              // console.log("arrayReadUser----",arrayReadUser)

              let timeReadUser;
              
              if(_.size(arrayReadUser) >0)
              {
                timeReadUser = arrayReadUser[0].time;
                if(timeReadUser < item.time)
                {
                  totalUnread += 1;
                }
              }
              else
              {
                totalUnread += 1;
              }
              
              item = { ...item,..._.omit(groupInfor,["id","time","status"]), totalUnread };
              // console.log("item====",item)
              filterMessage.push(item);
        });
        filterMessage = _.orderBy(filterMessage, 'time', ['desc']);

        const end = perPage > filterMessage.length ? filterMessage.length : perPage;

        filterMessage = filterMessage.slice(range[0], end);
      }

    
      // console.log("filterMessage*************",filterMessage);
      let totalUnread = 0;
      
      if(filterMessage)
      {
        filterMessage.forEach(cv => {

          

          if(cv.totalUnread>0)
          {
            totalUnread += 1;
          }
      
        });
      }
        
      finnalyResult = { list: filterMessage,channel: 'chat', totalUnread: totalUnread };
  } catch (e) {
    console.log('getMessagesFromUser, ', e);
  }

  resolve(finnalyResult) ;
}
);
export const getEmailFromUserConversations = async ({ conversationsId,usersId, range }) => {
  let output;
  let totalRow;
  
  console.log('getMessagesFromUser', { conversationsId,usersId, range });
  try {
    // const id = conversationId.split('_');

    range = range ? range : [0, 7];
    const perPage = range[1] - range[0] + 1;
    const page = Math.floor(range[0] / perPage);

    const connection = await r.connect({
      host: CONFIG.RETHINKDB_SERVER,
      port: CONFIG.RETHINKDB_PORT,
      db: CONFIG.RETHINKDB_DB
    });
     console.log("getEmailFromUserConversations===")
    await r
      .table('mails')
      .filter(
        function(user) {
          return user("status").eq(1).and((user("sender")("id").eq(usersId.toString())).or(user("receivers").contains(function (receiver){
            return receiver("id").eq(usersId.toString())
          })).and( user("conversationsId").eq(conversationsId.toString())));
          }
      
      )
      .orderBy(r.desc('mailSendingDate'))
      .skip(page)
      .limit(perPage)
      .run(connection, function(err, result) {
        if (err) {
          console.log('DB---->Insert failed] %s:%s\n%s', err.name, err.msg, err.message);
        }
        console.log("getEmailFromUserConversations result===",result )
        totalRow = result.length;
        let finnalyResult = {list:result,channel:'email'
        }

        console.log("string json ====",JSON.stringify(result, null, 2));
        output = result;
      });
  } catch (e) {
    console.log('getMessagesFromUser, ', e);
  }

  return output;
};
export default {
  getNotifcations,
  getMessages,
  getMessagesFromUserConversations,
  getNotifcationsEmail,
  getEmail,
  getEmailFromUserConversations,
  getSendedEmail,
  getMessagesByConversationAndUsersId
};
