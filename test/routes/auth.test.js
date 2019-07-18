const request = require('supertest');
const app = require('../../src/app');

test('Should create user by signup', () => {
  const mail = `${Date.now()}@mail.com`;
  return request(app).post('/auth/signup')
    .send({ name: 'Walter', mail, passwd: '123456' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter');
      expect(res.body).toHaveProperty('mail');
      expect(res.body).not.toHaveProperty('passwd');
    });
});

test('Should receive token when log in', () => {
  const mail = `${Date.now()}@mail.com`;
  return app.services.user.save({ name: 'Walter', mail, passwd: '123456' })
    .then(() => request(app).post('/auth/signin')
      .send({ mail, passwd: '123456' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
});

test('Should not authenticate a user with invalid password', () => {
  const mail = `${Date.now()}@mail.com`;
  return app.services.user.save({ name: 'Walter', mail, passwd: '123456' })
    .then(() => request(app).post('/auth/signin')
      .send({ mail, passwd: '654321' }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid user or password');
    });
});

test('Should not authenticate a user with invalid user', () => {
  return request(app).post('/auth/signin')
    .send({ mail: 'doesntexist@mail.com', passwd: '654321' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid user or password');
    });
});

test('Should not access a protected route without token', () => {
  return request(app).get('/v1/users')
    .then((res) => {
      expect(res.status).toBe(401);
    });
});
