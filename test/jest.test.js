test('Should learn the main jest assertives', () => {
  let number = null;
  expect(number).toBeNull();
  number = 10;
  expect(number).not.toBeNull();
});

test('Should know handle objects', () => {
  const obj = { name: 'John', mail: 'john@mail.com' };
  expect(obj).toHaveProperty('name', 'John');
  expect(obj.name).toBe('John');

  const obj2 = { name: 'John', mail: 'john@mail.com' };
  expect(obj).toEqual(obj2);
});
