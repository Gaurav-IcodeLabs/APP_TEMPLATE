import {RefObject, useEffect, useRef, useState} from 'react';
import {useWindowDimensions, ViewToken} from 'react-native';

const getItemLayout = (data: any, index: number, width: number) => ({
  length: width,
  offset: width * index,
  index,
});

const useLazyLoadingTabs = <ItemType>({
  tabs,
  extraFnInViewable = () => {},
}: {
  tabs: Array<ItemType>;
  extraFnInViewable?: (viewableElement: ViewToken & {index: number}) => void;
}): {
  data: Array<ItemType | 1>;
  viewabilityConfigCallbackPairs: RefObject<any>;
  getItemLayout: (
    d: any,
    i: number,
  ) => {
    length: number;
    offset: number;
    index: number;
  };
} => {
  const { width } = useWindowDimensions();
  const [data, setData] = useState([
    tabs[0],
    ...Array(tabs.slice(1).length).fill(1),
  ]);

  const onViewableItemsChanged = useRef(
    (props: {changed: ViewToken[]; viewableItems: ViewToken[]}) => {
      const {changed} = props;
      changed.forEach(element => {
        if (
          element.isViewable &&
          element.index !== null &&
          typeof element.index === 'number'
        ) {
          // console.log('element.index', element.index)
          extraFnInViewable(element as ViewToken & {index: number});
        }
        setData(oldData => {
          if (
            element.isViewable &&
            element.index !== null &&
            oldData[element.index] === 1
          ) {
            if (oldData[element.index] === 1) {
              oldData[element.index] = tabs[element.index];
              return [...oldData];
            }
          }
          return oldData;
        });
      });
    },
  );

  const viewabilityConfigCallbackPairs = useRef([
    {
      onViewableItemsChanged: onViewableItemsChanged.current,
      viewabilityConfig: {
        minimumViewTime: 100, // this is important otherwise scrolling directly to 3rd index will invoke the 2nd index viewable
        itemVisiblePercentThreshold: 90,
      },
    },
  ]);

  useEffect(() => {
    if (data.length !== tabs.length) {
      setData([tabs[0], ...Array(tabs.slice(1).length).fill(1)]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]);

  return {
    data,
    viewabilityConfigCallbackPairs,
    getItemLayout: (data: any, index: number) => getItemLayout(data, index, width),
  };
};

export default useLazyLoadingTabs;
