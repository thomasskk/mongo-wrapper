import {
  Collection,
  CreateIndexesOptions,
  Db,
  Document,
  IndexSpecification,
  MongoClient,
  MongoClientOptions,
} from 'mongodb'
import { Model, model } from './model.js'

export { WithProjectionRes, Projection } from './types.js'

export { Model, model }

type Indexes = {
  key: IndexSpecification
  options?: CreateIndexesOptions
}[]

class MongoInstance {
  db: Db | undefined

  client: MongoClient | undefined

  models = new Map<
    string,
    {
      collection: Collection
      indexes: Indexes
    }
  >()

  async connect({
    uri,
    options,
  }: {
    uri: string
    options?: MongoClientOptions
  }) {
    const client = new MongoClient(uri, options)

    client.on('connectionReady', () => {
      console.log(`Connected to mongoDB`)
    })

    await client.connect()

    await Promise.all(
      Array.from(this.models).map(([collectionName, data]) => {
        const collection = client.db().collection(collectionName)
        Object.assign(this.models.get(collectionName)!, collection)
        return Promise.all(
          data.indexes.map((index) =>
            collection.createIndex(index.key, index.options ?? {})
          )
        )
      })
    )

    this.client = client
    this.db = client.db()
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
    const collection: any = {}

    this.models.set(collectionName, { indexes, collection })

    return model<T>({
      collectionName,
      collection,
    })
  }

  async close() {
    await this.client?.close()
  }
}

export const mongoInstance = new MongoInstance()
