import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    age: {
      type: Number,
      nullable: true,
    },
    bio: {
      type: String,
      nullable: true,
    },
    address: {
      type: String,
      nullable: true,
    },
  },
});
