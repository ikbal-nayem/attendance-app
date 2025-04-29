import AsyncStorage from '@react-native-async-storage/async-storage';

export const localData = {
  set: async (key: string, value: string | IObject | Array<IObject>) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error storing data', error);
    }
  },
  get: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error retrieving data', error);
      return null;
    }
  },
  remove: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data', error);
    }
  },
  clear: async () => {
    try {
      await AsyncStorage.clear();
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing data', error);
    }
  },
};
