export type StorageAPI = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

let storage: StorageAPI;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = {
    getItem: (k) => AsyncStorage.getItem(k),
    setItem: (k, v) => AsyncStorage.setItem(k, v),
    removeItem: (k) => AsyncStorage.removeItem(k),
  } as StorageAPI;
} catch {
  const mem = new Map<string, string>();
  storage = {
    getItem: async (k) => (mem.has(k) ? mem.get(k)! : null),
    setItem: async (k, v) => {
      mem.set(k, v);
    },
    removeItem: async (k) => {
      mem.delete(k);
    },
  } as StorageAPI;
}

export const getItem = storage.getItem;
export const setItem = storage.setItem;
export const removeItem = storage.removeItem;
