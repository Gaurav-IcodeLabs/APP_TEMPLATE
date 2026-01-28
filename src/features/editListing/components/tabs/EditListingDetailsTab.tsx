import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
// import { useFormContext } from 'react-hook-form';
// import { EditListingForm } from '../../types/editListingForm.type';
import SelectListingType from '../SelectListingType';
import SelectListingCategory from '../SelectListingCategory';
import EditListingTitle from '../EditListingTitle';
import EditListingDescription from '../EditListingDescription';
import EditListingCustomFields from '../EditListingCustomFields';

/**
 * EditListingDetailsTab Component
 *
 * Combines all details-related components:
 * - SelectListingType
 * - SelectListingCategory
 * - EditListingTitle
 * - EditListingDescription
 * - EditListingCustomFields
 */
export const EditListingDetailsTab: React.FC = () => {
  // const { control } = useFormContext<EditListingForm>();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SelectListingType />
        <SelectListingCategory />
        <EditListingTitle />
        <EditListingDescription />
        <EditListingCustomFields />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
});
