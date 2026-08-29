import { GeneratedAudioItem, AudioSettings } from '../types';

const DB_NAME = 'BanglaAudioDB';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Audio history store
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('createdAt', 'createdAt', { unique: false });
        historyStore.createIndex('voiceId', 'voiceId', { unique: false });
      }

      // Favorites store
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'voiceId' });
      }

      // Recent voices store
      if (!db.objectStoreNames.contains('recent_voices')) {
        db.createObjectStore('recent_voices', { keyPath: 'voiceId' });
      }

      // User settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ----------------- History Operations -----------------
export async function saveAudioToHistory(item: GeneratedAudioItem): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    await new Promise<void>((resolve, reject) => {
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save to history:', err);
  }
}

export async function getAllHistory(): Promise<GeneratedAudioItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('history', 'readonly');
    const store = tx.objectStore('history');
    const index = store.index('createdAt');

    return new Promise<GeneratedAudioItem[]>((resolve, reject) => {
      const req = index.openCursor(null, 'prev'); // newest first
      const items: GeneratedAudioItem[] = [];

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get history:', err);
    return [];
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
}

export async function clearAllHistory(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('history', 'readwrite');
    const store = tx.objectStore('history');
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

// ----------------- Favorites Operations -----------------
export async function getFavoriteVoiceIds(): Promise<string[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('favorites', 'readonly');
    const store = tx.objectStore('favorites');

    return new Promise<string[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        resolve(list.map((item: any) => item.voiceId));
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const local = localStorage.getItem('bangla_tts_favorites');
    return local ? JSON.parse(local) : ['M01', 'M06', 'F01', 'F08'];
  }
}

export async function toggleFavoriteVoice(voiceId: string): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction('favorites', 'readwrite');
    const store = tx.objectStore('favorites');

    const isFav = await new Promise<boolean>((resolve, reject) => {
      const getReq = store.get(voiceId);
      getReq.onsuccess = () => resolve(!!getReq.result);
      getReq.onerror = () => reject(getReq.error);
    });

    if (isFav) {
      await new Promise<void>((resolve, reject) => {
        const delReq = store.delete(voiceId);
        delReq.onsuccess = () => resolve();
        delReq.onerror = () => reject(delReq.error);
      });
      return false;
    } else {
      await new Promise<void>((resolve, reject) => {
        const putReq = store.put({ voiceId, addedAt: Date.now() });
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      });
      return true;
    }
  } catch (err) {
    const local = localStorage.getItem('bangla_tts_favorites');
    let arr: string[] = local ? JSON.parse(local) : ['M01', 'M06', 'F01', 'F08'];
    let state = false;
    if (arr.includes(voiceId)) {
      arr = arr.filter((id) => id !== voiceId);
      state = false;
    } else {
      arr.push(voiceId);
      state = true;
    }
    localStorage.setItem('bangla_tts_favorites', JSON.stringify(arr));
    return state;
  }
}

// ----------------- Recent Voices Operations -----------------
export async function getRecentVoiceIds(): Promise<string[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('recent_voices', 'readonly');
    const store = tx.objectStore('recent_voices');

    return new Promise<string[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        list.sort((a: any, b: any) => b.timestamp - a.timestamp);
        resolve(list.slice(0, 12).map((item: any) => item.voiceId));
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const local = localStorage.getItem('bangla_tts_recents');
    return local ? JSON.parse(local) : ['M01', 'F01'];
  }
}

export async function addRecentVoice(voiceId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('recent_voices', 'readwrite');
    const store = tx.objectStore('recent_voices');
    await new Promise<void>((resolve, reject) => {
      const req = store.put({ voiceId, timestamp: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const local = localStorage.getItem('bangla_tts_recents');
    let arr: string[] = local ? JSON.parse(local) : [];
    arr = [voiceId, ...arr.filter((id) => id !== voiceId)].slice(0, 12);
    localStorage.setItem('bangla_tts_recents', JSON.stringify(arr));
  }
}

// ----------------- Saved Settings -----------------
export function getSavedSettings(): AudioSettings {
  const defaults: AudioSettings = {
    speed: 1.0,
    pitch: 0,
    volume: 100,
    format: 'mp3',
    quality: 'high',
  };
  try {
    const stored = localStorage.getItem('bangla_tts_settings');
    if (stored) {
      return { ...defaults, ...JSON.parse(stored) };
    }
  } catch (e) {
    // fallback
  }
  return defaults;
}

export function saveSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem('bangla_tts_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not save settings to localStorage:', e);
  }
}
