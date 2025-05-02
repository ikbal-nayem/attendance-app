import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import * as picker from 'expo-image-picker';
import { User2 } from 'lucide-react-native';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const imagePickerOptions: any = {
  mediaTypes: picker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

type ImagePickerProps = {
  photo: string | undefined;
  setPhoto: (photo: string | undefined) => void;
};

export const ImagePicker = ({ photo, setPhoto }: ImagePickerProps) => {
  const pickImage = async (): Promise<string | undefined> => {
    const result = await new Promise<string | undefined>((resolve) => {
      Alert.alert(
        'Select Photo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const uri = await takePhoto();
              resolve(uri);
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const uri = await chooseFromGallery();
              resolve(uri);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(undefined),
          },
        ],
        { cancelable: true }
      );
    });
    return result;
  };

  const takePhoto = async (): Promise<string | undefined> => {
    try {
      const { status } = await picker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to take photos'
        );
        return undefined;
      }

      const result = await picker.launchCameraAsync(imagePickerOptions);

      return result.canceled ? undefined : result.assets[0].uri;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      return undefined;
    }
  };

  const chooseFromGallery = async (): Promise<string | undefined> => {
    try {
      const { status } = await picker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Media library permission is required to select photos'
        );
        return undefined;
      }

      const result = await picker.launchImageLibraryAsync(imagePickerOptions);

      return result.canceled ? undefined : result.assets[0].uri;
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
      return undefined;
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(200)}
      style={styles.photoContainer}
    >
      <TouchableOpacity
        style={styles.photoButton}
        onPress={() =>
          pickImage().then((uri) => {
            if (uri) setPhoto(uri);
          })
        }
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <User2 size={24} color={Colors.light.primary} />
            <Text style={styles.photoPlaceholderText}>Photo</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  photoContainer: {
    alignSelf: 'center',
    marginBottom: Layout.spacing.m,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: 60,
    backgroundColor: Colors.light.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.primary,
    marginLeft: Layout.spacing.s,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
