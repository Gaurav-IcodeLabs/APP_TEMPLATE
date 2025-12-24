import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { colors } from '@constants/colors';
import { CommonText } from '../CommonText/CommonText';

interface DropdownItem {
  label: string;
  value: string;
  [key: string]: any;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  data: DropdownItem[];
  labelField: string;
  valueField: string;
  value?: string;
  onChange: (item: DropdownItem) => void;
  error?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select an option',
  data,
  labelField,
  valueField,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectedItem = data.find(item => item[valueField] === value);
  const displayText = selectedItem ? selectedItem[labelField] : placeholder;

  const handleSelect = (item: DropdownItem) => {
    onChange(item);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <CommonText style={styles.label}>{label}</CommonText>
      )}
      
      <TouchableOpacity
        style={[
          styles.dropdown,
          error && styles.dropdownError,
          disabled && styles.dropdownDisabled,
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        <CommonText
          style={[
            styles.dropdownText,
            !selectedItem && styles.placeholderText,
          ]}
        >
          {displayText}
        </CommonText>
        <CommonText style={styles.arrow}>▼</CommonText>
      </TouchableOpacity>

      {error && (
        <CommonText style={styles.errorText}>{error}</CommonText>
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={data}
              keyExtractor={(item, index) => `${item[valueField]}_${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item[valueField] === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <CommonText
                    style={[
                      styles.optionText,
                      item[valueField] === value && styles.selectedOptionText,
                    ]}
                  >
                    {item[labelField]}
                  </CommonText>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  dropdownError: {
    borderColor: colors.red,
  },
  dropdownDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  placeholderText: {
    color: colors.gray,
  },
  arrow: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 8,
    maxHeight: 300,
    width: '80%',
    maxWidth: 400,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.black,
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: '600',
  },
});