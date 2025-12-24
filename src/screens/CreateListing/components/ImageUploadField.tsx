import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonText } from '@components/index';
import { colors } from '@constants/colors';

interface ImageUploadFieldProps {
  label: string;
  value: string[];
  onChange: (images: string[]) => void;
  error?: string;
  maxImages?: number;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value = [],
  onChange,
  error,
  maxImages = 10,
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState<boolean>(false);

  const handleImagePicker = () => {
    if (value.length >= maxImages) {
      Alert.alert(
        t('ImageUpload.maxImagesTitle'),
        t('ImageUpload.maxImagesMessage', { max: maxImages })
      );
      return;
    }

    // For now, simulate image selection with placeholder images
    Alert.alert(
      t('ImageUpload.selectImageTitle'),
      t('ImageUpload.selectImageMessage'),
      [
        {
          text: t('ImageUpload.cancel'),
          style: 'cancel',
        },
        {
          text: t('ImageUpload.addSample'),
          onPress: () => {
            setUploading(true);
            // Simulate upload delay
            setTimeout(() => {
              const sampleImage = `https://picsum.photos/200/200?random=${Date.now()}`;
              onChange([...value, sampleImage]);
              setUploading(false);
            }, 1000);
          },
        },
      ]
    );
  };

  const handleRemoveImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const renderImageItem = (uri: string, index: number) => (
    <View key={index} style={styles.imageContainer}>
      <Image source={{ uri }} style={styles.image} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveImage(index)}
      >
        <CommonText style={styles.removeButtonText}>×</CommonText>
      </TouchableOpacity>
    </View>
  );

  const renderAddButton = () => (
    <TouchableOpacity
      style={styles.addButton}
      onPress={handleImagePicker}
      disabled={uploading || value.length >= maxImages}
    >
      {uploading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <CommonText style={styles.addButtonIcon}>+</CommonText>
          <CommonText style={styles.addButtonText}>
            {t('ImageUpload.addPhoto')}
          </CommonText>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CommonText style={styles.label}>{label}</CommonText>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {value.map((uri, index) => renderImageItem(uri, index))}
        {value.length < maxImages && renderAddButton()}
      </ScrollView>

      <View style={styles.infoContainer}>
        <CommonText style={styles.infoText}>
          {t('ImageUpload.imageCount', { current: value.length, max: maxImages })}
        </CommonText>
        {value.length === 0 && (
          <CommonText style={styles.hintText}>
            {t('ImageUpload.hint')}
          </CommonText>
        )}
      </View>

      {error && (
        <CommonText style={styles.errorText}>{error}</CommonText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  scrollContainer: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  addButtonIcon: {
    fontSize: 24,
    color: colors.gray,
    marginBottom: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  hintText: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
  },
});

export default ImageUploadField;