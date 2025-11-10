/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Migration1762591394690 {
  name = "Migration1762591394690";

  /**
   * @param {QueryRunner} queryRunner
   */
  async up(queryRunner) {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "age" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "bio" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "address" DROP NOT NULL
        `);
  }

  /**
   * @param {QueryRunner} queryRunner
   */
  async down(queryRunner) {
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "address"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "bio"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "age"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"
        `);
  }
}
