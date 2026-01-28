import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TabChip } from './TabChip';
import { TabType } from '../constants/tabs';
import { colors } from '@constants/colors';

interface TabInfo {
  tab: TabType;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
}

interface TabChipsContainerProps {
  tabs: TabInfo[];
  onTabPress: (tab: TabType, index: number) => void;
  activeTabIndex: number;
}

export const TabChipsContainer: React.FC<TabChipsContainerProps> = ({
  tabs,
  onTabPress,
  activeTabIndex,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to active tab chip if it's off-screen
  useEffect(() => {
    if (scrollViewRef.current && tabs.length > 0) {
      // Simple scroll to end if active tab is near the end
      // In a more sophisticated implementation, you could calculate
      // the exact position of each chip
      if (activeTabIndex >= tabs.length - 2) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      } else if (activeTabIndex <= 1) {
        scrollViewRef.current.scrollTo({ x: 0, animated: true });
      }
    }
  }, [activeTabIndex, tabs.length]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {tabs.map((tabInfo, index) => (
          <TabChip
            key={tabInfo.tab}
            label={tabInfo.label}
            isActive={tabInfo.isActive}
            isCompleted={tabInfo.isCompleted}
            isDisabled={tabInfo.isDisabled}
            onPress={() => onTabPress(tabInfo.tab, index)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white || '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    paddingVertical: 12,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
});
