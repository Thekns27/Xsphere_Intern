exports.up = (database) => {
     database.createTable('authors', {
          id: 'id',
          name: { type: 'varchar(200)', notNull: true },
          bio: { type: 'varchar(200)' },
          createdAt: {
               type: 'timestamp',
               notNull: true,
               default: database.func('current_timestamp'),
          },
          updatedAt: {
               type: 'timestamp',
               notNull: true,
               default: database.func('current_timestamp'),
          },
     });
     database.createTable('books', {
          id: 'id',
          title: { type: 'varchar(200)', notNull: true },
          description: { type: 'varchar(200)' },
          authorId: {
               type: 'integer',
               notNull: true,
               references: '"authors"',
               onDelete: 'CASCADE',
          },
          createdAt: {
               type: 'timestamp',
               notNull: true,
               default: database.func('current_timestamp'),
          },
          updatedAt: {
               type: 'timestamp',
               notNull: true,
               default: database.func('current_timestamp'),
          },
     });

     database.createIndex('books', 'authorId');
};

exports.down = (pgm) => { };