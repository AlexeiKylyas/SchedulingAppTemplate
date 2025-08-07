import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtpTable1749983175732 implements MigrationInterface {
    name = 'AddOtpTable1749983175732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "phoneNumber" character varying NOT NULL, "code" character varying NOT NULL, "expiredAt" TIMESTAMP NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_3bf5baa3b3e7d7c6b686b5f6b8c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "otps"`);
    }
}