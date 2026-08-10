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

function createActivity(token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      type: 'RUNNING',
      title: 'Test Run',
      distance: 5000,
      duration: 1800,
      calories: 300,
      averageSpeed: 10,
      maxSpeed: 12,
      averagePace: 6,
      steps: 4000,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString()
    });
    const req = http.request({
      hostname: 'localhost',
      port: 3004,
      path: '/api/activities',
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
        console.log('Activity Status:', res.statusCode);
        console.log('Activity Body:', body);
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
  return createActivity(loginRes.accessToken);
}).then((activityRes) => {
  console.log('Activity created:', activityRes);
}).catch((err) => {
  console.error('Error:', err.message);
});
