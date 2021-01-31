# obj-ledger

This package provides a Ledger class that wraps underlying objects to record changes to properties on the object. Only changes that do not strictly equal the previous value are recorded.

Supported Node version: 12+

## Usage

```javascript
const Ledger = require('obj-ledger')
const obj = { foo: 123, bar: 'abc' }
const ledger = new Ledger(obj)
ledger.update({
  foo: 456,
  bar: 'abc',
  foobar: true
})
console.log(ledger.log) //=> [{ foo: { from: 123, to: 456 }, foobar: { from: undefined, to: true } }]
console.log(ledger.final) // => { foo: 456, bar: 'abc', foobar: true }
```

### Properties

* `original` => A copy of the original object passed into the ledger. This object is frozen and no updates can be performed
* `final` => A copy of the object based on all updates that have been performed. This object is frozen and no updates can be performed
* `obj` => An object that can be used to get and set values that are currently tracked by the ledger.
* `log` => An array of all changes to the objected in the order the changes occurred.
* `audit` => An object that shows how the properties on the object has changed. The audit does not include any information about the initial state of the object and only displays the changes to the object properties. New properties added after the ledger creation will be included in the audit

### Instance Functions

* `update(values)` => Applies updates to the ledger based upon the key/value pairs passed into the function. All updates will be recorded in a single log entry
* `set(property, value)` => Sets the value of a property. If the property is not currently tracked by the `.obj` property, it will be added and the property can be updated directly in the future
* `delete(property)` => Deletes the property from the object. In the log and audit objects, the value will be displayed as `undefined`