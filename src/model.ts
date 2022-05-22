import { Db, Sort, WithId } from 'mongodb'
import { Model } from './types.js'

const abstractMethod = () => {
  throw new Error('Collection is not initialized!')
}

export function abstract() {
  return class Model {
    static store = []
    constructor() {}
    static aggregate = abstractMethod
    static countDocuments = abstractMethod
    static deleteMany = abstractMethod
    static deleteOne = abstractMethod
    static find = abstractMethod
    static findOne = abstractMethod
    static findOneOrFail = abstractMethod
    static findOneAndDelete = abstractMethod
    static findOneAndUpdate = abstractMethod
    static insertMany = abstractMethod
    static insertOne = abstractMethod
    static findSortAndPaginate = abstractMethod
    static updateMany = abstractMethod
    static updateOne = abstractMethod
  }
}

export function build<T>(model: Model<T>, _collection: string, Db: Db) {
  const collection = Db.collection<T>(_collection)

  model.collection = _collection

  model.findOne = (filter, options) => collection.findOne(filter, options)

  model.findOneOrFail = async (filter, options) => {
    const data = await model.findOne(filter, options)
    if (!data) {
      throw new Error(`Model not found : ${model.collection}`)
    }
    return data
  }

  model.exists = async (filter) => {
    const result = await collection.findOne(filter)
    return !!result
  }

  model.findOneWithCache = async (field) => {
    const key = Object.keys(field)[0] as keyof WithId<T>
    const value = (field as any)[key] as WithId<T>[typeof key]

    const storeData = model.store.find((data) => data[key] === value)

    if (storeData) {
      return storeData
    }

    const data = await model.findOneOrFail(field)
    model.store.push(data)
    return data
  }

  model.findOneAndUpdate = async (filter, update, options) =>
    options
      ? collection.findOneAndUpdate(filter, update, options)
      : collection.findOneAndUpdate(filter, update)

  model.insertOne = (doc, options) =>
    options ? collection.insertOne(doc, options) : collection.insertOne(doc)

  model.findOneAndReplace = (filter, replacement, options) =>
    options
      ? collection.findOneAndReplace(filter, replacement, options)
      : collection.findOneAndReplace(filter, replacement)

  model.findOneAndDelete = (filter, options) =>
    options
      ? collection.findOneAndDelete(filter, options)
      : collection.findOneAndDelete(filter)

  model.find = (filter, options) => collection.find(filter, options)

  model.findSortAndPaginate = async (sortParams, options) => {
    let isCount: boolean | undefined
    let _options

    if (options) {
      const { count, ...rest } = options
      _options = rest
      isCount = count
    }

    const { filter, param, order, ...optionsParam } = sortParams
    const sort = { [param]: order }

    if (sortParams.filter) {
      for (const key in sortParams.filter) {
        if (Array.isArray(sortParams.filter[key])) {
          sortParams.filter[key] = {
            $in: sortParams.filter[key],
          } as any
        }
      }
    }

    if (optionsParam.skip) {
      optionsParam.skip = ((optionsParam.skip as any) - 1) as any
    }

    const resultQuery = collection
      .find(sortParams.filter as any, _options)
      .limit(optionsParam.limit)
      .skip(((optionsParam.skip as any) || 0) * optionsParam.limit)
      .sort(sort as Sort)

    if (isCount) {
      const [result, count] = await Promise.all([
        resultQuery.toArray(),
        collection.countDocuments(sortParams.filter as any),
      ])

      return { result, count }
    }

    return resultQuery.toArray()
  }

  model.updateOne = (filter, update, options) =>
    options
      ? collection.updateOne(filter, update, options)
      : collection.updateOne(filter, update)

  model.updateMany = (filter, update, options) =>
    options
      ? collection.updateMany(filter, update, options)
      : collection.updateMany(filter, update)

  model.deleteOne = (filter, options) =>
    options
      ? collection.deleteOne(filter, options)
      : collection.deleteOne(filter)

  model.deleteMany = (filter, options) =>
    options
      ? collection.deleteMany(filter, options)
      : collection.deleteMany(filter)

  model.count = (filter, options) =>
    options
      ? collection.countDocuments(filter, options)
      : collection.countDocuments(filter)

  model.aggregate = (pipeline, options) =>
    collection.aggregate(pipeline, options).toArray()

  model.insertMany = (docs, options) => {
    return options
      ? collection.insertMany(docs, options)
      : collection.insertMany(docs)
  }
}
