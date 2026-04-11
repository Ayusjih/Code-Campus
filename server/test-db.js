const { Client } = require('pg');

const regions = [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "sa-east-1", "af-south-1", "ap-east-1", "ap-south-1",
    "ap-northeast-3", "ap-northeast-2", "ap-southeast-1",
    "ap-southeast-2", "ap-northeast-1", "ca-central-1",
    "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
    "eu-north-1", "me-south-1"
];

async function checkRegion(region) {
    const connectionString = `postgresql://postgres.gyijairxcbfmpgclsrey:bErUREVFGOIka1nU@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        await client.connect();
        await client.end();
        return region;
    } catch (err) {
        return null;
    }
}

async function findRegion() {
    console.log("Starting checks...");
    const promises = regions.map(region => checkRegion(region).then(res => {
        if (res) {
            console.log("SUCCESS! Region found:", res);
            process.exit(0);
        }
    }));
    await Promise.all(promises);
    console.log("No region matched or another error occurred.");
}

findRegion();
