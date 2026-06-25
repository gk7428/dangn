import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

export function AnimatedSplashOverlay() {
  const opacity = useRef(new Animated.Value(1)).current;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }, []);

  if (!visible) return null;

  return <Animated.View style={[styles.overlay, { opacity }]} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#208AEF',
    zIndex: 1000,
  },
});
