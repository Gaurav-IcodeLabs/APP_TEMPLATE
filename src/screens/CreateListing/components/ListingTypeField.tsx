import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonText } from '@components/index';
import { colors } from '@constants/colors';
import { ListingTypeConfigItem } from '@appTypes/config';

type Props = {
  listingTypes: ListingTypeConfigItem[];
  onListingTypeChange?: (listingType: string) => void;
  value?: string;
};

export const ListingTypeField: React.FC<Props> = ({
  listingTypes,
  onListingTypeChange,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <CommonText style={styles.label}>
        {t('CreateListing.selectTypeLabel')}
      </CommonText>
      <View style={styles.listingTypeContainer}>
        {listingTypes.map(type => (
          <TouchableOpacity
            key={type.listingType}
            style={[
              styles.listingTypeOption,
              value === type.listingType && styles.listingTypeOptionSelected,
            ]}
            onPress={() => {
              onListingTypeChange?.(type.listingType);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.radio,
                value === type.listingType && styles.radioSelected,
              ]}
            >
              {value === type.listingType && <View style={styles.radioDot} />}
            </View>
            <View style={styles.textContainer}>
              <CommonText
                style={[
                  styles.listingTypeLabel,
                  value === type.listingType && styles.listingTypeLabelSelected,
                ]}
              >
                {type.label}
              </CommonText>
              <CommonText
                style={[
                  styles.listingTypeDescription,
                  value === type.listingType && styles.listingTypeDescriptionSelected,
                ]}
              >
                {t(`CreateListing.${type.listingType}.description`)}
              </CommonText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.black,
  },
  listingTypeContainer: {
    marginBottom: 16,
  },
  listingTypeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  listingTypeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.lightGray,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  listingTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 4,
  },
  listingTypeLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  listingTypeDescription: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 18,
  },
  listingTypeDescriptionSelected: {
    color: colors.primary,
  },
});