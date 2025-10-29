/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
     pgm.createTable('book_instock', {
          id: 'id',
          bookId: {
               type: 'integer',
               notNull: true,
               references: '"books"',
               onDelete: 'CASCADE',
               unique: true,
          },
          stock: {
               type: 'integer',
               notNull: true,
               default: 0,
          },
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
     })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => { };
