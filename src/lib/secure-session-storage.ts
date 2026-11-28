import AsyncStorage from '@react-native-async-storage/async-storage';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-get-random-values';

class SecureSessionStorage {
  async getItem(key: string): Promise<string | null> {
    const storedValue = await AsyncStorage.getItem(key);
    if (storedValue === null || Platform.OS === 'web') {
      return storedValue;
    }

    const encryptionKey = await SecureStore.getItemAsync(key);
    if (encryptionKey === null) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    try {
      const cipher = new aesjs.ModeOfOperation.ctr(
        aesjs.utils.hex.toBytes(encryptionKey),
        new aesjs.Counter(1),
      );

      return aesjs.utils.utf8.fromBytes(
        cipher.decrypt(aesjs.utils.hex.toBytes(storedValue)),
      );
    } catch {
      await this.removeItem(key);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }

    const encryptionKey = crypto.getRandomValues(new Uint8Array(32));
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedValue = aesjs.utils.hex.fromBytes(
      cipher.encrypt(aesjs.utils.utf8.toBytes(value)),
    );

    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    await AsyncStorage.setItem(key, encryptedValue);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(key);
    }
  }
}

export const authStorage = new SecureSessionStorage();
