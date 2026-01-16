// src/storage/manager.js

import { R2Storage } from './r2';
import { generateId } from '../utils/id';

class StorageManager {
  constructor(env) {
    this.r2Storage = new R2Storage(env.FILE_BUCKET);
  }

  async store(file, previewEnabled = false, path = '') {
    const id = generateId();
    const metadata = {
      id,
      filename: file.name,
      path,
      size: file.size,
      storage_type: 'r2',
      preview_enabled: previewEnabled,
    };

    await this.r2Storage.store(id, file, previewEnabled, path);

    return metadata;
  }

  async retrieve(id) {
    return this.r2Storage.retrieve(id);
  }

  async delete(id) {
    return this.r2Storage.delete(id);
  }

  async list() {
    return this.r2Storage.list();
  }
}

export { StorageManager };
