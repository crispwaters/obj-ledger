class Ledger {
  #values
  #logUpdates
  #log
  #audit
  #initialized

  constructor (obj) {
    this.#values = {}
    this.#logUpdates = false
    this.#initialized = false
    this.#log = []
    this.#audit = {}
    Object.defineProperty(this, 'log', {
      get () { return Object.freeze([...this.#log]) }
    })
    Object.defineProperty(this, 'audit', {
      get () { return Object.freeze({ ...this.#audit }) }
    })
    Object.defineProperty(this, 'original', {
      value: Object.freeze({ ...obj }),
      writable: false
    })
    Object.defineProperty(this, 'final', {
      get () { return Object.freeze({ ...this.#values }) }
    })
    Object.defineProperty(this, 'obj', {
      value: {},
      writable: false
    })
    for (const [key, value] of Object.entries(obj)) {
      this.set(key, value)
    }
    this.#logUpdates = true
    this.#initialized = true
  }

  set (key, value) {
    if (this.obj[key] === undefined) {
      const ledger = this
      Object.defineProperty(ledger.obj, key, {
        get () { return ledger.#values[key] },
        set (value) {
          if (value !== ledger.#values[key]) {
            if (ledger.#logUpdates) ledger.#log.push({ [key]: { from: ledger.#values[key], to: value } })
            if (ledger.#initialized) {
              if (ledger.#audit[key] === undefined) ledger.#audit[key] = []
              ledger.#audit[key].push(value)
            }
          }
          ledger.#values[key] = value
        }
      })
    }
    this.obj[key] = value
  }

  delete (key, value) {
    if (this.#values[key] !== undefined) {
      this.obj[key] = undefined
      delete this.#values[key]
    }
  }

  update (values) {
    const updates = {}
    this.#logUpdates = false
    for (const [key, value] of Object.entries(values)) {
      if (this.obj[key] !== value) updates[key] = { from: this.#values[key], to: value }
      if (this.obj[key] === undefined) this.set(key, value)
      this.obj[key] = value
    }
    if (Object.keys(updates).length) this.#log.push(updates)
    this.#logUpdates = true
  }
}

module.exports = Ledger
