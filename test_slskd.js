import crypto from 'crypto';

const SLSKD_URL = 'http://127.0.0.1:5030/api/v0';
const SLSKD_USERNAME = 'slskd';
const SLSKD_PASSWORD = 'slskd';

async function test() {
  const response = await fetch(`${SLSKD_URL}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: SLSKD_USERNAME, password: SLSKD_PASSWORD })
  });
  const data = await response.json();
  const token = data.token;
  
  const listRes = await fetch(`${SLSKD_URL}/searches`, { headers: { 'Authorization': `Bearer ${token}` } });
  const list = await listRes.json();
  console.log("Searches:", list.map(s => ({id: s.id, state: s.state, searchText: s.searchText})));
}
test().catch(console.error);
