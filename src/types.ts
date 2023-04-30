import {
  Document,
  Filter,
  FindOptions,
  ObjectId,
  OptionalUnlessRequiredId,
  WithId,
} from 'mongodb'

export type ProjectionPick<T> = {
  projection: { [K in keyof WithId<T>]?: 1 | true }
}
export type ProjectionOmit<T> = {
  projection: { [K in keyof WithId<T>]?: 0 | false }
}

export type Projection<T> = {
  projection: ProjectionPick<T>['projection'] | ProjectionOmit<T>['projection']
}

export type WithProjectionRes<
  T extends Document,
  F extends FindOptions<T> & Projection<T>
> = F['projection'] extends undefined | Record<string, never>
  ? WithId<T>
  : F['projection'] extends ProjectionPick<T>['projection']
  ? Pick<WithId<T>, keyof F['projection']>
  : F['projection'] extends ProjectionOmit<T>['projection']
  ? Omit<WithId<T>, keyof F['projection']>
  : WithId<T>
