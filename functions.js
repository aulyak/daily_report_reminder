const axios = require('axios');
const {Base64} = require('js-base64');
const {KintoneRestAPIClient} = require('@kintone/rest-api-client');
const {apps} = require('./init.js');
const luxon = require('luxon');
const dt = luxon.DateTime;

const username = 'aulya.khatulistivani@aqi.co.id';
const password = '2Desembet1995';
const client = new KintoneRestAPIClient({
  baseUrl: 'https://aqi.cybozu.com',
  auth: {
    username,
    password,
  }
});

const userCode = 'aulya.khatulistivani@aqi.co.id';
// const userCode = 'andres.suhendrawan@aqi.co.id';

let times = 0;

const functions = {
  getUserData: async (optOffset, optData) => {
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
      return functions.getUserData(100 * times, data);
    }

    return data;
  },
  getDailyReports: () => {
    const condition = `
      ${apps.dailyReportApp.fieldCode.employeeName} in ("${userCode}") and 
      Created_datetime >= FROM_TODAY(-31, DAYS) and
      Created_datetime < FROM_TODAY(-1, DAYS)
    `;

    return client.record.getAllRecords({
      app: apps.dailyReportApp.id,
      condition,
    });
  },
  getNotReportedDaysAndNotSubmittedRecs: (data) => {
    const today = dt.now();

    const reports = data.map(item => ({
      id: item.$id.value,
      name: item[apps.dailyReportApp.fieldCode.employeeName].value[0].name,
      dateFmt: dt.fromISO(item[apps.dailyReportApp.fieldCode.date].value).toFormat('yyyy-MM-dd'),
      date: dt.fromISO(item[apps.dailyReportApp.fieldCode.date].value),
      status: item.Status.value,
    }));

    const dateOnlyReports = reports.map(item => item.dateFmt);

    const container = [];
    for (let i = dt.now().plus({days: -31}); i < today; i = i.plus({days: 1})) {
      container.push(i);
    }
    const excludeWeekends = container.filter(item => item.toFormat('EEEE') !== 'Sunday' && item.toFormat('EEEE') !== 'Saturday');

    let notYetReportedDays = excludeWeekends.filter(item => {
      const findInReport = dateOnlyReports.find(row => item.toFormat('yyyy-MM-dd') === row);
      return !findInReport;
    });
    console.log({notYetReportedDays});

    let notYetSubmitted = reports.filter(item => ['Not Report Yet', 'Revising'].includes(item.status));

    if (notYetReportedDays) notYetReportedDays = notYetReportedDays.map(item => `${item.toFormat('EEE, dd LLL yyyy')}`).join(', ');
    if (notYetSubmitted) {
      notYetSubmitted = notYetSubmitted.map(item => `https://aqi.cybozu.com/k/${apps.dailyReportApp.id}/show#record=${item.id}`)
        .join('<br>');
    }

    return [notYetReportedDays, notYetSubmitted];
  }
};

module.exports = functions;