import useControls from "@/libs/r3f-native-controls";
import { Canvas, ThreeElements, useFrame } from '@react-three/fiber/native';
import React, { useRef, useState } from 'react';
import { View } from "react-native";
import { Mesh } from "three";

const Box = (props:ThreeElements['mesh']) => {
  const mesh = useRef<Mesh>(null!)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  useFrame((_, delta) => (mesh.current.rotation.x += delta))
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

const MainView = () => {
  const [OrbitControls, events] = useControls('map')

  return (
    <View style={{flex:1}} {...events}>
        <Canvas>
            <OrbitControls minZoom={5} maxZoom={10}/>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} />
        </Canvas>
    </View>
  )
}

export default MainView