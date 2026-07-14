import { useCallback, useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { InfoCard } from './InfoCard';

type SettingControlProps = {
  sectionTitle: string;
  title: string;
  value: number;
  unit: string;
  help: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

export function SettingControl({
  sectionTitle,
  title,
  value,
  unit,
  help,
  min,
  max,
  step,
  onChange,
}: SettingControlProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [draftValue, setDraftValue] = useState<number | null>(null);
  const sliderRef = useRef<View>(null);
  const pendingValueRef = useRef(value);
  const sliderPageXRef = useRef(0);
  const displayValue = draftValue ?? value;
  const ratio = (displayValue - min) / (max - min);
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  useEffect(() => {
    pendingValueRef.current = value;
  }, [value]);

  const snapValue = useCallback((rawValue: number) => {
    const snapped = min + Math.round((rawValue - min) / step) * step;
    return Math.max(min, Math.min(max, snapped));
  }, [max, min, step]);

  const updateDraftFromPageX = useCallback((pageX: number, measuredWidth = trackWidth, measuredPageX = sliderPageXRef.current) => {
    if (measuredWidth <= 0) {
      return;
    }

    const x = pageX - measuredPageX;
    const nextRatio = Math.max(0, Math.min(1, x / measuredWidth));
    const nextValue = snapValue(min + nextRatio * (max - min));
    pendingValueRef.current = nextValue;
    setDraftValue(nextValue);
  }, [max, min, snapValue, trackWidth]);

  const measureAndUpdateDraft = useCallback((pageX: number) => {
    sliderRef.current?.measure((_x, _y, width, _height, measuredPageX) => {
      if (width > 0) {
        setTrackWidth(width);
        sliderPageXRef.current = measuredPageX;
        updateDraftFromPageX(pageX, width, measuredPageX);
      }
    });
  }, [updateDraftFromPageX]);

  const commitDraft = useCallback(() => {
    const nextValue = pendingValueRef.current;
    setDraftValue(null);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  }, [onChange, value]);

  const handleResponderGrant = useCallback((event: GestureResponderEvent) => {
    measureAndUpdateDraft(event.nativeEvent.pageX);
  }, [measureAndUpdateDraft]);

  const handleResponderMove = useCallback((event: GestureResponderEvent) => {
    updateDraftFromPageX(event.nativeEvent.pageX);
  }, [updateDraftFromPageX]);

  const handleSliderLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <InfoCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>
            {displayValue}
            {unit}
          </Text>
        </View>
        <View
          ref={sliderRef}
          style={styles.slider}
          onLayout={handleSliderLayout}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleResponderGrant}
          onResponderMove={handleResponderMove}
          onResponderRelease={commitDraft}
          onResponderTerminate={commitDraft}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${clampedRatio * 100}%` }]} />
          </View>
          <View style={[styles.thumb, { left: `${clampedRatio * 100}%` }]} />
        </View>
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>
            {min}
            {unit}
          </Text>
          <Text style={styles.rangeLabel}>
            {max}
            {unit}
          </Text>
        </View>
        <Text style={styles.help}>{help}</Text>
      </InfoCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  card: {
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  slider: {
    height: 34,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2eaf5',
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: 'absolute',
    top: 4,
    width: 26,
    height: 26,
    marginLeft: -13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#d8e4f4',
    backgroundColor: '#ffffff',
    shadowColor: '#214c8a',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '800',
  },
  help: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
});
