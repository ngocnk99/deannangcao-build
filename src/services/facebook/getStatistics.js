import axios from 'axios';
import CONFIG from '../../config';
import MODELS from '../../models/models';
import models from '../../entity';
import * as ApiErrors from '../../errors';
import checkAccesToken from './checkAccesToken';
const { /* sequelize, */ contentSocials, socialChannels } = models;
import _ from 'lodash';
const pageVideo = async (contentSocialId, socialChannelToken, detailSocialChannel, errorMessage) => {
  const urlVideoInsights = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}/video_insights?metric=total_video_views`;
  const urlDetails = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=comments.summary(true),likes.summary(true),source,title,description`;
  console.log('pageVideo');
  console.log('url1', urlVideoInsights);
  console.log('urlDetails', urlDetails);
  let warring = [];
  const [result, fields] = await Promise.all([
    axios({
      method: 'get',
      url: urlVideoInsights,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      warring.push({
        message: errorMessage == 1 ? 'Bài viết không tồn tại hoặc accesToken không đúng ' : `Bài viết không tôn tại `,
        contentSocialId: contentSocialId,
        err: err
      });
      // throw new ApiErrors.BaseError(err);
    }),
    axios({
      method: 'get',
      url: urlDetails,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      warring.push({
        message: `Bài viết không tôn tại `,
        contentSocialId: contentSocialId,
        err: err
      });
    })
  ]);

  let output = [];
  if (result?.data?.data && result?.data?.data.length > 0) {
    output = result.data.data.map(d => {
      const temp = {};
      if (d.name === 'total_video_views') {
        temp.name = 'số người xem ';
        temp.values = d.values[0]?.value;
      }
      return temp;
    });
  }
  fields?.data?.likes &&
    output.push({
      name: 'Lượt thích',
      values: fields.data?.likes.summary.total_count
    });
  fields?.data?.comments &&
    output.push({
      name: 'Số lượt bình luận',
      values: fields.data?.comments.summary.total_count
    });
  return {
    content: {
      source: fields?.data?.source,
      message: fields?.data?.title,
      description: fields?.data?.description
    },
    statistic: output,
    warring: warring
  };
};
const pageNotVideo = async (contentSocialId, socialChannelToken, detailSocialChannel, errorMessage) => {
  console.log('group page không video');
  let url = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=comments.summary(true),reactions.summary(true),message,attachments`;

  console.log('urlgroup', url);
  console.log('access_token', socialChannelToken);
  let warring = [];
  const facebookGroup = await axios({
    method: 'get',
    url,
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      access_token: `${socialChannelToken}`
    }
  }).catch(err => {
    warring.push({
      message: errorMessage == 1 ? 'Bài viết không tồn tại hoặc accesToken không đúng ' : `Bài viết không tôn tại `,
      contentSocialId: contentSocialId,
      err: err
    });
  });
  let statistic;
  if (facebookGroup?.data) {
    let viewCount = null;
    let likeCount = facebookGroup?.data?.reactions?.summary?.total_count;
    let commentCount = facebookGroup?.data?.comments?.summary?.total_count;
    statistic = [
      {
        name: 'Lượt thích',
        values: likeCount
      },
      {
        name: 'Lượt xem',
        values: viewCount
      },
      {
        name: 'Số lượt bình luận',
        values: commentCount
      }
    ];
  } else {
    statistic = null;
  }
  return {
    content: {
      message: facebookGroup?.data?.message,
      attachments: facebookGroup?.data?.attachments,
      description: facebookGroup?.data?.description
    },
    statistic: statistic,
    warring: warring
  };
};
const groupNotVideo = async (contentSocialId, socialChannelToken, detailSocialChannel, errorMessage) => {
  console.log('group page không video');
  let url = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=comments.summary(true),reactions.summary(true),message,attachments`;

  console.log('urlgroup', url);
  console.log('access_token', socialChannelToken);
  let warring = [];
  const facebookGroup = await axios({
    method: 'get',
    url,
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      access_token: `${socialChannelToken}`
    }
  }).catch(err => {
    warring.push({
      message: errorMessage == 1 ? 'Bài viết không tồn tại hoặc accesToken không đúng ' : `Bài viết không tôn tại `,
      contentSocialId: contentSocialId,
      err: err
    });
  });
  let statistic;
  // console.log('facebookGroup?.data', facebookGroup?.data);
  if (facebookGroup?.data) {
    let viewCount = null;
    let likeCount = facebookGroup?.data?.reactions?.summary?.total_count;
    let commentCount = facebookGroup?.data?.comments?.summary?.total_count;
    statistic = [
      {
        name: 'Lượt thích',
        values: likeCount
      },
      {
        name: 'Lượt xem',
        values: viewCount
      },
      {
        name: 'Số lượt bình luận',
        values: commentCount
      }
    ];
  } else {
    statistic = null;
  }
  return {
    content: {
      message: facebookGroup?.data?.message,
      attachments: facebookGroup?.data?.attachments,
      description: facebookGroup?.data?.description
    },
    statistic: statistic,
    warring: warring
  };
};
const groupVideo = async (contentSocialId, socialChannelToken, detailSocialChannel, errorMessage) => {
  let urlDetails = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=comments.summary(true),likes.summary(true),source,title,description`;
  let urlVideoInsights = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}/video_insights?metric=total_video_views`;
  console.log('groupVideo urlDetails', urlDetails);
  console.log('groupVideo urlVideoInsights', urlVideoInsights);
  console.log('access_token', socialChannelToken);
  let warring = [];
  const [resultDetails, resultVideoInsights] = await Promise.all([
    axios({
      method: 'get',
      url: urlDetails,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      warring.push({
        message: `không lấy được resultDetails`,
        contentSocialId: contentSocialId,
        err: err
      });
    }),
    axios({
      method: 'get',
      url: urlVideoInsights,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      warring.push({
        message: `không lấy được resultVideoInsights`,
        contentSocialId: contentSocialId,
        err: err
      });
    })
  ]);
  // console.log('groupVideo resultDetails', resultDetails?.data);
  // console.log('groupVideo resultVideoInsights', resultVideoInsights?.data);
  // const facebookGroup = await axios({
  //   method: 'get',
  //   url,
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   params: {
  //     access_token: `${socialChannelToken}`
  //   }
  // }).catch(error => {
  //   ErrorHelpers.errorThrow(error, 'crudError', 'contentSocialsService');
  // });

  let statistic;
  if (resultDetails?.data && resultVideoInsights?.data) {
    let viewCount = resultVideoInsights.data.data[0]?.values[0]?.value;
    let likeCount = resultDetails.data?.likes?.summary?.total_count;
    let commentCount = resultDetails.data?.comments?.summary?.total_count;

    statistic = [
      {
        name: 'Lượt thích',
        values: likeCount
      },
      {
        name: 'Lượt xem',
        values: viewCount
      },
      {
        name: 'Số lượt bình luận',
        values: commentCount
      }
    ];
  } else {
    statistic = null;
  }

  return {
    content: {
      message: resultDetails?.data?.title,
      description: resultDetails?.data?.description,
      attachments: resultDetails?.data?.attachments,
      source: resultDetails?.data?.source
    },
    statistic: statistic,
    warring: warring
  };
};

const pageVideoDetail = async (contentSocialId, socialChannelToken, detailSocialChannel) => {
  console.log(' page  video');
  const urlInsights = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${detailSocialChannel.socialChannelUrl}_${contentSocialId}/insights?metric=post_reactions_by_type_total,post_impressions_unique,post_negative_feedback_by_type,post_clicks`;
  const urlDetails = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=comments.summary(true),source,title,description`;
  console.log('urlgroup', urlDetails);
  console.log('urlInsights', urlInsights);
  console.log('access_token', socialChannelToken);

  let warring = [];
  const [fields, insights] = await Promise.all([
    axios({
      method: 'get',
      url: urlDetails,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      warring.push({
        message: `Bài viết không tôn tại `,
        contentSocialId: contentSocialId,
        err: err
      });
      // throw new ApiErrors.BaseError(err);
    }),
    axios({
      method: 'get',
      url: urlInsights,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      warring.push({
        message: `Bài viết không tôn tại `,
        contentSocialId: contentSocialId,
        err: err
      });
    })
  ]);

  let statistic = [];
  if (fields?.data) {
    let commentCount = fields?.data?.comments?.summary?.total_count;
    statistic.push({
      name: 'Số lượt bình luận',
      values: commentCount
    });
  }
  console.log('1');
  console.log('insights?.data', insights?.data);
  if (insights?.data?.data && insights?.data?.data?.length > 0) {
    insights.data.data.forEach(d => {
      if (typeof d.values[0].value === 'object') {
        let name = d.name;
        let values = 0;
        let detail = [];

        if (name === 'post_reactions_by_type_total') name = 'Số lượt bày tỏ cảm xúc';
        if (name === 'post_negative_feedback_by_type') name = 'Tổng số phẩn hồi tiêu cực ';
        statistic.push({
          name: name,
          values: values,
          detail: detail
        });
        console.log('d', d);
        if (!(Object.keys(d.values[0].value).length === 0)) {
          Object.entries(d.values[0].value).forEach(element => {
            let elementName = element[0];
            if (elementName === 'hide_clicks') elementName = 'Ẩn câu chuyện';
            if (elementName === 'hide_all_clicks') elementName = 'Ẩn tất cả bài đăng khỏi trang này';
            if (elementName === 'report_spam_clicks') elementName = 'Báo cáo đối tượng là spam';
            if (elementName === 'unlike_page_clicks') elementName = 'Bỏ thích trang này';
            statistic[statistic.length - 1].detail.push({
              name: elementName,
              values: element[1]
            });
            statistic[statistic.length - 1].values = statistic[statistic.length - 1].values + element[1];
          });
        }
      } else {
        let name = d.name;
        if (name === 'post_impressions_unique') name = 'Tổng số người tiếp cận';
        if (name === 'post_reactions_by_type_total') name = 'Cảm xúc,Bình Luận & chia sẻ';
        if (name === 'post_clicks') name = 'Tổng click vào bài viết';

        statistic.push({
          name: name,
          values: d.values[0].value
        });
      }
    });
  }

  return {
    content: {
      message: fields?.data?.title,
      attachments: fields?.data?.attachments,
      description: fields?.data?.description,
      source: fields?.data?.source
    },
    statistic: statistic,
    warring: warring
  };
};
const pageNotVideoDetail = async (contentSocialId, socialChannelToken, detailSocialChannel) => {
  console.log(' page không video detail');
  let urlDetails = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=comments.summary(true),reactions.summary(true),message,attachments`;
  let urlInsights = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}/insights?metric=post_reactions_by_type_total,post_impressions_unique,post_negative_feedback_by_type,post_clicks`;
  console.log('urlDetails', urlDetails);
  console.log('urlInsights', urlInsights);
  console.log('access_token', socialChannelToken);

  let warring = [];
  const [fields, insights] = await Promise.all([
    axios({
      method: 'get',
      url: urlDetails,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      warring.push({
        message: `Bài viết không tôn tại fields`,
        contentSocialId: contentSocialId,
        err: err
      });
      // throw new ApiErrors.BaseError(err);
    }),
    axios({
      method: 'get',
      url: urlInsights,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      warring.push({
        message: `Bài viết không tôn tại insights`,
        contentSocialId: contentSocialId,
        err: err
      });
    })
  ]);
  console.log('insights');
  let statistic = [];
  if (fields?.data) {
    let commentCount = fields?.data?.comments?.summary?.total_count;
    statistic.push({
      name: 'Số lượt bình luận',
      values: commentCount
    });
  }
  console.log('insights?.data', insights?.data?.data);
  if (insights?.data?.data && insights?.data?.data?.length > 0) {
    insights.data.data.forEach(d => {
      let name = d.name;
      if (name === 'post_reactions_by_type_total') name = 'Số lượt bày tỏ cảm xúc';
      if (name === 'post_negative_feedback_by_type') name = 'Tổng số phẩn hồi tiêu cực ';
      if (name === 'post_impressions_unique') name = 'Tổng số người tiếp cận';
      if (name === 'post_reactions_by_type_total') name = 'Cảm xúc,Bình Luận & chia sẻ';
      if (name === 'post_clicks') name = 'Tổng click vào bài viết';
      if (typeof d.values[0].value === 'object') {
        let values = 0;
        let detail = [];

        statistic.push({
          name: name,
          values: values,
          detail: detail
        });
        console.log('d', d);
        if (!(Object.keys(d.values[0].value).length === 0)) {
          Object.entries(d.values[0].value).forEach(element => {
            let elementName = element[0];
            if (elementName === 'hide_clicks') elementName = 'Ẩn câu chuyện';
            if (elementName === 'hide_all_clicks') elementName = 'Ẩn tất cả bài đăng khỏi trang này';
            if (elementName === 'report_spam_clicks') elementName = 'Báo cáo đối tượng là spam';
            if (elementName === 'unlike_page_clicks') elementName = 'Bỏ thích trang này';
            statistic[statistic.length - 1].detail.push({
              name: elementName,
              values: element[1]
            });
            statistic[statistic.length - 1].values = statistic[statistic.length - 1].values + element[1];
          });
        }
      } else {
        statistic.push({
          name: name,
          values: d.values[0].value
        });
      }
    });
  }

  return {
    content: {
      message: fields?.data?.message,
      attachments: fields?.data?.attachments,
      description: fields?.data?.description
    },
    statistic: statistic,
    warring: warring
  };
};

//getContentStatic
const getOneGroupNotVideo = async (contentSocialId, socialChannelToken, detailSocialChannel, errorMessage) => {
  console.log('get group không video');
  let url = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=comments.summary(true),reactions.summary(true),message,attachments`;
  let isDeleted = false;
  console.log('urlgroup', url);
  console.log('access_token', socialChannelToken);
  let warring = [];
  const facebookGroup = await axios({
    method: 'get',
    url,
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      access_token: `${socialChannelToken}`
    }
  }).catch(error => {
    let message = 'lỗi không xác định';

    if (error.response?.data?.error?.code == 190) {
      message = 'token hết hạn hoặc sai';
    }
    if (error.response?.data?.error?.code == 10) {
      message = 'đã bị xóa trước đó';
      isDeleted = true;
    }
    warring.push({
      message: message,
      contentSocialId: contentSocialId,
      err: err
    });
  });
  let statistic;
  // console.log('facebookGroup?.data', facebookGroup?.data);
  if (facebookGroup?.data) {
    let viewCount = null;
    let likeCount = facebookGroup?.data?.reactions?.summary?.total_count;
    let commentCount = facebookGroup?.data?.comments?.summary?.total_count;

    statistic = {
      like: likeCount,
      comment: commentCount
    };
  } else {
    statistic = null;
  }
  let images = [];
  if (facebookGroup.data && facebookGroup.data.attachments && facebookGroup.data.attachments.data.length > 0) {
    if (
      facebookGroup.data.attachments.data[0].subattachments &&
      facebookGroup.data.attachments.data[0].subattachments.data
    ) {
      facebookGroup.data.attachments.data[0].subattachments.data.forEach(image => {
        images.push(image.media.image);
      });
    }
  }
  return {
    content: {
      contentSocialTitle: facebookGroup?.data?.message,
      contentSocialImages: images
      // contentSocialDescriptions: facebookGroup?.data?.description
    },
    statistic: statistic,
    warring: warring,
    isDeleted: isDeleted
  };
};
const getOneGroupVideo = async (contentSocialId, socialChannelToken, detailSocialChannel, errorMessage) => {
  console.log('get group  video');
  let isDeleted = false;
  let urlDetails = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=comments.summary(true),likes.summary(true),source,title,description`;
  let urlVideoInsights = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}/video_insights?metric=total_video_views`;
  console.log('groupVideo urlDetails', urlDetails);
  console.log('groupVideo urlVideoInsights', urlVideoInsights);
  console.log('access_token', socialChannelToken);
  let warring = [];
  const [resultDetails, resultVideoInsights] = await Promise.all([
    axios({
      method: 'get',
      url: urlDetails,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(err => {
      let message = 'lỗi không xác định';

      if (error.response?.data?.error?.code == 190) {
        message = 'token hết hạn hoặc sai';
      }
      if (error.response?.data?.error?.code == 10) {
        message = 'đã bị xóa trước đó';
        isDeleted = true;
      }
      warring.push({
        message: message,
        contentSocialId: contentSocialId,
        err: err
      });
    }),
    axios({
      method: 'get',
      url: urlVideoInsights,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(error => {
      let message = 'lỗi không xác định';

      if (error.response?.data?.error?.code == 190) {
        message = 'token hết hạn hoặc sai';
      }
      if (error.response?.data?.error?.code == 10) {
        message = 'đã bị xóa trước đó';
        isDeleted = true;
      }
      warring.push({
        message: message,
        contentSocialId: contentSocialId,
        err: err
      });
    })
  ]);

  let statistic;
  if (resultDetails?.data && resultVideoInsights?.data) {
    let viewCount = resultVideoInsights.data.data[0]?.values[0]?.value;
    let likeCount = resultDetails.data?.likes?.summary?.total_count;
    let commentCount = resultDetails.data?.comments?.summary?.total_count;

    statistic = {
      like: likeCount,
      view: viewCount,
      comment: commentCount
    };
  } else {
    statistic = null;
  }
  return {
    content: {
      contentSocialTitle: resultDetails?.data?.title,
      contentSocialVideo: { src: resultDetails?.data?.source, type: 'video' }
      // contentSocialDescriptions: resultDetails?.data?.description
    },
    statistic: statistic,
    warring: warring,
    isDeleted: isDeleted
  };
};
const getOnePageVideoDetail = async (contentSocialId, socialChannelToken, detailSocialChannel) => {
  console.log('getOne page  video');
  const urlInsights = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${detailSocialChannel.socialChannelUrl}_${contentSocialId}/insights?metric=post_reactions_by_type_total,post_impressions_unique`;
  const urlDetails = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${detailSocialChannel.socialChannelUrl}_${contentSocialId}?fields=comments.summary(true),shares`;
  const viewVideo = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}/video_insights/total_video_views/lifetime`;
  const urlContent = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=source,title,description`;
  console.log('urlgroup', urlDetails);
  console.log('urlInsights', urlInsights);
  console.log('viewVideo', viewVideo);
  let isDeleted = false;
  let warring = [];
  const [fields, insights, view, content] = await Promise.all([
    axios({
      method: 'get',
      url: urlDetails,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(error => {
      let message = 'lỗi không xác định';

      if (error.response?.data?.error?.code == 190) {
        message = 'token hết hạn hoặc sai';
      }
      if (error.response?.data?.error?.code == 10) {
        message = 'đã bị xóa trước đó';
        isDeleted = true;
      }
      warring.push({
        message: message,
        contentSocialId: contentSocialId,
        err: error
      });
      // throw new ApiErrors.BaseError(err);
    }),
    axios({
      method: 'get',
      url: urlInsights,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(error => {
      let message = 'lỗi không xác định';
      if (error.response?.data?.error?.code == 190) {
        message = 'token hết hạn hoặc sai';
      }
      if (error.response?.data?.error?.code == 10) {
        message = 'đã bị xóa trước đó';
        isDeleted = true;
      }
      warring.push({
        message: message,
        contentSocialId: contentSocialId,
        err: error
      });
    }),
    axios({
      method: 'get',
      url: viewVideo,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(error => {
      let message = 'lỗi không xác định';

      if (error.response?.data?.error?.code == 190) {
        message = 'token hết hạn hoặc sai';
      }
      if (error.response?.data?.error?.code == 10) {
        message = 'đã bị xóa trước đó';
        isDeleted = true;
      }
      warring.push({
        message: message,
        contentSocialId: contentSocialId,
        err: error
      });
    }),
    axios({
      method: 'get',
      url: urlContent,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(error => {
      let message = 'lỗi không xác định';

      if (error.response?.data?.error?.code == 190) {
        message = 'token hết hạn hoặc sai';
      }
      if (error.response?.data?.error?.code == 10) {
        message = 'đã bị xóa trước đó';
        isDeleted = true;
      }
      warring.push({
        message: message,
        contentSocialId: contentSocialId,
        err: error
      });
    })
  ]);

  let statistic = {};
  if (view?.data) {
    let viewCount = view?.data?.data[0].values[0].value;
    if (viewCount) statistic['view'] = viewCount;
  }
  if (fields?.data) {
    let commentCount = fields?.data?.comments?.summary?.total_count;
    if (commentCount) statistic['comment'] = commentCount;
    let sharesCount = fields?.data?.shares?.count;
    if (sharesCount) statistic['share'] = sharesCount;
  }

  if (insights?.data?.data && insights?.data?.data?.length > 0) {
    insights.data.data.forEach(d => {
      if (typeof d.values[0].value === 'object') {
        let name = d.name;
        console.log('name', name);
        if (name === 'post_reactions_by_type_total') name = 'reactions';

        statistic[`${name}`] = d.values[0];
      } else {
        let name = d.name;
        if (name === 'post_impressions_unique') name = 'impressionsUnique';
        statistic[`${name}`] = d.values[0].value;
      }
    });
  }
  if (statistic.reactions && statistic.reactions.value) {
    statistic.otherReactions = 0;
    Object.entries(statistic.reactions.value).forEach(([key, value]) => {
      if (key == 'like') {
        statistic.like = value;
      } else {
        statistic.otherReactions = statistic.otherReactions + value;
      }
    });
  }
  return {
    content: {
      contentSocialVideo: { src: content?.data?.source, type: 'video' },
      contentSocialTitle: content?.data?.title
      // contentSocialDescriptions: content?.data?.description
    },
    statistic: statistic,
    warring: warring,
    isDeleted: isDeleted
  };
};

const getOnePageNotVideoDetail = async (contentSocialId, socialChannelToken, detailSocialChannel) => {
  console.log('getOne page không video detail');
  let urlDetails = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}?fields=comments.summary(true),shares,message,attachments`;
  let urlInsights = `${CONFIG.FB_GRAPH_HOST}/${CONFIG.FB_GRAPH_VERSION}/${contentSocialId}/insights?metric=post_reactions_by_type_total,post_impressions_unique,post_negative_feedback_by_type,post_impressions`;
  console.log('urlDetails', urlDetails);
  console.log('urlInsights', urlInsights);
  console.log('access_token', socialChannelToken);
  let isDeleted = false;
  let warring = [];
  const [fields, insights, share] = await Promise.all([
    axios({
      method: 'get',
      url: urlDetails,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(error => {
      let message = 'lỗi không xác định';

      if (error.response?.data?.error?.code == 190) {
        message = 'token hết hạn hoặc sai';
      }
      if (error.response?.data?.error?.code == 10) {
        message = 'đã bị xóa trước đó';
        isDeleted = true;
      }
      warring.push({
        message: message,
        contentSocialId: contentSocialId,
        err: error
      });
    }),
    axios({
      method: 'get',
      url: urlInsights,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        access_token: `${socialChannelToken}`
      }
    }).catch(error => {
      let message = 'lỗi không xác định';

      if (error.response?.data?.error?.code == 190) {
        message = 'token hết hạn hoặc sai';
      }
      if (error.response?.data?.error?.code == 10) {
        message = 'đã bị xóa trước đó';
        isDeleted = true;
      }
      warring.push({
        message: message,
        contentSocialId: contentSocialId,
        err: error
      });
    })
  ]);
  let statistic = {};
  if (fields?.data) {
    let commentCount = fields?.data?.comments?.summary?.total_count;
    if (commentCount) statistic['comment'] = commentCount;
    let sharesCount = fields?.data?.shares?.count;
    if (sharesCount) statistic['share'] = sharesCount;
  }
  if (insights?.data?.data && insights?.data?.data?.length > 0) {
    insights.data.data.forEach(d => {
      let name = d.name;
      if (name === 'post_reactions_by_type_total') name = 'reactions';
      if (name === 'post_impressions_unique') name = 'impressionsUnique';
      if (name === 'post_impressions') name = 'view';
      if (typeof d.values[0].value === 'object') {
        statistic[`${name}`] = d.values[0];
      } else {
        statistic[`${name}`] = d.values[0].value;
      }
    });
  }
  if (statistic.reactions && statistic.reactions.value) {
    statistic.otherReactions = 0;
    Object.entries(statistic.reactions.value).forEach(([key, value]) => {
      if (key == 'like') {
        statistic.like = value;
      } else {
        statistic.otherReactions = statistic.otherReactions + value;
      }
    });
  }
  let images = [];

  if (fields.data && fields.data.attachments && fields.data.attachments.data.length > 0) {
    console.log('fields.data.attachments', fields.data.attachments.data[0]);
    if (!fields.data.attachments.data[0].subattachments && fields.data.attachments.data[0].media) {
      images.push(fields.data.attachments.data[0].media.image);
    } else if (fields.data.attachments.data[0].subattachments) {
      fields.data.attachments.data[0].subattachments.data.forEach(image => {
        images.push(image.media.image);
      });
    }
  }
  console.log('imag2e', images);
  return {
    content: {
      contentSocialTitle: fields?.data?.message,
      contentSocialImages: images
      // contentSocialDescriptions: fields?.data?.description
    },
    statistic: statistic,
    warring: warring,
    isDeleted: isDeleted
  };
};

export default {
  connectFacebookApi: async data => {
    let output;

    if (data.id) {
      try {
        const result_contentSocials = await MODELS.findOne(contentSocials, {
          where: {
            id: data.id
          },
          attributes: ['dateCreated', 'contentSocialId'],
          include: [
            {
              model: socialChannels,
              as: 'socialChannels',
              attributes: [
                'socialChannelToken',
                'socialChannelName',
                'socialChannelImages',
                'socialChannelUrl',
                'socialChannelType',
                'id'
              ]
            }
          ],
          logging: console.log
        });
        const {
          dateCreated,
          contentSocialId,
          socialChannels: {
            socialChannelToken,
            socialChannelImages,
            socialChannelName,
            socialChannelUrl,
            socialChannelType,
            id
          }
        } = result_contentSocials;
        console.log('result_contentSocials===', socialChannelType);
        console.log('socialChannels===', socialChannels);
        const detailSocialChannel = {
          socialChannelName: socialChannelName,
          id: id,
          socialChannelUrl: socialChannelUrl
        };
        const checkToken = await checkAccesToken.connectFacebookApi({
          entity: { socialChannelToken: socialChannelToken }
        });
        console.log('checkToken', checkToken.data);
        console.log(!checkToken.data);
        console.log(checkToken.data.is_valid === false);
        if (!checkToken.data || checkToken.data.is_valid === false) {
          let warring = [];
          warring.push({
            message: `Token ${socialChannelName} hết hạn hoặc không đủ quyền `,
            name: socialChannelName,
            id: id,
            socialChannelUrl: socialChannelUrl,
            socialChannelToken: socialChannelToken
          });
          return {
            url: `https://www.facebook.com/${contentSocialId}`,
            contentSocialId: contentSocialId,
            success: false,
            warring: warring
          };
        } else {
          if (Number(socialChannelType) === 0) {
            if (contentSocialId.includes('_')) {
              let { content, statistic, warring } = await pageNotVideoDetail(
                contentSocialId,
                socialChannelToken,
                detailSocialChannel
              );
              //page không video
              return {
                url: `https://www.facebook.com/${contentSocialId}`,
                socialChannelName,
                image: socialChannelImages,
                content: content,
                statistic: statistic,
                dateCreated,
                success: warring ? false : true,
                messages: [],
                warring: warring
              };
            } else {
              let { content, statistic, warring } = await pageVideoDetail(
                contentSocialId,
                socialChannelToken,
                detailSocialChannel
              );
              return {
                url: `https://www.facebook.com/${contentSocialId}`,
                socialChannelName,
                content: content,
                statistic: statistic,
                dateCreated,
                success: warring ? false : true,
                messages: [],
                warring: warring
              };
            }
          } else {
            if (contentSocialId.includes('_')) {
              let { content, statistic, warring } = await groupNotVideo(
                contentSocialId,
                socialChannelToken,
                detailSocialChannel
              );
              //group không video
              return {
                url: `https://www.facebook.com/${contentSocialId}`,
                socialChannelName,
                image: socialChannelImages,
                content: content,
                statistic: statistic,
                dateCreated,
                success: warring ? false : true,
                messages: [],
                warring: warring
              };
            } else {
              let { content, statistic, warring } = await groupVideo(
                contentSocialId,
                socialChannelToken,
                detailSocialChannel
              );

              return {
                url: `https://www.facebook.com/${contentSocialId}`,
                socialChannelName,
                image: socialChannelImages,
                content: content,
                statistic: statistic,
                dateCreated,
                success: warring ? false : true,
                messages: [],
                warring
              };
            }
          }
        }
      } catch (e) {
        // console.log('error', e);
        return new ApiErrors.BaseError(e);
      }
    }
  },
  getOneInfoFacebook: async data => {
    let output;
    try {
      const { contentSocialId, socialChannelToken, socialChannelType, socialChannelUrl } = data;
      console.log('result_contentSocials===', socialChannelType);
      console.log('socialChannels===', socialChannels);
      const detailSocialChannel = {
        socialChannelUrl: socialChannelUrl
      };

      if (Number(socialChannelType) === 0) {
        if (contentSocialId.includes('_')) {
          let { content, statistic, warring } = await getOnePageNotVideoDetail(
            contentSocialId,
            socialChannelToken,
            detailSocialChannel
          );
          //page không video
          console.log('static', statistic);
          return {
            url: `https://www.facebook.com/${contentSocialId}`,
            content: content,
            statistic: statistic,
            success: _.isEmpty(statistic) ? false : true,
            messages: [],
            warring: warring
          };
        } else {
          let { content, statistic, warring } = await getOnePageVideoDetail(
            contentSocialId,
            socialChannelToken,
            detailSocialChannel
          );
          console.log('static', statistic);
          return {
            url: `https://www.facebook.com/${contentSocialId}`,
            content: content,
            statistic: statistic,
            success: _.isEmpty(statistic) ? false : true,
            messages: [],
            warring: warring
          };
        }
      } else {
        if (contentSocialId.includes('_')) {
          let { content, statistic, warring } = await getOneGroupNotVideo(
            contentSocialId,
            socialChannelToken,
            detailSocialChannel
          );
          //group không video
          return {
            url: `https://www.facebook.com/${contentSocialId}`,
            content: content,
            statistic: statistic,
            success: _.isEmpty(statistic) ? false : true,
            messages: [],
            warring: warring
          };
        } else {
          let { content, statistic, warring } = await getOneGroupVideo(
            contentSocialId,
            socialChannelToken,
            detailSocialChannel
          );

          return {
            url: `https://www.facebook.com/${contentSocialId}`,
            content: content,
            statistic: statistic,
            success: _.isEmpty(statistic) ? false : true,
            messages: [],
            warring
          };
        }
      }
    } catch (e) {
      // console.log('error', e);
      return new ApiErrors.BaseError(e);
    }
  },
  getDetailFacebook: async data => {
    try {
      const { contentSocialId, socialChannelToken, socialChannelType, detailSocialChannel } = data;
      console.log('result_contentSocials===', socialChannelType);
      console.log('socialChannels===', socialChannels);
      const errorMessage = 1;
      if (Number(socialChannelType) === 0) {
        if (contentSocialId.includes('_')) {
          let { content, statistic, warring } = await pageNotVideo(
            contentSocialId,
            socialChannelToken,
            detailSocialChannel,
            errorMessage
          );
          //page không video
          return {
            content: content,
            statistic: statistic,
            messages: [],
            success: warring ? false : true
          };
        } else {
          let { content, statistic, warring } = await pageVideo(
            contentSocialId,
            socialChannelToken,
            detailSocialChannel,
            errorMessage
          );
          return {
            content: content,
            statistic: statistic,
            messages: [],
            success: warring ? false : true
          };
        }
      } else {
        if (contentSocialId.includes('_')) {
          let { content, statistic, warring } = await groupNotVideo(
            contentSocialId,
            socialChannelToken,
            detailSocialChannel,
            errorMessage
          );
          //group không video
          return {
            content: content,
            statistic: statistic,
            messages: [],
            success: warring ? false : true
          };
        } else {
          let { content, statistic, warring } = await groupVideo(
            contentSocialId,
            socialChannelToken,
            detailSocialChannel,
            errorMessage
          );

          return {
            content: content,
            statistic: statistic,
            messages: [],
            success: warring ? false : true
          };
        }
      }
    } catch (e) {
      // console.log('error', e);
      return new ApiErrors.BaseError(e);
    }
  }
};
