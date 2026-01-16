// src/storage/manager.js

import { R2Storage } from './r2';
import { D1Storage } from './d1';
import { generateId } from '../utils/id';

class StorageManager {
  constructor(env) {
    this.r2Storage = new R2Storage(env.FILE_BUCKET);
    this.d1Storage = new D1Storage(env.DB);
  }

  async store(file, storageType, previewEnabled, path = '') {
    const id = generateId();
    const metadata = {
      id,
      filename: file.name,
      path,
      size: file.size,
      storage_type: storageType,
      preview_enabled: previewEnabled,
    };

    if (storageType === 'r2') {
      await this.r2Storage.store(id, file, previewEnabled, path);
    } else {
      await this.d1Storage.store(id, file, previewEnabled, path);
    }

    return metadata;
  }

  async retrieve(id) {
    // Attempt to retrieve from D1 storage
    let file = await this.d1Storage.retrieve(id);
    if (file) return file;

    // Attempt to retrieve from R2 storage
    file = await this.r2Storage.retrieve(id);
    if (file) return file;

    return null;
  }

  async delete(id) {
    // Attempt to delete from D1 storage
    let success = await this.d1Storage.delete(id);
    if (success) return true;

    // Attempt to delete from R2 storage
    success = await this.r2Storage.delete(id);
    if (success) return true;

    return false;
  }

  async list() {
    const d1Files = await this.d1Storage.list();
    const r2Files = await this.r2Storage.list();
    return [...d1Files, ...r2Files];
  }
}

export { StorageManager };
