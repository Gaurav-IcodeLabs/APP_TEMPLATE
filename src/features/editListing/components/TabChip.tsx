import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CommonText } from '@components/CommonText/CommonText';
import { colors } from '@constants/colors';

interface TabChipProps {
  label: string;
  isActive: boolean;
  isCompleted?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
}

export const TabChip: React.FC<TabChipProps> = ({
  label,
  isActive,
  isCompleted = false,
  isDisabled = false,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.container,
        isActive && styles.activeContainer,
        isDisabled && styles.disabledContainer,
      ]}
    >
      <View style={styles.content}>
        {isCompleted && !isActive && (
          <View style={styles.checkmarkContainer}>
            <CommonText style={styles.checkmark}>✓</CommonText>
          </View>
        )}
        <CommonText
          style={[
            styles.label,
            isActive && styles.activeLabel,
            isDisabled && styles.disabledLabel,
          ]}
        >
          {label}
        </CommonText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGrey || '#f0f0f0',
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
    opacity: 1,
  },
  activeContainer: {
    backgroundColor: colors.marketplaceColor || '#007AFF',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkmarkContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success || '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: colors.grey || '#666',
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.white,
    fontWeight: '600',
  },
  disabledLabel: {
    color: colors.grey || '#999',
  },
});
