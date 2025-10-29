const { Client } = require('pg')

async function connectDatabase() {
     const client = new Client({
          port: 5432,
          database: "my-book-store",
          host: "localhost",
          user: "postgres",
          password: "Thek"
     })

     await client.connect()
     return client;

}

async function disconnectDatabase() {
     const client = new Client({
          port: 5432,
          database: "my-book-store",
          host: "localhost",
          user: "postgres",
          password: "Thek"
     })

     await client.connect()
     return client;

}

module.exports = { connectDatabase, disconnectDatabase }