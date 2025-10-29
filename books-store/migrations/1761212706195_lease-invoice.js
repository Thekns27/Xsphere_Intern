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
     pgm.createType('invoice_status', ['LEASED', 'RETURNED', 'OVER_DUE']);
     pgm.createTable('lease_invoice', {
          id: 'id',
          invoice_no: {
               type: 'varchar(200)',
               notNull: true,
               unique: true,
          },
          user_id: {
               type: 'integer',
               notNull: true,
               references: '"users"',
               onDelete: 'CASCADE',
               unique: true,
          },
          total_price: {
               type: 'integer',
               notNull: true,
               default: 0
          },
          due_price: {
               type: 'integer',
               notNull: true,
               default: 0
          },
          due_date: {
               type: 'timestamp',
               notNull: true,
          },
          created_at: {
               type: 'timestamp',
               notNull: true,
               default: pgm.func('current_timestamp'),
          },
          updated_at: {
               type: 'timestamp',
               notNull: true,
               default: pgm.func('current_timestamp'),
          },
     });
     pgm.createTable('lease_invoice_items', {
          id: 'id',
          invoice_id: {
               type: 'integer',
               notNull: true,
               references: '"lease_invoice"',
               onDelete: 'CASCADE',
               unique: true,
          },
          book_id: {
               type: 'integer',
               notNull: true,
               references: '"books"',
               onDelete: 'CASCADE',
               unique: true,
          },
          quantity: {
               type: 'integer',
               notNull: true,
               default: 0,
          },
          total_price: {
               type: 'integer',
               notNull: true,
               default: 0,
          },
     })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => { };
