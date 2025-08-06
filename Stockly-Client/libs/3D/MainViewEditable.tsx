import { MapControls, useProgress } from "@react-three/drei";
import { Canvas, ThreeElements, useFrame } from '@react-three/fiber';
import React, { Suspense, useRef, useState } from 'react';
import { Text, View } from "react-native";
import { Item } from "react-simple-tree-menu";
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

type MainPlaneProps = ThreeElements['mesh'] & {
  nodeProps: Item|undefined
}

const MainPlane = ({nodeProps, ...props}: MainPlaneProps) => {
  const mesh = useRef<Mesh>(null!)
  
  if(nodeProps != undefined){
    return (
      <mesh visible {...props} ref={mesh} position={[0,0,0]} rotation={[Math.PI/2+0.1,0,0]}>
        <planeGeometry args={[nodeProps.sizeX,nodeProps.sizeZ]} />
        <meshBasicMaterial color={'#b1b1b1'} side={2} />
      </mesh>
    )
  }
}

const Loader = () => {
  const {progress} = useProgress();
    return (
      <>
        <Text>{progress} % carregado</Text>
      </>
    );
}

interface Props{
  treeData:Item|undefined;
}

const MainViewEditable = ({treeData}: Props) => {

  return (
    <View style={{flex:1}}>
        <Canvas shadows={"variance"} style={{backgroundColor:'black'}} camera={{ position:[0,20,100] }}>
            <MapControls makeDefault minZoom={5} maxZoom={5}  />
            <Suspense fallback={<Loader/>}>
              <ambientLight intensity={Math.PI / 2} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
              <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
              <MainPlane nodeProps={treeData} />
              {/*<Stats/>*/}
            </Suspense>
        </Canvas>
    </View>
  )
}

export default MainViewEditable