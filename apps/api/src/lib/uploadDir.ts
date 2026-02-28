import { mkdir } from 'fs/promises';
import { join } from 'path';

export const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}
