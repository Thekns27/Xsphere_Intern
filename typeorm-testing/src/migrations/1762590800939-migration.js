/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Migration1762590800939 {
  name = "Migration1762590800939";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "address" character varying NOT NULL
        `);
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "address"
        `);
  }
}
