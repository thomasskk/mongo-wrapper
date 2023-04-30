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
  FindOptions,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  ModifyResult,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithoutId,
} from 'mongodb'

import { Projection, WithProjectionRes } from './types.js'

export const modelFactory = <T extends Document>(params: {
  collection: Collection<T>
  collectionName: string
}) => {
  const s = { collection: params.collection }
  return {
    set collection(coll: Collection<T>) {
      s.collection = coll
    },
    get collection(): Collection<T> {
      return s.collection
    },
    collectionName: params.collectionName,
    async findOne<F extends FindOptions<T> & Projection<T>>(
      filter: Filter<T>,
      options?: F
    ): Promise<WithProjectionRes<T, F> | null> {
      return s.collection.findOne(filter, options)
    },

    async exists(
      filter: Filter<T>,
      options?: FindOptions<T>
    ): Promise<boolean> {
      const result = await s.collection.findOne(filter, options)
      return !!result
    },

    findOneAndUpdate(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>> {
      return s.collection.findOneAndUpdate(filter, update, options ?? {})
    },

    insertOne(
      doc: OptionalUnlessRequiredId<T>,
      options?: InsertOneOptions
    ): Promise<InsertOneResult<T>> {
      return s.collection.insertOne(doc, options ?? {})
    },

    findOneAndReplace(
      filter: Filter<T>,
      replacement: WithoutId<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>> {
      return s.collection.findOneAndReplace(filter, replacement, options ?? {})
    },

    findOneAndDelete(
      filter: Filter<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>> {
      return s.collection.findOneAndDelete(filter, options ?? {})
    },

    find<F extends FindOptions<T> & Projection<T>>(
      filter: Filter<T>,
      options?: F
    ): FindCursor<WithProjectionRes<T, F>> {
      return s.collection.find(filter, options)
    },

    updateOne(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: UpdateOptions
    ): Promise<UpdateResult> {
      return s.collection.updateOne(filter, update, options ?? {})
    },

    updateMany(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: UpdateOptions
    ): Promise<Document | UpdateResult> {
      return s.collection.updateMany(filter, update, options ?? {})
    },

    deleteOne(
      filter: Filter<T>,
      options?: DeleteOptions
    ): Promise<DeleteResult> {
      return s.collection.deleteOne(filter, options ?? {})
    },

    deleteMany(
      filter: Filter<T>,
      options?: DeleteOptions
    ): Promise<DeleteResult> {
      return s.collection.deleteMany(filter, options ?? {})
    },

    count(filter: Filter<T>, options?: CountDocumentsOptions): Promise<number> {
      return s.collection.countDocuments(filter, options ?? {})
    },

    aggregate(
      pipeline?: { [key: string]: any }[],
      options?: AggregateOptions
    ): AggregationCursor<T> {
      return s.collection.aggregate(pipeline, options)
    },

    insertMany(
      docs: OptionalUnlessRequiredId<T>[],
      options?: BulkWriteOptions
    ): Promise<InsertManyResult<T>> {
      return options
        ? s.collection.insertMany(docs, options)
        : s.collection.insertMany(docs)
    },
  }
}

export type Model<T extends Document = any> = ReturnType<typeof modelFactory<T>>
