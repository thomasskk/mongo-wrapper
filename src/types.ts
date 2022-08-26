import { Document, Filter, FindOptions as FindOptionsOg, WithId } from 'mongodb'

export type SortParams<T extends Document> = {
  skip?: number | undefined
  filter?: Filter<T>
  order: number
  param: string
  limit: number
}

export type ExactlyOne<T, K = keyof T> = K extends keyof T
  ? { [key in K]: T[K] }
  : never

type ProjectionPick<T> = { projection: { [K in keyof WithId<T>]?: 1 } }
type ProjectionOmit<T> = { projection: { [K in keyof WithId<T>]?: 0 } }

export type FindOptions<T extends Document> =
  | (
      | FindOptionsOg<T>
      | (FindOptionsOg<T> & (ProjectionPick<T> | ProjectionOmit<T>))
    )
  | undefined

export type FindOptionsReturn<
  T extends Document,
  F extends FindOptions<T>
> = F extends ProjectionPick<T>
  ? Pick<T, keyof F['projection']>
  : F extends ProjectionOmit<T>
  ? Omit<T, keyof F['projection']>
  : WithId<T>
