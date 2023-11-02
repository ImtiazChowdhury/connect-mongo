# connect-mongo

Connect to mongoDB and re-use the connection to benefit from mongoDB node driver's connection pooling

```ts
    import mongoClient from "@imtiazchowdhury/mongopool"

    //this setup has to be done once only, preferrably in the application root like app.js file
    mongoClient.url = "mongodb://127.0.0.1:27017" // mongodb url
    mongoClient.dbName = "YOUR_DB_NAME"

    ...

    //whenever you need db instance
    const db = await mongoClient.getDB()
    const result = await db.collection("COLLECTION_NAME").findOne({...})

    ...

```

## Installation

```sh
npm install @imtiazchowdhury/mongopool
```
