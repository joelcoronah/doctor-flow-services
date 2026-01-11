import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddMedicalRecordFiles1736560000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create medical_record_files table
    await queryRunner.createTable(
      new Table({
        name: 'medical_record_files',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'medicalRecordId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'originalName',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'mimeType',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'fileSize',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'fileData',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'uploadedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create foreign key constraint
    await queryRunner.createForeignKey(
      'medical_record_files',
      new TableForeignKey({
        columnNames: ['medicalRecordId'],
        referencedTableName: 'medical_records',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create index on medicalRecordId for faster queries
    await queryRunner.query(
      `CREATE INDEX "IDX_medical_record_files_medicalRecordId" ON "medical_record_files" ("medicalRecordId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_medical_record_files_medicalRecordId"`,
    );

    // Drop foreign key
    const table = await queryRunner.getTable('medical_record_files');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('medicalRecordId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('medical_record_files', foreignKey);
      }
    }

    // Drop table
    await queryRunner.dropTable('medical_record_files', true);
  }
}
