/* 密码本加密模块：PBKDF2 派生密钥 + AES-GCM 加密。
 * 全部依赖浏览器原生 Web Crypto，无第三方库。
 * 设计：主密码不存储，只存 salt + 校验值；条目内容加密后存密文。
 */
const Vault = (() => {
  const ITERATIONS = 210000;      // PBKDF2 迭代次数
  const KEY_LEN = 256;             // AES-256
  const VERIFY_TEXT = 'PERSONAL_HUB_VAULT_OK';

  let sessionKey = null;           // 解锁后驻留内存，页面关闭即失效
  let saltB64 = null;

  /* ---------- 编码工具 ---------- */
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function bufToB64(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function b64ToBuf(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }
  function randomB64(len) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return bufToB64(bytes.buffer);
  }

  /* ---------- 密钥派生 ---------- */
  async function deriveKey(password, saltBuf) {
    const baseKey = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: saltBuf, iterations: ITERATIONS, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: KEY_LEN },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /* ---------- 加密 / 解密 ---------- */
  async function encrypt(plainText, key) {
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, enc.encode(plainText)
    );
    return bufToB64(iv.buffer) + ':' + bufToB64(ct);
  }

  async function decrypt(payload, key) {
    const [ivB64, ctB64] = payload.split(':');
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(b64ToBuf(ivB64)) },
      key,
      b64ToBuf(ctB64)
    );
    return dec.decode(pt);
  }

  /* ---------- 初始化 / 解锁 ---------- */
  function isSupported() {
    return !!(window.crypto && window.crypto.subtle);
  }

  /** 是否已设置过主密码（存于 Store 的设置里） */
  function isInitialized() {
    const cfg = Store.getVaultConfig();
    return !!(cfg && cfg.salt && cfg.check);
  }

  /** 首次设置主密码 */
  async function setup(password) {
    if (!isSupported()) throw new Error('当前环境不支持加密');
    if (!password || password.length < 4) throw new Error('密码至少 4 位');
    const saltBuf = b64ToBuf(randomB64(16));
    saltB64 = bufToB64(saltBuf);
    const key = await deriveKey(password, saltBuf);
    const check = await encrypt(VERIFY_TEXT, key);
    Store.saveVaultConfig({ salt: saltB64, check, createdAt: Date.now() });
    sessionKey = key;
    return true;
  }

  /** 解锁：验证密码是否正确 */
  async function unlock(password) {
    if (!isSupported()) throw new Error('当前环境不支持加密');
    const cfg = Store.getVaultConfig();
    if (!cfg || !cfg.salt) throw new Error('尚未设置主密码');
    const saltBuf = b64ToBuf(cfg.salt);
    const key = await deriveKey(password, saltBuf);
    try {
      const text = await decrypt(cfg.check, key);
      if (text !== VERIFY_TEXT) throw new Error('密码错误');
    } catch (e) {
      throw new Error('密码错误');
    }
    sessionKey = key;
    saltB64 = cfg.salt;
    return true;
  }

  function lock() { sessionKey = null; }
  function isUnlocked() { return !!sessionKey; }

  /** 修改主密码：需要旧密码，重新加密所有条目 */
  async function changePassword(oldPassword, newPassword) {
    await unlock(oldPassword);
    if (!newPassword || newPassword.length < 4) throw new Error('新密码至少 4 位');
    const entries = await getEntries();          // 用旧 key 解密
    const newSalt = b64ToBuf(randomB64(16));
    const newKey = await deriveKey(newPassword, newSalt);
    const check = await encrypt(VERIFY_TEXT, newKey);
    Store.saveVaultConfig({ salt: bufToB64(newSalt), check, createdAt: Date.now() });
    sessionKey = newKey;
    await saveEntries(entries);                  // 用新 key 重新加密
    return true;
  }

  /* ---------- 条目读写（自动加解密） ---------- */
  async function getEntries() {
    if (!sessionKey) throw new Error('密码本未解锁');
    const raw = Store.getVaultEntries();
    const out = [];
    for (const rec of raw) {
      try {
        const json = await decrypt(rec.data, sessionKey);
        out.push({ id: rec.id, ...JSON.parse(json), updatedAt: rec.updatedAt });
      } catch (e) {
        // 单条损坏不影响其他
        out.push({ id: rec.id, title: '（无法解密）', account: '', password: '', note: '', broken: true });
      }
    }
    return out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  async function saveEntries(entries) {
    if (!sessionKey) throw new Error('密码本未解锁');
    const out = [];
    for (const e of entries) {
      const { id, title, account, password, note, url, category } = e;
      const json = JSON.stringify({ title, account, password, note, url, category });
      out.push({
        id: id || Store.uid(),
        data: await encrypt(json, sessionKey),
        updatedAt: Date.now()
      });
    }
    Store.saveVaultEntries(out);
  }

  async function addEntry(entry) {
    const entries = await getEntries();
    entries.unshift(entry);
    await saveEntries(entries);
  }

  async function updateEntry(id, patch) {
    const entries = await getEntries();
    const idx = entries.findIndex(e => e.id === id);
    if (idx < 0) return;
    entries[idx] = { ...entries[idx], ...patch };
    await saveEntries(entries);
  }

  async function deleteEntry(id) {
    const entries = await getEntries();
    await saveEntries(entries.filter(e => e.id !== id));
  }

  async function clearAll() {
    Store.saveVaultEntries([]);
  }

  return {
    isSupported, isInitialized, setup, unlock, lock, isUnlocked,
    changePassword, getEntries, addEntry, updateEntry, deleteEntry, clearAll
  };
})();
