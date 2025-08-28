import { useFrame, useThree } from '@react-three/fiber/native';
import React from 'react';
import Animated from 'react-native-reanimated';

interface MobileMapControlsProps {
  panX: Animated.SharedValue<number>;
  panY: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  rotationX: Animated.SharedValue<number>;
  rotationY: Animated.SharedValue<number>;
}
export const MobileMapControls: React.FC<MobileMapControlsProps> = ({
  panX,
  panY,
  scale,
  rotationX,
  rotationY
}) => {
  const { camera } = useThree();
  const PAN_SPEED = 0.05;

  useFrame(() => {
    camera.position.x += panX.value * PAN_SPEED;
    camera.position.y += panY.value * PAN_SPEED;
    panX.value = 0;
    panY.value = 0;
    
    
    /*camera.position.z += (scale.value - 1) * 20;
    scale.value = 1;

    if (Math.abs(rotationX.value) > Math.abs(rotationY.value)) {
      rotationY.value -= rotationX.value * 1;
    } else {
      rotationX.value-= rotationY.value * 1;
    }
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));*/

    camera.updateMatrixWorld();
  });

  return null;
};
