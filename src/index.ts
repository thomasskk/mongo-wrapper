import {
  CreateIndexesOptions,
  Db,
  IndexSpecification,
  MongoClient,
  MongoClientOptions,
} from 'mongodb'
import { abstract, build } from './model.js'
import type { Model } from './types.js'
export type { Model }

type Indexes = {
  key: IndexSpecification
  options?: CreateIndexesOptions
}[]

class MongoInstance {
  models = new Map<
    string,
    {
      model: any
      indexes: Indexes
    }
  >()
  db?: Db
  client?: MongoClient

  async init(uri: string, dbName: string, options?: MongoClientOptions) {
    const mongoClient = new MongoClient(uri, {
      ignoreUndefined: true,
    })

    await mongoClient.connect()
    const db = mongoClient.db(dbName)

    this.db = db
    this.client = mongoClient

    const indexPromises: Promise<string>[] = []

    for (const [collection, { indexes, model }] of this.models) {
      build(model, collection, db)

      for (const index of indexes) {
        indexPromises.push(
          db.collection(collection).createIndex(index.key, index.options || {})
        )
      }
    }

    await Promise.all(indexPromises)
  }

  model<T>(
    collection: string,
    options: {
      indexes?: Indexes
    } = {}
  ) {
    const { indexes = [] } = options
    const model = abstract()

    this.models.set(collection, { model, indexes })

    return model as unknown as Model<T>
  }

  async close() {
    await this.client?.close()
  }
}

export const mongoInstance = new MongoInstance()
