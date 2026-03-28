const { Pool } = require('pg'); 
const test = async (reg) => { 
  let p;
  try { 
    p = new Pool({ 
      connectionString: `postgres://postgres.gyijairxcbfmpgclsrey:bErUREVFGOIka1nU@aws-0-${reg}.pooler.supabase.com:6543/postgres`, 
      ssl: { rejectUnauthorized: false }
    }); 
    await p.query('SELECT 1'); 
    console.log('SUCCESS:', reg); 
  } catch (e) { 
    if (e.code !== 'XX000' && e.code !== 'ENOTFOUND') { 
      console.log('FAIL:', reg, e.code, e.message); 
    } 
  } finally {
    if (p) await p.end();
  }
}; 
(async () => {
  const regs = ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'ap-southeast-1', 'ap-southeast-2', 'ap-south-1', 'sa-east-1', 'ca-central-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3'];
  console.log('Starting check...');
  for(const reg of regs) {
    await test(reg);
  }
  console.log('DONE');
  process.exit(0);
})();
