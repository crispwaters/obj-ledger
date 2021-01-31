const Ledger = require('./ledger')

test('Ledger records history on object changes', () => {
  const obj = { foo: 123, bar: 'abc', foobar: true }
  const ledger = new Ledger(obj)
  ledger.obj.foo = 456
  ledger.obj.bar = 'def'
  ledger.obj.foobar = true
  expect(ledger.final).toStrictEqual({ foo: 456, bar: 'def', foobar: true })
  expect(ledger.log).toStrictEqual([{ foo: { from: 123, to: 456 } }, { bar: { from: 'abc', to: 'def' } }])
})

test('Ledger update method creates single log', () => {
  const obj = { foo: 123, bar: 'abc' }
  const ledger = new Ledger(obj)
  ledger.update({
    foo: 456,
    bar: 'def',
    foobar: true
  })
  expect(ledger.final).toStrictEqual({ foo: 456, bar: 'def', foobar: true })
  expect(ledger.log).toStrictEqual([{ foo: { from: 123, to: 456 }, bar: { from: 'abc', to: 'def' }, foobar: { from: undefined, to: true } }])
})

test('Setting property allows changes to be tracked', () => {
  const obj = { foo: 123, bar: 'abc' }
  const ledger = new Ledger(obj)
  Ledger.setProperty(ledger, 'foobar', true)
  expect(ledger.final).toStrictEqual({ foo: 123, bar: 'abc', foobar: true })
  expect(ledger.log).toStrictEqual([{ foobar: { from: undefined, to: true } }])
})

test('Deleting property removes it from values', () => {
  const obj = { foo: 123, bar: 'abc', foobar: false }
  const ledger = new Ledger(obj)
  Ledger.deleteProperty(ledger, 'foobar')
  expect(ledger.final).toStrictEqual({ foo: 123, bar: 'abc' })
  expect(ledger.log).toStrictEqual([{ foobar: { from: false, to: undefined } }])
})

test('Set function determines how to update property', () => {
  const obj = { foo: 123, bar: 'abc' }
  const ledger = new Ledger(obj)
  ledger.set('foo', 456)
  ledger.set('bar', 'abc')
  ledger.set('foobar', true)
  expect(ledger.final).toStrictEqual({ foo: 456, bar: 'abc', foobar: true })
  expect(ledger.log).toStrictEqual([{ foo: { from: 123, to: 456 } }, { foobar: { from: undefined, to: true } }])
})

test('Set Property updates an existing property', () => {
  const obj = { foo: 123, bar: 'abc' }
  const ledger = new Ledger(obj)
  Ledger.setProperty(ledger, 'foo', 456)
  expect(ledger.final).toStrictEqual({ foo: 456, bar: 'abc' })
  expect(ledger.log).toStrictEqual([{ foo: { from: 123, to: 456 } }])
})

test('Changes to original object do not adjust ledger object', () => {
  const obj = { foo: 123, bar: 'abc' }
  const ledger = new Ledger(obj)
  obj.foobar = true
  expect(obj).toStrictEqual({ foo: 123, bar: 'abc', foobar: true })
  expect(ledger.original).toStrictEqual({ foo: 123, bar: 'abc' })
  expect(ledger.final).toStrictEqual({ foo: 123, bar: 'abc' })
  expect(ledger.log).toStrictEqual([])
})
