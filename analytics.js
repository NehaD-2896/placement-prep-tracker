/**
 * PrepPal — Analytics (analytics.js)
 *
 * Tracks:
 *  - Page views
 *  - Custom events (role_created, item_added, status_changed, …)
 *  - Per-role activity feed (human-readable log)
 *  - Session timing (time spent in each role)
 *  - Last-session timestamp (shown on index page)
 *
 * All stored in localStorage under 'preppal_analytics_v1'.
 * No external calls — fully local analytics.
 *
 * Schema:
 * {
 *   events:    [{ ts, type, payload }],       ← event log
 *   sessions:  { [roleId]: [{ start, end, duration }] },
 *   activity:  { [roleId]: [{ ts, msg }] },    ← per-role feed
 *   lastSeen:  number (timestamp),
 * }
 */

const analytics = (() => {
  const KEY         = 'preppal_analytics_v1';
  const MAX_EVENTS  = 500;   // cap stored events
  const MAX_ACTS    = 40;    // cap per-role activity entries

  // ─────────────────────────────────────────────
  // Internal helpers
  // ─────────────────────────────────────────────

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw
        ? JSON.parse(raw)
        : { events: [], sessions: {}, activity: {}, lastSeen: null };
    } catch {
      return { events: [], sessions: {}, activity: {}, lastSeen: null };
    }
  }

  function save(db) {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) {
      console.warn('PrepPal analytics: could not save.', e);
    }
  }

  function now() { return Date.now(); }

  // Active session handle: { roleId, start }
  let _session = null;

  // ─────────────────────────────────────────────
  // Page views
  // ─────────────────────────────────────────────

  /**
   * Call at the top of each page's DOMContentLoaded.
   * @param {string} page  'index' | 'dashboard'
   * @param {object} [payload]
   */
  function trackPageView(page, payload = {}) {
    const db = load();
    db.lastSeen = now();
    _appendEvent(db, 'page_view', { page, ...payload });
    save(db);
  }

  // ─────────────────────────────────────────────
  // Custom events
  // ─────────────────────────────────────────────

  /**
   * Track any named event.
   * @param {string} type  e.g. 'role_created', 'item_added', 'status_changed'
   * @param {object} [payload]
   */
  function trackEvent(type, payload = {}) {
    const db = load();
    _appendEvent(db, type, payload);
    save(db);
  }

  function _appendEvent(db, type, payload) {
    db.events.push({ ts: now(), type, payload });
    // Keep only the most recent MAX_EVENTS
    if (db.events.length > MAX_EVENTS) {
      db.events = db.events.slice(-MAX_EVENTS);
    }
  }

  // ─────────────────────────────────────────────
  // Per-role activity feed
  // ─────────────────────────────────────────────

  /**
   * Append a human-readable activity message for a role.
   * @param {string} roleId
   * @param {string} msg
   */
  function logActivity(roleId, msg) {
    const db = load();
    if (!db.activity[roleId]) db.activity[roleId] = [];
    db.activity[roleId].push({ ts: now(), msg });
    // Cap per-role
    if (db.activity[roleId].length > MAX_ACTS) {
      db.activity[roleId] = db.activity[roleId].slice(-MAX_ACTS);
    }
    save(db);
  }

  /**
   * Returns activity entries for a role (oldest first).
   * @param {string} roleId
   * @returns {{ ts: number, msg: string }[]}
   */
  function getActivity(roleId) {
    const db = load();
    return (db.activity[roleId] || []).slice();
  }

  // ─────────────────────────────────────────────
  // Session timing
  // ─────────────────────────────────────────────

  /**
   * Start a timed session for a role.
   * Call in dashboard DOMContentLoaded.
   */
  function startSession(roleId) {
    _session = { roleId, start: now() };
    logActivity(roleId, 'Session started');
  }

  /**
   * End the current session and record its duration.
   * Call in window.beforeunload.
   */
  function endSession(roleId) {
    if (!_session || _session.roleId !== roleId) return;
    const duration = now() - _session.start;          // ms
    const db = load();
    if (!db.sessions[roleId]) db.sessions[roleId] = [];
    db.sessions[roleId].push({
      start:    _session.start,
      end:      now(),
      duration,
    });
    // Keep last 30 sessions per role
    if (db.sessions[roleId].length > 30) {
      db.sessions[roleId] = db.sessions[roleId].slice(-30);
    }
    _appendEvent(db, 'session_end', { roleId, duration });
    save(db);
    _session = null;
  }

  /**
   * Total time (ms) spent on a specific role across all sessions.
   */
  function getTotalTime(roleId) {
    const db = load();
    return (db.sessions[roleId] || []).reduce((sum, s) => sum + s.duration, 0);
  }

  /**
   * Total time (ms) across all roles.
   */
  function getGlobalTotalTime() {
    const db = load();
    return Object.values(db.sessions).flat().reduce((sum, s) => sum + s.duration, 0);
  }

  /**
   * Human-readable last session time shown on the index page.
   * @returns {string|null}
   */
  function getLastSession() {
    const db = load();
    if (!db.lastSeen) return null;
    const diff = now() - db.lastSeen;
    if (diff < 60000)    return 'Just now';
    if (diff < 3600000)  return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    const d = new Date(db.lastSeen);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }

  // ─────────────────────────────────────────────
  // Summary (useful for a future analytics page)
  // ─────────────────────────────────────────────

  /**
   * Returns a high-level summary object.
   */
  function getSummary() {
    const db       = load();
    const events   = db.events;
    const total    = events.length;
    const rolesMade = events.filter(e => e.type === 'role_created').length;
    const itemsAdded = events.filter(e => e.type === 'item_added').length;
    const statusChanges = events.filter(e => e.type === 'status_changed').length;
    const doneChanges = events.filter(
      e => e.type === 'status_changed' && e.payload.status === 'done'
    ).length;

    return {
      totalEvents:   total,
      rolesCreated:  rolesMade,
      itemsAdded,
      statusChanges,
      itemsCompleted: doneChanges,
      totalTimeMs:   getGlobalTotalTime(),
      lastSeen:      db.lastSeen,
    };
  }

  /**
   * Returns all events (for debugging or export).
   */
  function getEvents() {
    return load().events.slice();
  }

  /**
   * Clears analytics data for a specific role (call when role is deleted).
   */
  function clearRole(roleId) {
    const db = load();
    delete db.sessions[roleId];
    delete db.activity[roleId];
    save(db);
  }

  /**
   * Wipes all analytics data.
   */
  function reset() {
    localStorage.removeItem(KEY);
  }

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────

  return {
    trackPageView,
    trackEvent,
    logActivity,
    getActivity,
    startSession,
    endSession,
    getTotalTime,
    getGlobalTotalTime,
    getLastSession,
    getSummary,
    getEvents,
    clearRole,
    reset,
  };
})();
