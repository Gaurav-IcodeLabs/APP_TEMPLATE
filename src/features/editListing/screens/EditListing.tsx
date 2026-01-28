import { Listing } from '@appTypes/index';
import { Button } from '@components/index';
import { useConfiguration } from '@context/configurationContext';
import { useAppDispatch, useTypedSelector } from '@redux/store';
import useLazyLoadingTabs from 'hooks/useLazyLoadingTabs';
import React, { useCallback, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { TabChipsContainer } from '../components/TabChipsContainer';
import {
  transformFormToListingData,
  useEditListingWizardRoute,
} from '../editListing.helper';
import {
  createListing,
  selectCreateListingInProgress,
  selectIsNewListingFlow,
} from '../editListing.slice';
import { useEditListingTabs } from '../hooks/useEditListingTabs';
import { EditListingForm } from '../types/editListingForm.type';

// Placeholder component for unloaded tabs
const TabPlaceholder: React.FC = () => (
  <View style={styles.placeholderContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

const EditListing = () => {
  const dispatch = useAppDispatch();
  const config = useConfiguration();
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);

  const { listingId, wizardKey } = useEditListingWizardRoute().params;

  // Determine if this is a new listing flow (new or draft) using selector
  const isNewListing = useTypedSelector(state =>
    selectIsNewListingFlow(state, wizardKey, listingId),
  );

  const existingListingType = useTypedSelector(state =>
    listingId
      ? (state.marketplaceData.entities[listingId] as Listing)?.type
      : undefined,
  );

  const createListingInProgress = useTypedSelector(state =>
    selectCreateListingInProgress(state, wizardKey),
  );

  const formMethods = useForm<EditListingForm>({
    defaultValues: {
      listingType: existingListingType ?? undefined,
      location: {
        origin: [],
        address: '',
      },
      images: [],
      fields: {},
    },
  });

  // Use custom hook for tab logic (only watches specific fields, not entire form)
  const {
    tabs,
    tabStates,
    tabComponents,
    activeTabIndex,
    setActiveTabIndex,
    handleTabPress: handleTabPressFromHook,
  } = useEditListingTabs({
    wizardKey,
    listingId,
  });

  // Use lazy loading hook
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleViewableChange = useCallback(
    (viewableElement: { index: number }) => {
      if (
        viewableElement.index !== null &&
        typeof viewableElement.index === 'number'
      ) {
        setActiveTabIndex(viewableElement.index);
      }
    },
    [setActiveTabIndex], // setActiveTabIndex is stable from useState
  );

  const {
    data: lazyTabsData,
    viewabilityConfigCallbackPairs,
    getItemLayout,
  } = useLazyLoadingTabs({
    tabs: tabComponents,
    extraFnInViewable: handleViewableChange,
  });

  // Handle tab chip press (with FlatList scroll)
  const handleTabPress = useCallback(
    (tab: string, index: number) => {
      handleTabPressFromHook(tab as any, index);
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    },
    [handleTabPressFromHook],
  );

  // Handle FlatList scroll end
  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / width);
      if (
        newIndex !== activeTabIndex &&
        newIndex >= 0 &&
        newIndex < tabs.length
      ) {
        setActiveTabIndex(newIndex);
      }
    },
    [width, activeTabIndex, tabs.length, setActiveTabIndex],
  );

  // Render tab item
  const renderTabItem = useCallback(
    ({ item }: { item: React.ComponentType | 1; index: number }) => {
      // Handle placeholder (value === 1)
      if (item === 1) {
        return <TabPlaceholder />;
      }

      // Render actual tab component
      const TabComponent = item;
      return (
        <View style={{ width }}>
          <TabComponent />
        </View>
      );
    },
    [width],
  );

  const handlePublishListing = async () => {
    const formData = formMethods.getValues();

    if (!formData.listingType || !formData.title) {
      Alert.alert('Error', 'Listing type and title are required');
      return;
    }

    try {
      const listingPayload = transformFormToListingData(formData, config);

      const params = {
        wizardKey,
        ...listingPayload,
      };

      const result = await dispatch(createListing(params)).unwrap();

      Alert.alert('Success', 'Listing created successfully!');
      console.log('Created listing:', result);
    } catch (error: any) {
      console.error('Create listing error', error);

      const apiError = error?.apiErrors?.[0];
      Alert.alert(
        'Error',
        apiError?.title || apiError?.detail || 'Failed to create listing',
      );
    }
  };

  return (
    <FormProvider {...formMethods}>
      <View style={styles.container}>
        <TabChipsContainer
          tabs={tabStates}
          onTabPress={handleTabPress}
          activeTabIndex={activeTabIndex}
        />
        <FlatList
          ref={flatListRef}
          data={lazyTabsData}
          renderItem={renderTabItem}
          keyExtractor={(_, index) => `tab-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={getItemLayout}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          onScrollToIndexFailed={info => {
            // Handle scroll to index failure
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            }, 500);
          }}
        />
        {isNewListing && activeTabIndex === tabs.length - 1 && (
          <View style={styles.publishButtonContainer}>
            <Button
              title="Publish listing"
              onPress={handlePublishListing}
              loader={createListingInProgress}
              disabled={createListingInProgress}
              style={styles.publishButton}
            />
          </View>
        )}
      </View>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  placeholderContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  publishButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  publishButton: {
    marginTop: 0,
    marginBottom: 0,
  },
});

export default EditListing;
