import {
  CreateIndexesOptions,
  Db,
  Document,
  IndexSpecification,
  MongoClient,
  MongoClientOptions,
} from 'mongodb'
import { Model } from './model'
export { Model }

type Indexes = {
  key: IndexSpecification
  options?: CreateIndexesOptions
}[]

export const MongoInstance = () => {
  let db: Db | undefined
  let client: MongoClient | undefined

  return {
    db,
    client,
    models: new Map<
      string,
      {
        model: ReturnType<typeof Model>
        indexes: Indexes
      }
    >(),

    async init({
      uri,
      dbName,
      options,
    }: {
      uri: string
      dbName: string
      options?: MongoClientOptions
    }) {
      this.client = new MongoClient(uri, options)

      await this.client.connect()

      this.db = this.client.db(dbName)

      const indexPromises: Promise<string>[] = []

      for (const [collection, { indexes, model }] of this.models) {
        model.collection = this.db.collection(collection)
        for (const index of indexes) {
          indexPromises.push(
            this.db
              .collection(collection)
              .createIndex(index.key, index.options || {})
          )
        }
      }

      await Promise.all(indexPromises)
    },

    model<T extends Document>(
      collectionName: string,
      {
        indexes = [],
      }: {
        indexes?: Indexes
      } = {}
    ) {
      const model = Model<T>({
        collectionName,
        collection: {} as any,
      })

      this.models.set(collectionName, { indexes, model: model as any })

      return model
    },

    async close() {
      await this.client?.close()
    },
  }
}

export const mongoInstance = MongoInstance()
