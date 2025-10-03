import { useCallback, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface UseInfiniteScrollOptions<T> {
  data: T[];
  onLoadMore: () => Promise<void>;
  hasNextPage: boolean;
  isLoading: boolean;
  threshold?: number;
}

interface UseInfiniteScrollReturn {
  onEndReached: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  isNearEnd: boolean;
}

export function useInfiniteScroll<T>({
  data,
  onLoadMore,
  hasNextPage,
  isLoading,
  threshold = 0.1,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn {
  const [isNearEnd, setIsNearEnd] = useState(false);
  const isLoadingRef = useRef(false);
  const hasTriggeredRef = useRef(false);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasNextPage || isLoading) {
      return;
    }

    isLoadingRef.current = true;
    hasTriggeredRef.current = true;

    try {
      await onLoadMore();
    } finally {
      isLoadingRef.current = false;
    }
  }, [onLoadMore, hasNextPage, isLoading]);

  const onEndReached = useCallback(() => {
    if (!hasTriggeredRef.current) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const paddingToBottom = 20;
    
    const isCloseToBottom = 
      layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    setIsNearEnd(isCloseToBottom);

    if (isCloseToBottom && hasNextPage && !isLoading && !isLoadingRef.current) {
      handleLoadMore();
    }
  }, [hasNextPage, isLoading, handleLoadMore]);

  return {
    onEndReached,
    onScroll,
    isNearEnd,
  };
}

// Hook specifically for FlatList infinite scroll
export function useFlatListInfiniteScroll<T>({
  data,
  onLoadMore,
  hasNextPage,
  isLoading,
  threshold = 0.1,
}: UseInfiniteScrollOptions<T>) {
  const infiniteScroll = useInfiniteScroll({
    data,
    onLoadMore,
    hasNextPage,
    isLoading,
    threshold,
  });

  const flatListProps = {
    data,
    onEndReached: infiniteScroll.onEndReached,
    onScroll: infiniteScroll.onScroll,
    scrollEventThrottle: 16,
    onEndReachedThreshold: threshold,
    ListFooterComponent: hasNextPage && isLoading ? () => null : undefined, // You can customize this
  };

  return {
    ...infiniteScroll,
    flatListProps,
  };
}
