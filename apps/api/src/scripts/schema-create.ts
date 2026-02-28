import { getOrm } from '@seoul-advanture/database';

const orm = await getOrm();
await orm.schema.createSchema();
console.log('✅ Schema created successfully');
await orm.close();
