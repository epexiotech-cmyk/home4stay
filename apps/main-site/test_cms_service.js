
const { propertyCmsService } = require('./src/lib/services/propertyCmsService');

async function test() {
  const data = await propertyCmsService.getCmsData('275d806a-f76f-4f2b-8cda-b7a25af83d23');
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error).finally(() => process.exit(0));
