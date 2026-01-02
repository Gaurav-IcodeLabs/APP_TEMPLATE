import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface RadioListOption {
  label: string;
  value: string;
}

export interface RadioListProps {
  /**
   * Array of options to display
   */
  options: RadioListOption[];
  
  /**
   * Currently selected value
   */
  value?: string;
  
  /**
   * Callback when an option is selected
   */
  onChange?: (value: string) => void;
  
  /**
   * Optional label to display above the radio list
   */
  label?: string;
  
  /**
   * Whether to show the radio list or not
   * @default true
   */
  visible?: boolean;
  
  /**
   * Custom styles for the container
   */
  containerStyle?: any;
  
  /**
   * Custom styles for individual option items
   */
  optionStyle?: any;
  
  /**
   * Whether the field is disabled
   * @default false
   */
  disabled?: boolean;
}

export const RadioList: React.FC<RadioListProps> = ({
  options,
  value,
  onChange,
  label,
  visible = true,
  containerStyle,
  optionStyle,
  disabled = false,
}) => {
  if (!visible || options.length === 0) {
    return <View style={styles.hidden} />;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              value === option.value && styles.optionItemSelected,
              optionStyle,
            ]}
            onPress={() => {
              if (!disabled) {
                onChange?.(option.value);
              }
            }}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
          >
            <View
              style={[
                styles.radio,
                value === option.value && styles.radioSelected,
                disabled && styles.radioDisabled,
              ]}
            >
              {value === option.value && (
                <View style={[styles.radioDot, disabled && styles.radioDotDisabled]} />
              )}
            </View>
            <Text
              style={[
                styles.optionLabel,
                value === option.value && styles.optionLabelSelected,
                disabled && styles.optionLabelDisabled,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333',
  },
  optionsContainer: {
    // Container for all options
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  optionItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#007AFF',
  },
  radioDisabled: {
    borderColor: '#ccc',
    opacity: 0.5,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  radioDotDisabled: {
    backgroundColor: '#ccc',
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionLabelSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  optionLabelDisabled: {
    color: '#999',
  },
  hidden: {
    display: 'none',
  },
});

