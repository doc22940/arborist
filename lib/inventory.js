// a class to manage an inventory and set of indexes of
// a set of objects based on specific fields.
// primary is the primary index key.
// keys is the set of fields to be able to query.
const _primaryKey = Symbol('_primaryKey')
const _index = Symbol('_index')
class Inventory extends Map {
  constructor (opt = {}) {
    const { primary, keys } = opt
    super()
    this[_primaryKey] = primary || 'location'
    this[_index] = (keys || ['name', 'license']).reduce((index, i) => {
      index.set(i, new Map())
      return index
    }, new Map())
  }

  get primaryKey () {
    return this[_primaryKey]
  }
  get indexes () {
    return [...this[_index].keys()]
  }

  add (node) {
    const current = super.get(node[this.primaryKey])
    if (current) {
      if (current === node)
        return
      this.delete(current)
    }
    super.set(node[this.primaryKey], node)
    for (const [key, map] of this[_index].entries()) {
      const set = map.get(node[key]) || new Set()
      set.add(node)
      map.set(node[key], set)
    }
  }

  delete (node) {
    if (!this.has(node))
      return

    super.delete(node[this.primaryKey])
    for (const [key, map] of this[_index].entries()) {
      const set = map.get(node[key])
      set.delete(node)
      if (set.size === 0)
        map.delete(node[key])
    }
  }

  query (key, val) {
    const map = this[_index].get(key)
    return map && map.get(val)
  }

  has (node) {
    return super.get(node[this.primaryKey]) === node
  }

  set (k, v) {
    throw new Error('direct set() not supported, use inventory.add(node)')
  }
}

module.exports = Inventory
