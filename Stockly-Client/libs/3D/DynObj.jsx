import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from "three";
import { Table } from "./Table";



export default function DraggableObj({id, nodeProps, dragControl, refProp, otherRefs, objToRender, activeDragId, setActiveDragId, isDbLoaded}) {
  const { camera, gl } = useThree();
  const [dragging, setDragging] = useState(false);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const intersect = useMemo(() => new THREE.Vector3(), []);
  let accumulatedRotation = 0;
  const clampToPlane = (position, sizeX, sizeZ, boxHalfSizeX, boxHalfSizeZ, rotationY = 0) => {
    const cos = Math.cos(rotationY);
    const sin = Math.sin(rotationY);

    const effectiveHalfX = Math.abs(boxHalfSizeX * cos) + Math.abs(boxHalfSizeZ * sin);
    const effectiveHalfZ = Math.abs(boxHalfSizeX * sin) + Math.abs(boxHalfSizeZ * cos);
    position.x = Math.max(-sizeX + effectiveHalfX, Math.min(-effectiveHalfX, position.x));
    position.z = Math.max(-sizeZ + effectiveHalfZ, Math.min(-effectiveHalfZ, position.z));
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging || !refProp.current) return;
      if (activeDragId != null && activeDragId != id) return;

      
      if(e.buttons === 2){
        const deltaX = e.movementX || 0;
        // Example: rotate around Y with horizontal movement, X with vertical
        refProp.current.rotation.y += deltaX * 0.01;
        /*if(e.shiftKey){
          refProp.current.rotation.y += deltaX * 0.01;
        }
        else{
          const delta = e.movementX * 0.01; // rotation increment
          accumulatedRotation += delta;

          // Snap only when accumulated rotation reaches 90° (π/2)
          const snapThreshold = Math.PI / 2; 

          if (Math.abs(accumulatedRotation) >= snapThreshold) {
            const steps = Math.floor(accumulatedRotation / snapThreshold);
            refProp.current.rotation.y = steps * snapThreshold;
            accumulatedRotation -= steps * snapThreshold; // reset accumulated
          }
        }*/

        pointer.x = refProp.current.position.x;
        pointer.y = refProp.current.position.y;

        /*raycaster.setFromCamera(pointer, camera);
        if (raycaster.ray.intersectPlane(plane, intersect)) {
          clampToPlane(intersect, nodeProps.sizeX, nodeProps.sizeZ, objToRender.sizeX / 2, objToRender.sizeZ/2, refProp.current.rotation.y);
    
        }

        return;*/
      }
      if(e.buttons === 1){
        const rect = gl.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }
        raycaster.setFromCamera(pointer, camera);
        
        if (raycaster.ray.intersectPlane(plane, intersect)) {
          intersect.y = objToRender.sizeY/2;
          clampToPlane(intersect, nodeProps.sizeX, nodeProps.sizeZ, objToRender.sizeX / 2, objToRender.sizeZ/2, refProp.current.rotation.y);
  
          const thisSize = new THREE.Vector3();
          new THREE.Box3().setFromObject(refProp.current).getSize(thisSize);
  
          const currentPos = refProp.current.position.clone();
          let newPos = currentPos.clone();
  
          // --- X movement ---
          {
            const testPos = new THREE.Vector3(intersect.x, currentPos.y, currentPos.z);
            const testBB = new THREE.Box3().setFromCenterAndSize(testPos, thisSize);
  
            const collisionX = otherRefs.some((otherRef) => {
              if (!otherRef.current || otherRef === refProp) return false;
              const otherBB = new THREE.Box3().setFromObject(otherRef.current);
              return testBB.intersectsBox(otherBB);
            });
  
            if (!collisionX) {
              newPos.x = intersect.x;
            }
          }
  
          // --- Z movement ---
          {
            const testPos = new THREE.Vector3(newPos.x, currentPos.y, intersect.z);
            const testBB = new THREE.Box3().setFromCenterAndSize(testPos, thisSize);
  
            const collisionZ = otherRefs.some((otherRef) => {
              if (!otherRef.current || otherRef === refProp) return false;
              const otherBB = new THREE.Box3().setFromObject(otherRef.current);
              return testBB.intersectsBox(otherBB);
            });
  
            if (!collisionZ) {
              newPos.z = intersect.z;
            }
          }
          
          // Apply new position
          refProp.current.position.copy(newPos);
        
      }
    };
    const handleUp = (e) => {
      console.log(e);
      if (activeDragId === id) {
        if(e.shiftKey){
          const current = refProp.current.rotation.y;
          refProp.current.rotation.y = Math.round(current / (Math.PI / 2)) * (Math.PI / 2);
        }
        setActiveDragId(null);
      }
      dragControl(true);
      setDragging(false);
    };

    
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragging, camera]);
  
   if(objToRender.name === 'mesa'){
    // two ways of defining position, either when it's created (sets to default point of plane) or when its database rendered (loads its stored position)
     return(
       <Table ref={refProp}
         position={isDbLoaded ? refProp.current.position : [-objToRender.sizeX/2, objToRender.sizeY/2, -objToRender.sizeZ/2]}
         rotation={isDbLoaded ? refProp.current.rotation : [0,0,0]}
         onPointerDown={() => {setDragging(true);dragControl(false);setActiveDragId(id);}}
         targetSize={ [objToRender.sizeX, objToRender.sizeY, objToRender.sizeZ]}
       />
     );
   }
  /*return (
    <mesh
      ref={refProp}
      position={[-objToRender.sizeX/2, objToRender.sizeY/2, -objToRender.sizeZ/2]}
      onPointerDown={() => {setDragging(true);dragControl(false);setActiveDragId(id);}}
    >
      <boxGeometry args={[objToRender.sizeX, objToRender.sizeY, objToRender.sizeZ]} />
      <meshStandardMaterial color={objToRender.renderColour} />
    </mesh>
  );*/
}
