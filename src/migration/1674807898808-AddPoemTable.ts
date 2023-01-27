import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPoemTable1674807898808 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "poem" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "no" integer UNIQUE,
                "title" TEXT NOT NULL,
                "dynasty" TEXT NOT NULL,
                "author" TEXT NOT NULL,
                "content" TEXT NOT NULL,
                "favor" integer
            );
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            DROP TABLE "poem";
        `);
	}
}
