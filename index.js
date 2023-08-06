const axios = require('axios');
const {Base64} = require('js-base64');
const {KintoneRestAPIClient} = require('@kintone/rest-api-client');


const username = 'aulya.khatulistivani@aqi.co.id';
const password = '2Desembet1995';
const client = new KintoneRestAPIClient({
  auth: {
    username,
    password,
  }
});

let times = 0;

const getUserData = async (optOffset, optData) => {
  let data = optData || [];
  const offset = optOffset || 0;

  const resp = await axios({
    url: 'https://aqi.cybozu.com/v1/users.json',
    method: 'GET',
    headers: {
      'X-Cybozu-Authorization': `${Base64.encode(`${username}:${password}`)}`
    },
    data: {
      offset
    }
  });

  data = data.concat(resp.data.users);

  const len = resp.data.users.length;

  if (len === 100) {
    times++;
    return getUserData(100 * times, data);
  }

  return data;
};

(async () => {
  // const thisUser =
  // const data = await getUserData();
  // console.log({len: resp.data.users.length});
  // console.log({data: resp.data.users});
  console.log({len: data.length});

})();

