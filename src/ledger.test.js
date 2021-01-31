const Ledger = require('./ledger')

test('Ledger records history on object changes', () => {
  const obj = { foo: 123, bar: 'abc', foobar: true }
  const ledger = new Ledger(obj)
  ledger.obj.foo = 456
  ledger.obj.bar = 'def'
  ledger.obj.foobar = true
  expect(ledger.final).toStrictEqual({ foo: 456, bar: 'def', foobar: true })
  expect(ledger.log).toStrictEqual([{ foo: { from: 123, to: 456 } }, { bar: { from: 'abc', to: 'def' } }])
  expect(ledger.audit).toStrictEqual({ foo: [123, 456], bar: ['abc', 'def'], foobar: [true] })
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
  expect(ledger.audit).toStrictEqual({ foo: [123, 456], bar: ['abc', 'def'], foobar: [true] })
})

test('Setting property allows changes to be tracked', () => {
  const obj = { foo: 123, bar: 'abc' }
  const ledger = new Ledger(obj)
  ledger.set('foobar', true)
  expect(ledger.final).toStrictEqual({ foo: 123, bar: 'abc', foobar: true })
  expect(ledger.log).toStrictEqual([{ foobar: { from: undefined, to: true } }])
  expect(ledger.audit).toStrictEqual({ foo: [123], bar: ['abc'], foobar: [true] })
})

test('Deleting property removes it from values', () => {
  const obj = { foo: 123, bar: 'abc', foobar: false }
  const ledger = new Ledger(obj)
  ledger.delete('foobar')
  expect(ledger.final).toStrictEqual({ foo: 123, bar: 'abc' })
  expect(ledger.log).toStrictEqual([{ foobar: { from: false, to: undefined } }])
  expect(ledger.audit).toStrictEqual({ foo: [123], bar: ['abc'], foobar: [false, undefined] })
})

test('Set function determines how to update property', () => {
  const obj = { foo: 123, bar: 'abc' }
  const ledger = new Ledger(obj)
  ledger.set('foo', 456)
  ledger.set('bar', 'abc')
  ledger.set('foobar', true)
  expect(ledger.final).toStrictEqual({ foo: 456, bar: 'abc', foobar: true })
  expect(ledger.log).toStrictEqual([{ foo: { from: 123, to: 456 } }, { foobar: { from: undefined, to: true } }])
  expect(ledger.audit).toStrictEqual({ foo: [123, 456], bar: ['abc'], foobar: [true] })
})

test('Set Property updates an existing property', () => {
  const obj = { foo: 123, bar: 'abc' }
  const ledger = new Ledger(obj)
  ledger.set('foo', 456)
  expect(ledger.final).toStrictEqual({ foo: 456, bar: 'abc' })
  expect(ledger.log).toStrictEqual([{ foo: { from: 123, to: 456 } }])
  expect(ledger.audit).toStrictEqual({ foo: [123, 456], bar: ['abc'] })
})

test('Changes to original object do not adjust ledger object', () => {
  const obj = { foo: 123, bar: 'abc' }
  const ledger = new Ledger(obj)
  obj.foobar = true
  expect(obj).toStrictEqual({ foo: 123, bar: 'abc', foobar: true })
  expect(ledger.original).toStrictEqual({ foo: 123, bar: 'abc' })
  expect(ledger.final).toStrictEqual({ foo: 123, bar: 'abc' })
  expect(ledger.log).toStrictEqual([])
  expect(ledger.audit).toStrictEqual({ foo: [123], bar: ['abc'] })
})
