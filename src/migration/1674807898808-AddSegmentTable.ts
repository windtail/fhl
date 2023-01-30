import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSegmentTable1674807898808 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "segment" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "content" TEXT NOT NULL,
                "poemId" integer,
                CONSTRAINT fk_poem FOREIGN KEY ("poemId") REFERENCES "poem"("id") ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            DROP TABLE "segment";
        `);
	}
}
