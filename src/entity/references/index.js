export default models => {
  // eslint-disable-next-line no-empty-pattern
  const {
    provinces,
    districts,
    wards,
    users,
    menus,
    userGroupRoles,
    userGroups,
    areas,
    areasProvinces,
    disasterGroups,
    disasters,
    explorers,
    requestDownloads,
    riverBasins,
    explorerGroups,
    maps,
    producers,
    targetAudiences,
    communicationProductsGroups,
    phasesOfDisasters,
    contents,
    contentAreas,
    contentDisasterGroups,
    contentTargetAudiences,
    socials,
    socialChannels,
    contentSocials,
    contentSocialRelations,
    mails,
    receivers,
    newspapers,
    news,
    disastersContents,
    newsUrlSlugs,
    contentReviews,
    disastersNews,
    typeOfNews,
    newsTypeOfNews,
    reports,
    reportSendEmail,
    botAccounts,
    botPosts,
    botPostsTypeOfPosts,
    botTrackedObject,
    botTypeOfPosts,
    botTypeOfTrackedObject,
    disasterSocialRelations,
    contentSocialsStatistic,
    roomChatsUsers,
    roomChats,
    chatMessages,
    mailsUsers,
    roomMails,
    newKindOfDisaster,
    newGroups
  } = models;

  // Users.hasMany(Roles, { foreignKey: 'UserId', as: 'RoleDetails' })
  // Người dùng

  users.belongsTo(provinces, {
    foreignKey: 'provincesId',
    as: 'provinces'
  });
  users.belongsTo(userGroups, {
    foreignKey: 'userGroupsId',
    as: 'userGroups'
  });
  // NHÓM NGƯỜI DÙNG
  userGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  // Quyền
  userGroupRoles.belongsTo(menus, {
    foreignKey: 'menusId',
    as: 'menus'
  });
  userGroupRoles.belongsTo(userGroups, {
    foreignKey: 'userGroupsId',
    as: 'userGroups'
  });
  // TỈNH
  provinces.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  // QUẬN
  districts.belongsTo(provinces, {
    foreignKey: 'provincesId',
    as: 'provinces'
  });
  districts.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  // HUYỆN
  wards.belongsTo(districts, {
    foreignKey: 'districtsId',
    as: 'districts'
  });
  wards.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  // MENU
  menus.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  menus.hasMany(userGroupRoles, {
    foreignKey: 'menusId',
    as: 'userGroupRoles'
  });
  // VUNG - LUC VUC SONG
  areas.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  areas.hasMany(areasProvinces, {
    foreignKey: 'areasId',
    as: 'areasProvinceses'
  });
  areas.belongsToMany(provinces, {
    through: areasProvinces,
    foreignKey: 'provincesId',
    as: 'provinces'
  });

  areasProvinces.belongsTo(provinces, {
    foreignKey: 'provincesId',
    as: 'provinces'
  });
  provinces.belongsToMany(areas, {
    through: areasProvinces,
    foreignKey: 'areasId',
    as: 'areas'
  });
  disasterGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  disasters.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  disasters.belongsTo(disasterGroups, {
    foreignKey: 'disasterGroupsId',
    targetKey: 'disasterGroupVndmsId',
    as: 'disasterGroups'
  });
  explorers.belongsTo(disasters, {
    foreignKey: 'disastersId',
    targetKey: 'disasterVndmsId',
    as: 'disasters'
  });
  explorers.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  explorers.belongsTo(explorerGroups, {
    foreignKey: 'explorerGroupsId',
    as: 'explorerGroups'
  });
  requestDownloads.belongsTo(users, {
    foreignKey: 'userApprovedsId',
    as: 'userApproved'
  });
  requestDownloads.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  requestDownloads.belongsTo(explorers, {
    foreignKey: 'explorersId',
    as: 'explorers'
  });
  riverBasins.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  explorerGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  maps.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  producers.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  targetAudiences.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  communicationProductsGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  phasesOfDisasters.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  contents.hasMany(contentAreas, {
    foreignKey: 'contentsId',
    as: 'contentAreas'
  });
  contents.hasMany(contentTargetAudiences, {
    foreignKey: 'contentsId',
    as: 'contentTargetAudiences'
  });
  contents.hasMany(contentDisasterGroups, {
    foreignKey: 'contentsId',
    as: 'contentDisasterGroups'
  });
  contents.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  contents.belongsTo(communicationProductsGroups, {
    foreignKey: 'communicationProductsGroupsId',
    as: 'communicationProductsGroups'
  });
  contents.belongsTo(phasesOfDisasters, {
    foreignKey: 'phasesOfDisastersId',
    as: 'phasesOfDisasters'
  });
  contents.belongsTo(producers, {
    foreignKey: 'producersId',
    as: 'producers'
  });
  contentAreas.belongsTo(areas, {
    foreignKey: 'areasId',
    as: 'areas'
  });
  contentDisasterGroups.belongsTo(disasterGroups, {
    foreignKey: 'disasterGroupsId',
    as: 'disasterGroups'
  });
  contentTargetAudiences.belongsTo(targetAudiences, {
    foreignKey: 'targetAudiencesId',
    as: 'targetAudiences'
  });
  socials.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  socialChannels.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  socialChannels.belongsTo(socials, {
    foreignKey: 'socialsId',
    as: 'socials'
  });
  contentSocials.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  contentSocials.belongsTo(socialChannels, {
    foreignKey: 'socialChannelsId',
    as: 'socialChannels'
  });
  contentSocials.hasOne(contentSocialsStatistic, {
    foreignKey: 'contentSocialsId',
    as: 'contentSocialsStatistic'
  });
  contentSocials.belongsToMany(contents, {
    through: contentSocialRelations,
    as: 'contents',
    timestamps: false,
    foreignKey: 'contentSocialsId'
  });
  contents.belongsToMany(contentSocials, {
    through: contentSocialRelations,
    as: 'contentSocials',
    timestamps: false,
    foreignKey: 'contentsId'
  });
  mails.belongsTo(users, {
    foreignKey: 'userSendersId',
    as: 'senders'
  });
  mails.hasMany(receivers, {
    foreignKey: 'mailsId',
    as: 'listReceivers'
  });
  receivers.belongsTo(mails, {
    foreignKey: 'mailsId',
    as: 'mails'
  });
  receivers.belongsTo(users, {
    foreignKey: 'receiversId',
    as: 'receivers'
  });
  news.belongsTo(newspapers, {
    foreignKey: 'newspapersId',
    as: 'newspapers'
  });

  news.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  news.belongsTo(users, {
    foreignKey: 'userApprovedId',
    as: 'userApproveds'
  });
  newspapers.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  disasters.belongsToMany(contents, {
    through: disastersContents,
    as: 'contents',
    sourceKey: 'disasterVndmsId',
    foreignKey: 'disastersId'
  });
  contents.belongsToMany(disasters, {
    through: disastersContents,
    as: 'disasters',
    foreignKey: 'contentsId'
  });
  disasters.hasMany(disastersContents, {
    foreignKey: 'disastersId',
    sourceKey: 'disasterVndmsId',
    as: 'disastersContents'
  });
  disastersContents.belongsTo(contents, {
    foreignKey: 'contentsId',
    as: 'contents'
  });
  news.hasMany(newsUrlSlugs, {
    foreignKey: 'newsId',
    as: 'newsUrlSlugs'
  });
  newsUrlSlugs.belongsTo(news, {
    foreignKey: 'newsId',
    as: 'news'
  });
  contentReviews.belongsTo(contents, {
    foreignKey: 'contentsId',
    as: 'contents'
  });
  contents.hasMany(contentReviews, {
    foreignKey: 'contentsId',
    as: 'contentReviews'
  });

  disasters.belongsToMany(news, {
    through: disastersNews,
    sourceKey: 'disasterVndmsId',
    foreignKey: 'disastersId',
    as: 'news'
  });
  news.belongsToMany(disasters, {
    through: disastersNews,
    foreignKey: 'newsId',
    as: 'disasters'
  });
  news.hasMany(disastersNews, {
    foreignKey: 'newsId',
    as: 'disastersNews'
  });
  disastersNews.belongsTo(disasters, {
    foreignKey: 'disastersId',
    as: 'disasters'
  });

  typeOfNews.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  typeOfNews.belongsToMany(news, {
    through: newsTypeOfNews,
    foreignKey: 'typeOfNewsId',
    as: 'news'
  });
  news.belongsToMany(typeOfNews, {
    through: newsTypeOfNews,
    foreignKey: 'newsId',
    as: 'typeOfNews'
  });

  news.hasMany(newsTypeOfNews, {
    foreignKey: 'newsId',
    as: 'newsTypeOfNews'
  });
  newsTypeOfNews.belongsTo(typeOfNews, {
    foreignKey: 'typeOfNewsId',
    as: 'typeOfNews'
  });
  reports.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  reportSendEmail.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  botTypeOfPosts.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  botTypeOfPosts.belongsToMany(botPosts, {
    through: botPostsTypeOfPosts,
    foreignKey: 'typeOfPostsId',
    as: 'botPosts'
  });
  botPosts.belongsToMany(botTypeOfPosts, {
    through: botPostsTypeOfPosts,
    foreignKey: 'postsId',
    as: 'botTypeOfPosts'
  });
  botPosts.belongsTo(botTrackedObject, {
    foreignKey: 'poster',
    targetKey: 'trackedObjectId',
    as: 'author'
  });
  botPosts.belongsTo(botTrackedObject, {
    foreignKey: 'placeofPost',
    targetKey: 'trackedObjectId',
    as: 'placePost'
  });
  botAccounts.hasMany(botTrackedObject, {
    foreignKey: 'botAccountsId',
    as: 'botTrackedObject'
  });
  botTrackedObject.belongsTo(botAccounts, {
    foreignKey: 'botAccountsId',
    as: 'botAccounts'
  });
  botTrackedObject.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  botAccounts.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  botTrackedObject.belongsTo(botTypeOfTrackedObject, {
    foreignKey: 'trackedObjectType',
    as: 'botTypeOfTrackedObject'
  });

  contentSocials.belongsToMany(disasters, {
    through: disasterSocialRelations,
    as: 'disasters',
    timestamps: false,
    foreignKey: 'contentSocialsId'
  });
  disasters.belongsToMany(contentSocials, {
    through: disasterSocialRelations,
    as: 'contentSocials',
    timestamps: false,
    sourceKey: 'disasterVndmsId',
    foreignKey: 'disastersId'
  });
  roomChatsUsers.belongsTo(roomChats, {
    foreignKey: 'roomChatsId',
    as: 'roomChats'
  });
  roomChatsUsers.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });
  roomChats.hasMany(roomChatsUsers, {
    foreignKey: 'roomChatsId',
    as: 'roomChatsUsers'
  });
  roomChats.hasMany(chatMessages, {
    foreignKey: 'roomChatsId',
    as: 'chatMessages'
  });
  chatMessages.belongsTo(chatMessages, {
    foreignKey: 'replyId',
    as: 'chatMessagesReply'
  });
  chatMessages.belongsTo(roomChats, {
    foreignKey: 'roomChatsId',
    as: 'roomChats'
  });
  roomMails.hasMany(mails, {
    foreignKey: 'roomMailsId',
    as: 'mails'
  });
  mails.hasMany(mailsUsers, {
    foreignKey: 'mailsId',
    as: 'mailsUsers'
  });
  mailsUsers.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });
  newKindOfDisaster.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  newGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  news.belongsTo(newGroups, {
    foreignKey: 'newGroupsId',
    as: 'newGroups'
  });
};
