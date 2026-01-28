import { useMemo, useState, useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTypedSelector } from '@redux/store';
import { useConfiguration } from '@context/configurationContext';
import { displayPrice } from '@util/configHelpers';
import { INQUIRY_PROCESS_NAME } from '@transactions/transaction';
import {
  tabsForListingType,
  tabCompleted,
  tabsActive,
  tabLabelAndSubmit,
} from '../editListingTabs.helper';
import {
  TabType,
  DETAILS,
  PRICING,
  PRICING_AND_STOCK,
  DELIVERY,
  LOCATION,
  AVAILABILITY,
  PHOTOS,
  STYLE,
} from '../constants/tabs';
import { EditListingForm } from '../types/editListingForm.type';
import { selectIsNewListingFlow } from '../editListing.slice';
import { EditListingDetailsTab } from '../components/tabs/EditListingDetailsTab';
import React from 'react';

export interface TabInfo {
  tab: TabType;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
}

interface UseEditListingTabsParams {
  wizardKey: string;
  listingId: string | undefined;
}

interface UseEditListingTabsReturn {
  tabs: TabType[];
  tabStates: TabInfo[];
  tabComponents: React.ComponentType[];
  activeTabIndex: number;
  setActiveTabIndex: (index: number) => void;
  handleTabPress: (tab: TabType, index: number) => void;
}

/**
 * Custom hook to manage edit listing tabs logic.
 * Only watches specific form fields needed for tab determination to avoid unnecessary rerenders.
 */
export const useEditListingTabs = ({
  wizardKey,
  listingId,
}: UseEditListingTabsParams): UseEditListingTabsReturn => {
  const config = useConfiguration();
  const { control, getValues } = useFormContext<EditListingForm>();

  // Only watch specific fields needed for tab logic (not entire formData)
  const listingType = useWatch<EditListingForm>({
    control,
    name: 'listingType',
  });

  // Watch only the fields needed for tab completion checks
  const title = useWatch<EditListingForm>({ control, name: 'title' });
  const description = useWatch<EditListingForm>({ control, name: 'description' });
  const location = useWatch<EditListingForm>({ control, name: 'location' });
  const price = useWatch<EditListingForm>({ control, name: 'price' });
  const images = useWatch<EditListingForm>({ control, name: 'images' });
  const availabilityPlan = useWatch<EditListingForm>({ control, name: 'availabilityPlan' });
  const deliveryOptions = useWatch<EditListingForm>({ control, name: 'deliveryOptions' });
  const fields = useWatch<EditListingForm>({ control, name: 'fields' });

  // Get isNewListing from selector
  const isNewListing = useTypedSelector(state =>
    selectIsNewListingFlow(state, wizardKey, listingId),
  );

  // Determine which tabs to show based on listing type and process
  const tabs = useMemo(() => {
    if (!listingType || !config) {
      return [DETAILS]; // Show only details tab initially
    }

    const listingTypeConfig = config.listing?.listingTypes?.find(
      type => type.listingType === listingType,
    );

    if (!listingTypeConfig) {
      return [DETAILS];
    }

    // Get process name from transaction type
    const processName =
      listingTypeConfig.transactionType?.process || INQUIRY_PROCESS_NAME;

    return tabsForListingType(processName, listingTypeConfig);
  }, [listingType, config]);

  // Get listing type config for tab label logic
  const listingTypeConfig = useMemo(() => {
    if (!listingType || !config) return undefined;
    return config.listing?.listingTypes?.find(
      type => type.listingType === listingType,
    );
  }, [listingType, config]);

  const isPriceDisabled = !displayPrice(listingTypeConfig);
  const processName =
    listingTypeConfig?.transactionType?.process || INQUIRY_PROCESS_NAME;

  // Create tab components array (for now, only DETAILS tab is implemented)
  const tabComponents = useMemo(() => {
    const components: Record<TabType, React.ComponentType | null> = {
      [DETAILS]: EditListingDetailsTab,
      // TODO: Add other tab components as they are created
      [PRICING]: null,
      [PRICING_AND_STOCK]: null,
      [DELIVERY]: null,
      [LOCATION]: null,
      [AVAILABILITY]: null,
      [PHOTOS]: null,
      [STYLE]: null,
    };

    return tabs.map(tab => components[tab]).filter(Boolean) as React.ComponentType[];
  }, [tabs]);

  // Track active tab index
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Build minimal form data object only with watched fields for tab completion checks
  // This avoids watching the entire form which would cause rerenders on every field change
  const minimalFormData = useMemo((): EditListingForm => {
    // Get current form values but only use the watched fields
    const currentValues = getValues();
    return {
      ...currentValues,
      listingType,
      title,
      description,
      location,
      price,
      images,
      availabilityPlan,
      deliveryOptions,
      fields,
    } as EditListingForm;
  }, [getValues, listingType, title, description, location, price, images, availabilityPlan, deliveryOptions, fields]);

  // Calculate tab states (active, completed, disabled)
  const tabStates = useMemo(() => {
    const activeStates = tabsActive(isNewListing, minimalFormData, tabs, config);
    const completedStates = tabs.reduce(
      (acc, tab) => ({
        ...acc,
        [tab]: tabCompleted(tab, minimalFormData, config),
      }),
      {} as Record<TabType, boolean>,
    );

    return tabs.map((tab, index) => {
      const labelAndSubmit = tabLabelAndSubmit(
        tab,
        isNewListing,
        isPriceDisabled,
        processName,
      );
      return {
        tab,
        label: labelAndSubmit.label,
        isActive: activeStates[tab] ?? false,
        isCompleted: completedStates[tab] ?? false,
        isDisabled: !(activeStates[tab] ?? false),
      };
    });
  }, [tabs, minimalFormData, isNewListing, config, isPriceDisabled, processName]);

  // Handle tab chip press
  const handleTabPress = useCallback(
    (tab: TabType, index: number) => {
      const tabState = tabStates[index];
      if (tabState.isDisabled) {
        return; // Don't navigate to disabled tabs
      }

      setActiveTabIndex(index);
    },
    [tabStates],
  );

  return {
    tabs,
    tabStates,
    tabComponents,
    activeTabIndex,
    setActiveTabIndex,
    handleTabPress,
  };
};
