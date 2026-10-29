import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1793298168234 implements MigrationInterface {
    name = 'InitialSchema1793298168234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "slug" character varying(160) NOT NULL, "description" text, CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "slug" character varying(160) NOT NULL, CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."posts_status_enum" AS ENUM('draft', 'published')`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author_id" uuid NOT NULL, "excerpt" character varying(200), "category_id" uuid, "title" character varying(200) NOT NULL, "slug" character varying(220) NOT NULL, "content" text NOT NULL, "status" "public"."posts_status_enum" NOT NULL DEFAULT 'draft', "published_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "authors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying(120) NOT NULL, "bio" text, CONSTRAINT "REL_ccb4b08154f01e48f1524b1a43" UNIQUE ("user_id"), CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_tags" ("post_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_deee54a40024b7afc16d25684f8" PRIMARY KEY ("post_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5df4e8dc2cb3e668b962362265" ON "post_tags"  ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_192ab488d1c284ac9abe2e3035" ON "post_tags"  ("tag_id") `);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_852f266adc5d67c40405c887b49" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "authors" ADD CONSTRAINT "FK_ccb4b08154f01e48f1524b1a43d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_tags" ADD CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_tags" ADD CONSTRAINT "FK_192ab488d1c284ac9abe2e30356" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_192ab488d1c284ac9abe2e30356"`);
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_5df4e8dc2cb3e668b962362265d"`);
        await queryRunner.query(`ALTER TABLE "authors" DROP CONSTRAINT "FK_ccb4b08154f01e48f1524b1a43d"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_852f266adc5d67c40405c887b49"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_312c63be865c81b922e39c2475e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_192ab488d1c284ac9abe2e3035"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5df4e8dc2cb3e668b962362265"`);
        await queryRunner.query(`DROP TABLE "post_tags"`);
        await queryRunner.query(`DROP TABLE "authors"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TYPE "public"."posts_status_enum"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
