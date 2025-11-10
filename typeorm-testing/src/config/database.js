import { DataSource } from 'typeorm'
import User from '../entities/User.js'


export const AppDataSource = new DataSource({
     type: "postgres",
     host: "localhost",
     port: 5432,
     username: "postgres",
     password: "Thek",
     database: "my-typeorm-testing",
     synchronize: false,
     // logging: true,
     entities: [User],
     subscribers: [],
     migrations: ['src/migrations/*.js'],
})