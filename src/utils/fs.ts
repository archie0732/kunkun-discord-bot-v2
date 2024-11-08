import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

import type { WriteFileOptions } from 'fs';

export const safeWriteFileSync = (
  path: string,
  data: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions,
) => {
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
  }

  writeFileSync(path, data, options);
};
