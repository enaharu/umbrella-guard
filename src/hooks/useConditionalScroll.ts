import { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';

type ConditionalScrollOptions = {
  contentBottomPadding: number;
  coveredBottomHeight: number;
};

export function useConditionalScroll({ contentBottomPadding, coveredBottomHeight }: ConditionalScrollOptions) {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const scrollEnabled = useMemo(() => {
    const visibleContentHeight = Math.max(0, contentHeight - contentBottomPadding);
    const visibleViewportHeight = Math.max(0, viewportHeight - coveredBottomHeight);
    return visibleContentHeight > visibleViewportHeight + 1;
  }, [contentBottomPadding, contentHeight, coveredBottomHeight, viewportHeight]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  }, []);

  const onContentSizeChange = useCallback((_width: number, height: number) => {
    setContentHeight(height);
  }, []);

  return {
    scrollEnabled,
    showsVerticalScrollIndicator: scrollEnabled,
    onLayout,
    onContentSizeChange,
  };
}
