import axios from 'axios';
import config from '../../config';
import * as ApiErrors from '../../errors';

const WITAI_API_URL = config.WITAI_API_URL || 'https://api.wit.ai';
const WITAI_TOKEN = config.WITAI_TOKEN || '677J4MCTD6E2Y2QUM72I5JPZKP65LVEU';
const WITAI_CONFIDENCE = config.WITAI_CONFIDENCE || 0.7;
const isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
};

export default {
  check_keyword: async title => {
    try {
      // youtube
      console.log('title', title);
      if (!title || title.length > 280) return false;
      const url = WITAI_API_URL + `/message`;

      const witai = await axios({
        method: 'GET',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        },
        params: {
          q: title
        }
      }).catch(error => {
        console.log('err', error);
      });

      if (
        !witai ||
        !witai.data ||
        !witai.data.intents ||
        !witai.data.intents.length === 0 ||
        isEmpty(witai.data.entities)
      ) {
        return false;
      }

      const thientaiIntents = witai.data.intents.find(e => (e.name = 'thien_tai'));

      if (!thientaiIntents || thientaiIntents.confidence < WITAI_CONFIDENCE) return false;

      return true;
    } catch (err) {
      console.log('e');

      return false;
    }
  },
  get_all_intents: async () => {
    try {
      // youtube

      const url = WITAI_API_URL + `/intents`;

      const witai = await axios({
        method: 'GET',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        }
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin thất bại'
        });
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getInfoError',
        message: 'Lấy thông tin thất bại'
      });
    }
  },
  get_one_intents: async (name, includeKeywork, options) => {
    const throwErr = options && options.throwErr === 'no' ? false : true;

    try {
      // youtubes

      console.log('get_one_intents', name, includeKeywork);
      const url = WITAI_API_URL + `/intents/${name}`;

      const witai = await axios({
        method: 'GET',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        }
      }).catch(error => {
        console.log('err');
      });

      if (!witai || !witai.data) {
        if (throwErr) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Lấy thông tin thất bại'
          });
        } else {
          return null;
        }
      }

      const finalResult = witai.data;

      if (!includeKeywork || includeKeywork === 'false') {
        finalResult.entities = finalResult.entities.map(e => {
          const name = e.name.split(':')[0];

          return { ...e, name: name, roleName: e.name };
        });
      } else {
        finalResult.entities = await Promise.all(
          finalResult.entities.map(async e => {
            const name = e.name.split(':')[0];

            const entityUrl = WITAI_API_URL + `/entities/${name}`;
            const entityUrlword = await axios({
              method: 'GET',
              url: entityUrl,
              headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${WITAI_TOKEN}`
              }
            }).catch(error => {
              console.log('err', error);
            });

            if (entityUrlword && entityUrlword.data) {
              return { ...e, name: name, roleName: e.name, keywords: entityUrlword.data.keywords };
            } else return { ...e, name: name, roleName: e.name };
          })
        );
      }

      return finalResult;
    } catch (err) {
      console.log('e', err);
      if (throwErr) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin thất bại'
        });
      } else {
        return null;
      }
    }
  },
  create_intents: async name => {
    try {
      // youtube
      console.log('create_intents', name);
      const url = WITAI_API_URL + `/intents`;

      const witai = await axios({
        method: 'POST',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        },
        data: { name: name }
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Tạo intents thất bại'
        });
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      throw new ApiErrors.BaseError({
        statusCode: 202,
        message: 'Tạo intents thất bại'
      });
    }
  },
  addEntitiesToIntents: async (name, entities) => {
    try {
      // youtubes

      console.log('addEntitiesToIntents', name, entities);
      const intentsName = name;

      if (name && entities && entities.length > 0) {
        const findEntiies = await Promise.all(
          entities.map(async elementName => {
            const url = WITAI_API_URL + `/entities/${elementName}`;

            const witai = await axios({
              method: 'GET',
              url: url,
              headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${WITAI_TOKEN}`
              }
            }).catch(error => {
              console.log('err', error);
            });

            if (!witai || !witai.data) {
              return null;
            }

            return witai.data;
          })
        );
        const keywords = [];

        findEntiies.forEach(elementEntity => {
          if (elementEntity && elementEntity.keywords && elementEntity.keywords.length > 0) {
            elementEntity.keywords.forEach(elementKeyword => {
              if (elementKeyword && elementKeyword.synonyms && elementKeyword.synonyms.length > 0) {
                elementKeyword.synonyms.forEach(keyword => {
                  keywords.push({
                    text: keyword,
                    intent: intentsName,
                    entities: [
                      {
                        entity: `${elementEntity.name}:${elementEntity.name}`,
                        start: 0,
                        end: keyword.length,
                        body: keyword,
                        entities: []
                      }
                    ],
                    traits: []
                  });
                });
              }
            });
          }
        });
        console.log('keywords', JSON.stringify(keywords));

        const url = WITAI_API_URL + `/utterances`;

        const witai = await axios({
          method: 'POST',
          url: url,
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${WITAI_TOKEN}`
          },
          data: keywords
        }).catch(error => {
          console.log('err', error);
        });

        if (!witai && !witai.data) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Cập nhật thông tin thất bại'
          });
        }

        return witai.data;
      } else {
        console.log('abc');
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Cập nhật thông tin thất bại'
        });
      }
    } catch (err) {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getInfoError',
        message: 'Cập nhật thông tin thất bại'
      });
    }
  },
  delete_intents: async name => {
    try {
      // youtube
      if (name === 'thien_tai') {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Xóa intents thất bại'
        });
      }
      const url = WITAI_API_URL + `/intents/${name}`;

      console.log('delete_intents', url);
      const witai = await axios({
        method: 'DELETE',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        }
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Xóa intents thất bại'
        });
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      throw new ApiErrors.BaseError({
        statusCode: 202,
        message: 'Xóa intents thất bại'
      });
    }
  },
  get_all_entities: async includeKeywork => {
    try {
      // youtube

      const url = WITAI_API_URL + `/entities`;

      const witai = await axios({
        method: 'GET',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        }
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin thất bại'
        });
      }

      if (!includeKeywork || includeKeywork === 'false') {
        const finalResult = witai.data;

        return finalResult;
      } else {
        console.log('true');

        const finalResult = await Promise.all(
          witai.data.map(async e => {
            const entityUrl = WITAI_API_URL + `/entities/${e.name}`;
            const entityUrlword = await axios({
              method: 'GET',
              url: entityUrl,
              headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${WITAI_TOKEN}`
              }
            }).catch(error => {
              console.log('err', error);
            });

            if (entityUrlword && entityUrlword.data) {
              return { ...e, keywords: entityUrlword.data.keywords };
            } else return { ...e };
          })
        );

        return finalResult;
      }
    } catch (err) {
      console.log('e', err);
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'getInfoError',
        message: 'Lấy thông tin thất bại'
      });
    }
  },
  get_one_entities: async (name, options) => {
    const throwErr = options && options.throwErr === 'no' ? false : true;

    try {
      // youtubes

      console.log('get_one_entities', name);
      const url = WITAI_API_URL + `/entities/${name}`;

      const witai = await axios({
        method: 'GET',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        }
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        if (throwErr) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Lấy thông tin thất bại'
          });
        } else {
          return null;
        }
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      if (throwErr) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin thất bại'
        });
      } else {
        return null;
      }
    }
  },
  create_entities: async body => {
    try {
      // youtube
      console.log('body', body);
      const url = WITAI_API_URL + `/entities`;

      const witai = await axios({
        method: 'POST',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        },
        data: body
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Tạo entities thất bại'
        });
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      throw new ApiErrors.BaseError({
        statusCode: 202,
        message: 'Tạo entities thất bại'
      });
    }
  },
  update_entities: async (name, body) => {
    try {
      // youtube

      const url = WITAI_API_URL + `/entities/${name}`;

      const witai = await axios({
        method: 'PUT',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        },
        data: body
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Cập nhật entities thất bại'
        });
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      throw new ApiErrors.BaseError({
        statusCode: 202,
        message: 'Cập nhật entities thất bại'
      });
    }
  },
  delete_entities: async name => {
    try {
      // youtube

      const url = WITAI_API_URL + `/entities/${name}`;

      console.log('delete_entities', url);
      const witai = await axios({
        method: 'DELETE',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        }
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Xóa entities thất bại'
        });
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      throw new ApiErrors.BaseError({
        statusCode: 202,
        message: 'Xóa entities thất bại'
      });
    }
  },
  train: async body => {
    try {
      // youtube
      console.log('train', body);
      const url = WITAI_API_URL + `/utterances`;

      const witai = await axios({
        method: 'POST',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        },
        data: body
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'train ai thất bại'
        });
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      // throw new ApiErrors.BaseError({
      //   statusCode: 202,
      //   message: 'train ai thất bại'
      // });
    }
  },
  get_all_train: async entity => {
    try {
      // youtube
      console.log('entity', entity);
      const url = WITAI_API_URL + `/utterances`;

      const witai = await axios({
        method: 'GET',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        },
        params: {
          limit: entity.limit || 10,
          offset: entity.offset || 0,
          intents: entity.intents || []
        }
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'lấy danh sách dữ liệu đã train thất bại'
        });
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      throw new ApiErrors.BaseError({
        statusCode: 202,
        message: 'lấy danh sách dữ liệu đã train thất bại'
      });
    }
  },
  delete_train: async body => {
    try {
      // youtube
      console.log('delete_train');
      const url = WITAI_API_URL + `/utterances`;

      const witai = await axios({
        method: 'DELETE',
        url: url,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${WITAI_TOKEN}`
        },
        data: body
      }).catch(error => {
        console.log('err', error);
      });

      if (!witai || !witai.data) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'xóa dữ liệu đã train thất bại'
        });
      }

      return witai.data;
    } catch (err) {
      console.log('e', err);
      throw new ApiErrors.BaseError({
        statusCode: 202,
        message: 'xóa dữ liệu đã train thất bại'
      });
    }
  }
};
