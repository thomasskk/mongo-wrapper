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

export const model = <T extends Document>({
  collection,
  collectionName,
}: {
  collection: Collection<T>
  collectionName: string
}) => {
  return {
    collectionName,
    findOne<F extends FindOptions<T> & Projection<T>>(
      filter: Filter<T>,
      options?: F
    ): Promise<WithProjectionRes<T, F> | null> {
      return collection.findOne(filter, options)
    },

    async exists(
      filter: Filter<T>,
      options?: FindOptions<T>
    ): Promise<boolean> {
      const result = await collection.findOne(filter, options)
      return !!result
    },

    findOneAndUpdate(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>> {
      return collection.findOneAndUpdate(filter, update, options ?? {})
    },

    insertOne(
      doc: OptionalUnlessRequiredId<T>,
      options?: InsertOneOptions
    ): Promise<InsertOneResult<T>> {
      return collection.insertOne(doc, options ?? {})
    },

    findOneAndReplace(
      filter: Filter<T>,
      replacement: WithoutId<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>> {
      return collection.findOneAndReplace(filter, replacement, options ?? {})
    },

    findOneAndDelete(
      filter: Filter<T>,
      options?: FindOneAndUpdateOptions
    ): Promise<ModifyResult<T>> {
      return collection.findOneAndDelete(filter, options ?? {})
    },

    find<F extends FindOptions<T> & Projection<T>>(
      filter: Filter<T>,
      options?: F
    ): FindCursor<WithProjectionRes<T, F>> {
      return collection.find(filter, options)
    },

    updateOne(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: UpdateOptions
    ): Promise<UpdateResult> {
      return collection.updateOne(filter, update, options ?? {})
    },

    updateMany(
      filter: Filter<T>,
      update: UpdateFilter<T>,
      options?: UpdateOptions
    ): Promise<Document | UpdateResult> {
      return collection.updateMany(filter, update, options ?? {})
    },

    deleteOne(
      filter: Filter<T>,
      options?: DeleteOptions
    ): Promise<DeleteResult> {
      return collection.deleteOne(filter, options ?? {})
    },

    deleteMany(
      filter: Filter<T>,
      options?: DeleteOptions
    ): Promise<DeleteResult> {
      return collection.deleteMany(filter, options ?? {})
    },

    count(filter: Filter<T>, options?: CountDocumentsOptions): Promise<number> {
      return collection.countDocuments(filter, options ?? {})
    },

    aggregate(
      pipeline?: { [key: string]: any }[],
      options?: AggregateOptions
    ): AggregationCursor<T> {
      return collection.aggregate(pipeline, options)
    },

    insertMany(
      docs: OptionalUnlessRequiredId<T>[],
      options?: BulkWriteOptions
    ): Promise<InsertManyResult<T>> {
      return options
        ? collection.insertMany(docs, options)
        : collection.insertMany(docs)
    },
  }
}

export type Model<T extends Document> = ReturnType<typeof model<T>>
