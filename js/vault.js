/* 密码本加密模块：PBKDF2 派生密钥 + AES-GCM 加密。
 * 双引擎：
 *  1) 优先浏览器 Web Crypto（HTTPS/安全上下文）
 *  2) file:// 下 crypto.subtle 不可用，自动用原生桥 AndroidCrypto
 * 两者算法与数据格式完全一致，互相兼容。
 */
const Vault = (() => {
  const ITERATIONS = 210000;
  const KEY_LEN = 256;
  const VERIFY_TEXT = 'PERSONAL_HUB_VAULT_OK';

  let sessionKey = null;   // WebCrypto 模式：CryptoKey；原生模式：{ password, saltB64 }
  let useNative = false;

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function nativeCrypto() {
    try {
      return (typeof window !== 'undefined' && window.AndroidCrypto) ? window.AndroidCrypto : null;
    } catch (e) { return null; }
  }

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
    const nc = nativeCrypto();
    if (nc && typeof nc.randomB64 === 'function') return nc.randomB64(len);
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return bufToB64(bytes.buffer);
  }

  /* ---------- 密钥派生（WebCrypto 模式） ---------- */
  async function deriveKeyWeb(password, saltBuf) {
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

  /* ---------- 加密 / 解密（自动选引擎） ---------- */
  async function encrypt(plainText, key) {
    const nc = nativeCrypto();
    if (useNative && nc) {
      const r = nc.deriveEncrypt(key.password, key.saltB64, plainText);
      if (String(r).startsWith('ERR:')) throw new Error('加密失败');
      return r;
    }
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, enc.encode(plainText)
    );
    return bufToB64(iv.buffer) + ':' + bufToB64(ct);
  }

  async function decrypt(payload, key) {
    const nc = nativeCrypto();
    if (useNative && nc) {
      const r = nc.deriveDecrypt(key.password, key.saltB64, payload);
      if (String(r).startsWith('ERR:')) throw new Error('解密失败');
      return r;
    }
    const [ivB64, ctB64] = payload.split(':');
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(b64ToBuf(ivB64)) },
      key,
      b64ToBuf(ctB64)
    );
    return dec.decode(pt);
  }

  /** 是否支持加密：WebCrypto 或 原生桥，二者有其一即可 */
  function isSupported() {
    const web = !!(window.crypto && window.crypto.subtle);
    const nc = nativeCrypto();
    useNative = !web && !!(nc && typeof nc.deriveEncrypt === 'function');
    return web || useNative;
  }

  function isInitialized() {
    const cfg = Store.getVaultConfig();
    return !!(cfg && cfg.salt && cfg.check);
  }

  async function setup(password) {
    if (!isSupported()) throw new Error('当前环境不支持加密');
    if (!password || password.length < 4) throw new Error('密码至少 4 位');
    const saltB64 = randomB64(16);
    let key;
    if (useNative) {
      key = { password, saltB64 };
    } else {
      key = await deriveKeyWeb(password, b64ToBuf(saltB64));
    }
    const check = await encrypt(VERIFY_TEXT, key);
    Store.saveVaultConfig({ salt: saltB64, check, createdAt: Date.now() });
    sessionKey = key;
    return true;
  }

  async function unlock(password) {
    if (!isSupported()) throw new Error('当前环境不支持加密');
    const cfg = Store.getVaultConfig();
    if (!cfg || !cfg.salt) throw new Error('尚未设置主密码');
    let key;
    if (useNative) {
      key = { password, saltB64: cfg.salt };
    } else {
      key = await deriveKeyWeb(password, b64ToBuf(cfg.salt));
    }
    try {
      const text = await decrypt(cfg.check, key);
      if (text !== VERIFY_TEXT) throw new Error('密码错误');
    } catch (e) {
      throw new Error('密码错误');
    }
    sessionKey = key;
    return true;
  }

  function lock() { sessionKey = null; }
  function isUnlocked() { return !!sessionKey; }

  async function changePassword(oldPassword, newPassword) {
    await unlock(oldPassword);
    if (!newPassword || newPassword.length < 4) throw new Error('新密码至少 4 位');
    const entries = await getEntries();
    const newSalt = randomB64(16);
    let newKey;
    if (useNative) {
      newKey = { password: newPassword, saltB64: newSalt };
    } else {
      newKey = await deriveKeyWeb(newPassword, b64ToBuf(newSalt));
    }
    const check = await encrypt(VERIFY_TEXT, newKey);
    Store.saveVaultConfig({ salt: newSalt, check, createdAt: Date.now() });
    sessionKey = newKey;
    await saveEntries(entries);
    return true;
  }

  async function getEntries() {
    if (!sessionKey) throw new Error('密码本未解锁');
    const raw = Store.getVaultEntries();
    const out = [];
    for (const rec of raw) {
      try {
        const json = await decrypt(rec.data, sessionKey);
        out.push({ id: rec.id, ...JSON.parse(json), updatedAt: rec.updatedAt });
      } catch (e) {
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
