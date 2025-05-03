import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import * as picker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const imagePickerOptions: picker.ImagePickerOptions = {
  mediaTypes: picker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

type ImagePickerProps = {
  photoUri: string | undefined | null;
  setPhotoUri: (uri: string | undefined) => void;
  source?: 'camera' | 'gallery' | 'both';
  previewContainerStyle?: StyleProp<ViewStyle>;
  placeholder?: React.ReactNode;
};

const SingleImagePicker = ({
  photoUri,
  setPhotoUri,
  source = 'both',
  previewContainerStyle,
  placeholder,
}: ImagePickerProps) => {
  const handlePickImage = async () => {
    let resultAsset: picker.ImagePickerAsset | undefined;

    if (source === 'camera') {
      resultAsset = await takePhoto();
    } else if (source === 'gallery') {
      resultAsset = await chooseFromGallery();
    } else {
      resultAsset = await showSourceSelection();
    }

    if (resultAsset?.uri) {
      setPhotoUri(resultAsset.uri);
    }
  };

  const showSourceSelection = async (): Promise<picker.ImagePickerAsset | undefined> => {
    return new Promise<picker.ImagePickerAsset | undefined>((resolve) => {
      Alert.alert(
        'Select Photo',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: async () => resolve(await takePhoto()) },
          {
            text: 'Choose from Gallery',
            onPress: async () => resolve(await chooseFromGallery()),
          },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(undefined) },
        ],
        { cancelable: true }
      );
    });
  };

  const takePhoto = async (): Promise<picker.ImagePickerAsset | undefined> => {
    try {
      const { status } = await picker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required.');
        return undefined;
      }
      const result = await picker.launchCameraAsync(imagePickerOptions);
      return result.canceled ? undefined : result.assets?.[0];
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
      return undefined;
    }
  };

  const chooseFromGallery = async (): Promise<picker.ImagePickerAsset | undefined> => {
    try {
      const { status } = await picker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permission is required.');
        return undefined;
      }
      const result = await picker.launchImageLibraryAsync(imagePickerOptions);
      return result.canceled ? undefined : result.assets?.[0];
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo.');
      return undefined;
    }
  };

  const defaultPlaceholder = (
    <View style={styles.photoPlaceholder}>
      <Camera size={24} color={Colors.light.primary} />
      <Text style={styles.photoPlaceholderText}>Photo</Text>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(200)}
      style={styles.container}
    >
      <TouchableOpacity
        style={[styles.photoButton, previewContainerStyle]}
        onPress={handlePickImage}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          placeholder ?? defaultPlaceholder
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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

export default SingleImagePicker;
