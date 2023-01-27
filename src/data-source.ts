import "reflect-metadata"
import { DataSource } from "typeorm"
import { Poem } from "./entity/Poem"
import sqliteConnection from '@/database';
import { AddPoemTable1674807898808 } from '@/migration/1674807898808-AddPoemTable'

export default new DataSource({
    type: 'capacitor',
    driver: sqliteConnection,
    database: 'poems',
    entities: [Poem],
    migrations: [AddPoemTable1674807898808],
    logging: ['error', 'query', 'schema'],
    synchronize: false,
    migrationsRun: false,
});
