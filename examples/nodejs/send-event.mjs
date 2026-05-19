const base = process.env.S2G_API_BASE ?? 'https://api.social2game.com';
const key = process.env.S2G_API_KEY;
if (!key) {
  console.error('Set S2G_API_KEY in .env');
  process.exit(1);
}

const res = await fetch(`${base}/v1/events`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ event_type: 'login', player_id: 'pl_demo_001' }),
});

console.log(res.status, await res.json());
