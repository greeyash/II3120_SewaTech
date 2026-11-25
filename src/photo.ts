import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

/** Ambil foto dari kamera (di HP) atau galeri. Mengembalikan URI atau null bila dibatalkan. */
export async function pickPhoto(source: 'camera' | 'library' = 'library'): Promise<string | null> {
  try {
    if (source === 'camera' && Platform.OS !== 'web') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.granted) {
        const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
        return r.canceled ? null : r.assets[0].uri;
      }
    }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    return r.canceled ? null : r.assets[0].uri;
  } catch {
    return null;
  }
}
