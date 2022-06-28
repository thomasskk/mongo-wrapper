import {
  AggregateOptions,
  BulkWriteOptions,
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
  WithId,
  WithoutId,
} from 'mongodb'

export type ExactlyOne<T, K = keyof T> = K extends keyof T
  ? { [key in K]: T[K] }
  : never

type SortParams = {
  skip?: number | undefined
  filter?: Record<string, string[]> | undefined
  order: number
  param: string
  limit: number
}

type ProjectionPick<T> = { projection: { [K in keyof WithId<T>]?: 1 } }
type ProjectionOmit<T> = { projection: { [K in keyof WithId<T>]?: 0 } }
type ProjectionNever = { projection?: never }

type Projection<T> = ProjectionPick<T> | ProjectionOmit<T> | ProjectionNever

type ProjectionReturn<T, P extends Projection<T>> = P extends ProjectionNever
  ? WithId<T>
  : P extends ProjectionPick<T>
  ? Pick<T, keyof P['projection']>
  : P extends ProjectionOmit<T>
  ? Omit<T, keyof P['projection']>
  : WithId<T>

export interface Model<T> {
  new (): any
  collection: string
  store: WithId<T>[]

  findOne: <P extends Projection<T>>(
    filter: Filter<T>,
    options?: FindOptions<T> & P
  ) => Promise<ProjectionReturn<T, P> | null>

  findOneOrFail: (
    filter: Filter<T>,
    options?: FindOptions<T>
  ) => Promise<WithId<T>>

  findOneWithCache: (field: ExactlyOne<T>) => Promise<WithId<T>>

  exists: (filter: Filter<T>, options?: FindOptions<T>) => Promise<boolean>

  insertOne: (
    doc: OptionalUnlessRequiredId<T>,
    options?: InsertOneOptions
  ) => Promise<InsertOneResult<T>>

  findOneAndReplace: (
    filter: Filter<T>,
    replacement: WithoutId<T>,
    options?: FindOneAndUpdateOptions
  ) => Promise<ModifyResult<T>>

  findOneAndDelete: (
    filter: Filter<T>,
    options?: FindOneAndUpdateOptions
  ) => Promise<ModifyResult<T>>

  find: (filter: Filter<T>, options?: FindOptions<T>) => FindCursor<WithId<T>>

  /**
   * @param filter - ex : filter = { id: [1,2], email: ['a','b'] } whill match where id = 1 || 2 and email = 'a' || 'b'
   */
  findSortAndPaginate: (
    _: SortParams,
    options?: FindOptions<T> & { count?: boolean }
  ) => Promise<WithId<T>[] | { result: WithId<T>[]; count: void }>

  updateOne: (
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options?: UpdateOptions
  ) => Promise<UpdateResult>

  updateMany: (
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options?: UpdateOptions
  ) => Promise<Document | UpdateResult>

  deleteOne: (
    filter: Filter<T>,
    options?: DeleteOptions
  ) => Promise<DeleteResult>

  deleteMany: (
    filter: Filter<T>,
    options?: DeleteOptions
  ) => Promise<DeleteResult>

  count: (filter: Filter<T>, options?: CountDocumentsOptions) => Promise<number>

  aggregate: (
    pipeline?: { [key: string]: any }[],
    options?: AggregateOptions
  ) => Promise<
    {
      [key: string]: any
    }[]
  >

  insertMany: (
    docs: OptionalUnlessRequiredId<T>[],
    options?: BulkWriteOptions
  ) => Promise<InsertManyResult<T>>

  findOneAndUpdate(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options?: FindOneAndUpdateOptions
  ): Promise<ModifyResult<T>>
}
