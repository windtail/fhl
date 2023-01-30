import "reflect-metadata"
import { DataSource } from "typeorm"
import { Poem } from "./entity/Poem"
import {Segment} from "@/entity/Segment";
import sqliteConnection from '@/database';
import { AddPoemTable1674807898808 } from '@/migration/1674807898808-AddPoemTable'
import { AddSegmentTable1674807898808 } from '@/migration/1674807898808-AddSegmentTable'

export default new DataSource({
    type: 'capacitor',
    driver: sqliteConnection,
    database: 'poems',
    entities: [Poem, Segment],
    migrations: [AddPoemTable1674807898808, AddSegmentTable1674807898808],
    logging: ['error', 'query', 'schema'],
    synchronize: false,
    migrationsRun: false,
});
