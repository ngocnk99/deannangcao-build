import axios from 'axios';
import CONFIG from '../../config';
import fs from 'fs';
import * as ApiErrors from '../../errors';
/**
 * @param {Object} params
 * @param {String} params.fileType
 * @param {String} params.filePath
 * @param {String} params.accessToken
 * */
export default async (params) => {
  const accessToken = params.accessToken;
  const fileType = params.fileType;
  const filePath = params.filePath;
  const allowFileTypes = ['image', 'file', 'gif'];

  if (allowFileTypes.indexOf(fileType) === -1) {
    throw new ApiErrors.BasicError({
      statusCode: 202,
      type: 'create',
      error: 'file type is not in allow file type',
      name: 'upload - Zalo'
    });
  } else {
    let result;
    const file = await fs.readFileSync(filePath);

    await axios({
      url: `${CONFIG.ZALO_API_URL}/upload/${fileType}`,
      params: {
        access_token: accessToken
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: {
        file: file
      }
    }).then(response => {
      result = response.data;
    }).catch(e => {
      result = e.response.data;
    });

    return result;
  }
}
