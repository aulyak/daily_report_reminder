const functions = require('./functions.js');
const emailjs = require('@emailjs/nodejs');

(async () => {
  // const thisUser =
  // const data = await getUserData();
  // console.log({len: resp.data.users.length});
  // console.log({data: resp.data.users});
  // console.log({len: data.length});

  emailjs.init({
    publicKey: 'PMVmlTTNEbapvq_Yo',
    privateKey: 'JvlhvW_TQkNZLyp6g2c4H',
  });

  const data = await functions.getDailyReports();
  const [notReported, notSubmitted] = functions.getNotReportedDaysAndNotSubmittedRecs(data);

  const serviceId = 'service_odz0xp5';
  const templateId = 'template_hrq7k1q';
  const templateParams = {
    to_email: 'aulya.khatulistivani@aqi.co.id',
    to_name: 'Kuya',
    notYetReport: notReported,
    notSubmitted,
  };

  if (notReported.length || notSubmitted.length) {
    try {
      const emailSend = await emailjs.send(serviceId, templateId, templateParams);
      console.log({emailSend});
    } catch (error) {
      console.log({error});
    }
  }

})();

