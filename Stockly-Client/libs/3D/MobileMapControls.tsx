import { useFrame, useThree } from '@react-three/fiber/native';
import React, { useRef } from 'react';
import Animated from 'react-native-reanimated';
import { MathUtils } from 'three';

interface MobileMapControlsProps {
  panX: Animated.SharedValue<number>;
  panY: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  rotation: Animated.SharedValue<number>;
}
export const MobileMapControls: React.FC<MobileMapControlsProps> = ({
  panX,
  panY,
  scale,
  rotation
}) => {
  const { camera } = useThree();
  const PAN_SPEED = 0.05;
  const MIN_FACTOR = 0.5; // can zoom in to 25% of start altitude (4x closer)
  const MAX_FACTOR = 1.2;    // can zoom out to 4x of start altitude

  const MinZoom = camera.position.z * MIN_FACTOR;
  const MaxZoom = camera.position.z * MAX_FACTOR;
  const prevRot = useRef(0);
  const RotActive = useRef(false);

  // orthopedical!!! but works...
  useFrame(() => {
    camera.position.x += panX.value * PAN_SPEED;
    camera.position.y += panY.value * PAN_SPEED;
    panX.value = 0;
    panY.value = 0;

    if(!RotActive.current){
      var s = scale.value;
      if(s > 1 || s < 1)
        s = 2 - s // reverts zooms
      camera.position.z = MathUtils.clamp(camera.position.z * (s * 0.01),MaxZoom,MinZoom);
    }
    
    console.log(rotation.value)
    /*if(rotation.value !== prevRot.current){
      prevRot.current = rotation.value
      RotActive.current = true;
    }
    else
      RotActive.current = false;
    camera.rotation.set(-2.6,rotation.value,-2.9)*/
    

    /*if (rotationX.value !== 0 || rotationY.value !== 0) {
      bearing.current += rotationX.value * ROTATE_SPEED; // horizontal drag → compass
      tilt.current = MathUtils.clamp(
        tilt.current - rotationY.value * ROTATE_SPEED, // vertical drag → tilt
        0.1,
        Math.PI / 2 - 0.1 // stop before going upside down
      );
      rotationX.value = 0;
      rotationY.value = 0;
    }

    const r = camera.position.y; // distance from ground (altitude)
    const cosTilt = Math.cos(tilt.current);
    const sinTilt = Math.sin(tilt.current);

    // Place camera relative to origin (0,0,0)
    camera.position.x = r * Math.sin(bearing.current) * cosTilt;
    camera.position.y = r * sinTilt;
    camera.position.z = r * Math.cos(bearing.current) * cosTilt;*/

    
    camera.updateMatrixWorld();
  });

  return null;
};
