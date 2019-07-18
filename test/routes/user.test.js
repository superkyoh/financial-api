const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/users';
const mail = `${Date.now()}@mail.com`;
let user;

beforeAll(async () => {
  const res = await app.services.user.save({ name: 'User Account', mail, passwd: '123456' });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');
});

test('Should return all users', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Should sucessfully create a user', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, passwd: '123456' })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter Mitty');
      expect(res.body).not.toHaveProperty('passwd');
    });
});

test('Should save user password encrypted', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, passwd: '123456' })
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.passwd).not.toBeUndefined();
  expect(userDB.passwd).not.toBe('123456');
});

test('Should not insert nameless user', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ mail: 'walter@mail.com', passwd: '123456' })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name is required');
    });
});

test('Should not insert user without e-mail', async () => {
  const result = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter', passwd: '123456' })
    .set('authorization', `bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email is required');
});

test('Should not insert user without password', (done) => {
  request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter', mail: 'walter@mail.com' })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password is required');
      done();
    });
});

test('Should not insert user with duplicate e-mail', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter Mitty', mail, passwd: '123456' })
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists');
    });
});
