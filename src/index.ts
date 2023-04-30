import {
  CreateIndexesOptions,
  Db,
  Document,
  IndexSpecification,
  MongoClient,
  MongoClientOptions,
} from 'mongodb'
import { Model, modelFactory } from './model.js'

export { WithProjectionRes, Projection } from './types.js'

export { Model, modelFactory }

type Indexes = {
  key: IndexSpecification
  options?: CreateIndexesOptions
}[]

class MongoInstance {
  db: Db | undefined

  client: MongoClient | undefined

  models = new Map<string, Model>()

  indexes = new Map<string, Indexes>()

  async connect({
    uri,
    options,
  }: {
    uri: string
    options?: MongoClientOptions
  }) {
    const client = new MongoClient(uri, options)

    await client.connect()
    const db = client.db()

    this.models.forEach((model) => {
      // eslint-disable-next-line no-param-reassign
      model.collection = db.collection(model.collectionName)
    })

    await Promise.all(
      Array.from(this.indexes).map(([collectionName, arr]) => {
        return Promise.all(
          arr.map((index) =>
            db
              .collection(collectionName)
              .createIndex(index.key, index.options ?? {})
          )
        )
      })
    )

    this.client = client
    this.db = db
  }

  async disconnect() {
    await this.client?.close()
  }

  createModel<T extends Document>(
    collectionName: string,
    {
      indexes = [],
    }: {
      indexes?: Indexes
    } = {}
  ): Model<T> {
    const model = modelFactory<T>({
      collectionName,
      collection: {} as any,
    })

    this.models.set(collectionName, model as Model<T>)
    this.indexes.set(collectionName, indexes)

    return model
  }

  async close() {
    await this.client?.close()
  }
}

export const mongoInstance = new MongoInstance()
