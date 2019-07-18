const request = require('supertest');

const app = require('../src/app.js');

test('Should answer on root', () => {
  return request(app).get('/')
    .then((res) => {
      expect(res.status).toBe(200);
    });
});
