/**
 * PrepPal — Data Layer (script.js)
 * All data is persisted to localStorage under the key 'preppal_v1'
 *
 * Data shape:
 * {
 *   roles: {
 *     [id]: { id, name, createdAt, lastAccessedAt }
 *   },
 *   items: {
 *     [roleId]: [
 *       { id, title, type, status, note, createdAt, updatedAt }
 *     ]
 *   }
 * }
 */

const PrepData = (() => {
  const KEY = 'preppal_v1';

  // ─────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : { roles: {}, items: {} };
    } catch {
      return { roles: {}, items: {} };
    }
  }

  function save(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) {
      console.warn('PrepPal: could not save data.', e);
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ─────────────────────────────────────────────
  // Role operations
  // ─────────────────────────────────────────────

  /**
   * Returns all roles sorted by lastAccessedAt (most recent first).
   */
  function getRoles() {
    const db = load();
    return Object.values(db.roles).sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);
  }

  /**
   * Returns a single role by id, or null.
   */
  function getRole(id) {
    const db = load();
    return db.roles[id] || null;
  }

  /**
   * Creates a new role and returns it.
   */
  function createRole(name) {
    const db  = load();
    const id  = uid();
    const now = Date.now();
    const role = { id, name: name.trim(), createdAt: now, lastAccessedAt: now };
    db.roles[id] = role;
    db.items[id] = [];
    save(db);
    return role;
  }

  /**
   * Updates lastAccessedAt for a role (call when user opens dashboard).
   */
  function touchRole(id) {
    const db = load();
    if (db.roles[id]) {
      db.roles[id].lastAccessedAt = Date.now();
      save(db);
    }
  }

  /**
   * Deletes a role and all its items.
   */
  function deleteRole(id) {
    const db = load();
    delete db.roles[id];
    delete db.items[id];
    save(db);
  }

  // ─────────────────────────────────────────────
  // Item operations
  // ─────────────────────────────────────────────

  /**
   * Returns all items for a role, preserving insertion order (most recent last).
   */
  function getItems(roleId) {
    const db = load();
    return (db.items[roleId] || []).slice();
  }

  /**
   * Returns a single item by id from a role's list.
   */
  function getItem(roleId, itemId) {
    return getItems(roleId).find(x => x.id === itemId) || null;
  }

  /**
   * Adds an item to a role.
   * @param {string} roleId
   * @param {{ title: string, type: string }} data
   */
  function addItem(roleId, { title, type = 'topic' }) {
    const db  = load();
    const now = Date.now();
    const item = {
      id:        uid(),
      title:     title.trim(),
      type,                        // 'question' | 'topic' | 'note' | 'resource' | 'mock'
      status:    'pending',        // 'pending' | 'review' | 'done'
      note:      '',
      createdAt:  now,
      updatedAt:  now,
    };
    if (!db.items[roleId]) db.items[roleId] = [];
    db.items[roleId].push(item);
    if (db.roles[roleId]) db.roles[roleId].lastAccessedAt = now;
    save(db);
    return item;
  }

  /**
   * Partially updates an item's fields.
   * @param {string} roleId
   * @param {string} itemId
   * @param {Partial<item>} patch
   */
  function updateItem(roleId, itemId, patch) {
    const db = load();
    if (!db.items[roleId]) return;
    const idx = db.items[roleId].findIndex(x => x.id === itemId);
    if (idx === -1) return;
    db.items[roleId][idx] = {
      ...db.items[roleId][idx],
      ...patch,
      updatedAt: Date.now(),
    };
    save(db);
  }

  /**
   * Deletes an item from a role.
   */
  function deleteItem(roleId, itemId) {
    const db = load();
    if (!db.items[roleId]) return;
    db.items[roleId] = db.items[roleId].filter(x => x.id !== itemId);
    save(db);
  }

  // ─────────────────────────────────────────────
  // Export: bulk data for analytics/export
  // ─────────────────────────────────────────────

  function exportAll() {
    return load();
  }

  function importAll(data) {
    if (data && data.roles && data.items) {
      save(data);
      return true;
    }
    return false;
  }

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────

  return {
    getRoles,
    getRole,
    createRole,
    touchRole,
    deleteRole,
    getItems,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    exportAll,
    importAll,
  };
})();
