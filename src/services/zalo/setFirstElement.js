/**
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.subtitle
 * @param {string} params.imageUrl
 * @param {Object} params.defaultAction
 * */
export default (params) => {
  const result = {
    title: params.title,
    subtitle: params.subtitle,
    image_url: params.imageUrl
  };

  params.defaultAction ? (result['default_action'] = params.defaultAction) : false;

}
