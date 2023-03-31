import axios from 'axios';
import CONFIG from '../../config';
export default {
    connectFacebookApi: async () => {
        let output = {};


        const version = CONFIG.FB_GRAPH_VERSION;
        const host = CONFIG.FB_GRAPH_HOST;
        const clientId = CONFIG.FB_CLIENT_ID;
        const clientSecret = CONFIG.FB_CLIENT_SECRET;
        const url = `${host}/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

        console.log(url);

        // return new Promise((resolve, reject) => {
        await axios({
            method: 'get',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(function (response) {
                output = response.data
            })
            .catch(function (error) {
                console.log("error: ", error);

                output = error.response.data.error
            });

        return output;
    }
};
