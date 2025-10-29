
exports.up = (pgm) => {
     pgm.createTable('users', {
          id: 'id',
          name: { type: 'varchar(200)', notNull: true },
          email: { type: 'varchar(200)' },
          password: { type: 'varchar(200)' },
          gender: { type: "varchar(100)" },
          createdAt: {
               type: 'timestamp',
               notNull: true,
               default: pgm.func('current_timestamp'),
          },
          updatedAt: {
               type: 'timestamp',
               notNull: true,
               default: pgm.func('current_timestamp'),
          },
     });
};


exports.down = (pgm) => { };
