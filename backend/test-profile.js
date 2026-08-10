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

function updateProfile(token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ fullName: 'Demo Runner', weight: 70, height: 175 });
    const req = http.request({
      hostname: 'localhost',
      port: 3004,
      path: '/api/users/profile',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': 'Bearer ' + token
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Profile Status:', res.statusCode);
        console.log('Profile Body:', body);
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
  return updateProfile(loginRes.accessToken);
}).then((profileRes) => {
  console.log('Profile updated:', profileRes);
}).catch((err) => {
  console.error('Error:', err.message);
});
