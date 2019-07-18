const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');


const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;

beforeEach(async () => {
  const res = await app.services.user.save({ name: 'User Account', mail: `${Date.now()}@mail.com`, passwd: '123456' });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');

  const res2 = await app.services.user.save({ name: 'User Account #2', mail: `${Date.now()}@mail.com`, passwd: '123456' });
  user2 = { ...res2[0] };
  user2.token = jwt.encode(user, 'Segredo!');
});

test('Should successfully insert an account', () => {
  return request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user.token}`)
    .send({ name: 'Acc #1' })
    .then((result) => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe('Acc #1');
    });
});

test('Should not insert an unnamed account', () => {
  return request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user.token}`)
    .send({})
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Name is required');
    });
});

test('Should get only user accounts', () => {
  return app.db('accounts').insert([
    { name: 'Acc User #1', user_id: user.id },
    { name: 'Acc User #2', user_id: user2.id },
  ])
    .then(() => request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Acc User #1');
    });
});

test('Should not create an account with a name that already exists', () => {
  return app.db('accounts').insert({ name: 'Acc Duplicada', user_id: user.id })
    .then(() => request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user.token}`)
      .send({ name: 'Acc Duplicada' }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Account name already exists');
    });
});

test('Should return one account by Id', () => {
  return app.db('accounts').insert({ name: 'Acc By Id', user_id: user.id }, ['id'])
    .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc By Id');
      expect(res.body.user_id).toBe(user.id);
    });
});

test('Should not return an account of another user', () => {
  return app.db('accounts').insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('You dont have access to this resource');
    });
});

test('Should not update an account of another user', () => {
  return app.db('accounts').insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then(acc => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .send({ name: 'Acc Updated' })
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('You dont have access to this resource');
    });
});

test('Should not delete an account of another user', () => {
  return app.db('accounts').insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('You dont have access to this resource');
    });
});

test('Should update an account', () => {
  return app.db('accounts').insert({ name: 'Acc To Update', user_id: user.id }, ['id'])
    .then(acc => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
      .send({ name: 'Acc Updated' })
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Acc Updated');
    });
});

test('Should delete an account', () => {
  return app.db('accounts').insert({ name: 'Acc To Delete', user_id: user.id }, ['id'])
    .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});
