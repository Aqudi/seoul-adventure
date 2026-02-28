import { getOrm } from '@seoul-advanture/database';

const orm = await getOrm();
await orm.schema.updateSchema();
console.log('✅ Schema updated successfully');
await orm.close();
