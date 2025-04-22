import { MigrationInterface, QueryRunner } from "typeorm";

export class NomMigration1744969660913 implements MigrationInterface {
    name = 'NomMigration1744969660913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conversation" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" integer, "conversationId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversation_participant" ("id" SERIAL NOT NULL, "userId" integer, "conversationId" integer, CONSTRAINT "PK_326cbb9ee8891f8e29157bda911" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_column" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "projectId" integer, CONSTRAINT "PK_4a2a36bbbaf0cfd82029c9c84d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "columnId" integer, "assignedToId" integer, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversation_participants_user" ("conversationId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_25e9241137cdb0f2336d267cc99" PRIMARY KEY ("conversationId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4928ef292e3fb48783034b82f7" ON "conversation_participants_user" ("conversationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5d93fb1843f96fbdefea37dae8" ON "conversation_participants_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_participant" ADD CONSTRAINT "FK_dd90174e375c888d7f431cf829e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_participant" ADD CONSTRAINT "FK_b1a75fd6cdb0ab0a82c5b01c34f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_column" ADD CONSTRAINT "FK_a03b6cfa2199fceed94ac14b843" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_f56fe6f2d8ab0b970f764bd601b" FOREIGN KEY ("columnId") REFERENCES "task_column"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_fd5f652e2fcdc4a5ab30aaff7a7" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_participants_user" ADD CONSTRAINT "FK_4928ef292e3fb48783034b82f7a" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "conversation_participants_user" ADD CONSTRAINT "FK_5d93fb1843f96fbdefea37dae86" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_participants_user" DROP CONSTRAINT "FK_5d93fb1843f96fbdefea37dae86"`);
        await queryRunner.query(`ALTER TABLE "conversation_participants_user" DROP CONSTRAINT "FK_4928ef292e3fb48783034b82f7a"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_fd5f652e2fcdc4a5ab30aaff7a7"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_f56fe6f2d8ab0b970f764bd601b"`);
        await queryRunner.query(`ALTER TABLE "task_column" DROP CONSTRAINT "FK_a03b6cfa2199fceed94ac14b843"`);
        await queryRunner.query(`ALTER TABLE "conversation_participant" DROP CONSTRAINT "FK_b1a75fd6cdb0ab0a82c5b01c34f"`);
        await queryRunner.query(`ALTER TABLE "conversation_participant" DROP CONSTRAINT "FK_dd90174e375c888d7f431cf829e"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d93fb1843f96fbdefea37dae8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4928ef292e3fb48783034b82f7"`);
        await queryRunner.query(`DROP TABLE "conversation_participants_user"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TABLE "task_column"`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "conversation_participant"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
    }

}
