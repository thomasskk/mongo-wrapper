import {
  AggregateOptions,
  AggregationCursor,
  BulkWriteOptions,
  Collection,
  CountDocumentsOptions,
  DeleteOptions,
  DeleteResult,
  Document,
  Filter,
  FindCursor,
  FindOneAndUpdateOptions,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  ModifyResult,
  OptionalUnlessRequiredId,
  Sort,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithId,
  WithoutId,
} from 'mongodb'
import { ExactlyOne, FindOptions, FindOptionsReturn, SortParams } from './types'

export const Model = <T extends Document>({
  collection,
  collectionName,
}: {
  collection: Collection<T>
  collectionName: string
}) => {
  const store: WithId<T>[] = []

  return {
    collectionName,
    collection,

    findOne<F extends FindOptions<T> = undefined>(
      filter: Filter<T>,
      options?: F
    ): Promise<FindOptionsReturn<T, F> | null> {
      return this.collection.findOne(filter, options)
    },

    async findOneOrFail<F extends FindOptions<T> = undefined>(
      filter: Filter<T>,
      options?: F
    ): Promise<FindOptionsReturn<T, F>> {
      const data = await this.findOne(filter, options)
      if (!data) {
        throw new Error(`Find failed for ${JSON.stringify(filter)} on ${this.collectionName}`)
      }
      return data
    },

    async exists(
      filter: Filter<T>,
      options?: FindOptions<T>
    ): Promise<boolean> {
      const result = await this.collection.findOne(filter, options)
      return !!result
    },

    async findOneWithCache(field: ExactlyOne<T>): Promise<WithId<T>> {
      const key = Object.keys(field)[0]
      const value = field[key]

      const storeData = store.find((data) => data[key] === value)

      if (storeData) {
        return storeData
      }

      const data = await this.findOneOrFail(field)
      store.push(data)
      return data
    },

    async findOneAndUpdate(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>> {
      return options
        ? this.collection.findOneAndUpdate(filter, update, options)
        : this.collection.findOneAndUpdate(filter, update)
    },

    async insertOne(
      doc: OptionalUnlessRequiredId<T>,
      options?: InsertOneOptions
    ): Promise<InsertOneResult<T>> {
      return options
        ? this.collection.insertOne(doc, options)
        : this.collection.insertOne(doc)
    },

    async findOneAndReplace(
      filter: Filter<T>,
      replacement: WithoutId<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>> {
      return options
        ? this.collection.findOneAndReplace(filter, replacement, options)
        : this.collection.findOneAndReplace(filter, replacement)
    },

    async findOneAndDelete(
      filter: Filter<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>> {
      return options
        ? this.collection.findOneAndDelete(filter, options)
        : this.collection.findOneAndDelete(filter)
    },

    find<F extends FindOptions<T> = undefined>(
      filter: Filter<T>,
      options?: F
    ): FindCursor<FindOptionsReturn<T, F>> {
      return this.collection.find(filter, options) as any
    },

    async findSortAndPaginate<F extends FindOptions<T> = undefined>(
      { filter = {}, param, order, ...optionsParam }: SortParams<T>,
      options?: F,
    ): Promise<{
      result: FindOptionsReturn<T, F>[]
      count: number
    }> {
      const sort = { [param]: order }
      const { skip = 1 } = optionsParam


      const resultQuery = this.find(filter, options)
        .limit(optionsParam.limit)
        .skip((skip - 1) * optionsParam.limit)
        .sort(sort as Sort)

      const [result, count] = await Promise.all([
        resultQuery.toArray(),
        this.count(filter),
      ])

      return {
        result,
        count,
      }
    },

    async updateOne(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: UpdateOptions
    ): Promise<UpdateResult> {
      return options
        ? this.collection.updateOne(filter, update, options)
        : this.collection.updateOne(filter, update)
    },

    async updateMany(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: UpdateOptions
    ): Promise<Document | UpdateResult> {
      return options
        ? this.collection.updateMany(filter, update, options)
        : this.collection.updateMany(filter, update)
    },

    async deleteOne(
      filter: Filter<T>,
      options?: DeleteOptions
    ): Promise<DeleteResult> {
      return options
        ? this.collection.deleteOne(filter, options)
        : this.collection.deleteOne(filter)
    },

    async deleteMany(
      filter: Filter<T>,
      options?: DeleteOptions
    ): Promise<DeleteResult> {
      return options
        ? this.collection.deleteMany(filter, options)
        : this.collection.deleteMany(filter)
    },

    async count(
      filter: Filter<T>,
      options?: CountDocumentsOptions
    ): Promise<number> {
      return options
        ? this.collection.countDocuments(filter, options)
        : this.collection.countDocuments(filter)
    },

    aggregate(
      pipeline?: { [key: string]: any }[],
      options?: AggregateOptions
    ): AggregationCursor<T> {
      return this.collection.aggregate(pipeline, options)
    },

    async insertMany(
      docs: OptionalUnlessRequiredId<T>[],
      options?: BulkWriteOptions
    ): Promise<InsertManyResult<T>> {
      return options
        ? this.collection.insertMany(docs, options)
        : this.collection.insertMany(docs)
    },
  }
}
}
