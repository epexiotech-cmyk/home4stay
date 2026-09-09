import os

script = """
const { propertyCmsService } = require('./src/lib/services/propertyCmsService');

async function test() {
  const data = await propertyCmsService.getCmsData('275d806a-f76f-4f2b-8cda-b7a25af83d23');
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error).finally(() => process.exit(0));
"""

with open('/home/apurv_patel/home4stay/apps/main-site/test_cms_service.js', 'w') as f:
    f.write(script)

print("Created test_cms_service.js")
