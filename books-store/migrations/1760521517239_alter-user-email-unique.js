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

     pgm.addConstraint('users', 'users_email_unique', {
          unique: ['email']
     });
     pgm.alterColumn('users', 'email', {
          notNull: true,
     });
     pgm.alterColumn('users', 'name', {
          notNull: true,
     });
     pgm.alterColumn('users', 'password', {
          notNull: true,
     });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => { };
