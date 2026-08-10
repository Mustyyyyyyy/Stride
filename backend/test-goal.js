const http = require('http');

function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: 'demo@stride.app', password: 'demo123' });
    const req = http.request({
      hostname: 'localhost',
      port: 3004,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Login parse error: ' + body)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function createGoal(token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ type: 'DAILY_STEPS', targetValue: 10000 });
    const req = http.request({
      hostname: 'localhost',
      port: 3004,
      path: '/api/goals',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': 'Bearer ' + token
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
        try { resolve(JSON.parse(body)); }
        catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

login().then((loginRes) => {
  console.log('Login OK');
  return createGoal(loginRes.accessToken);
}).then((goalRes) => {
  console.log('Goal created:', goalRes);
}).catch((err) => {
  console.error('Error:', err.message);
});
