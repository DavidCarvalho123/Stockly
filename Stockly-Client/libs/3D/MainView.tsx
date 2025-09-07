import { FurnitureTypes, groupedStocks, TreeData, TreeLocals } from "@/models/Localizacoes";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useProgress } from "@react-three/drei/native";
import { Canvas, ThreeElements } from '@react-three/fiber/native';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue } from 'react-native-reanimated';
import * as THREE from 'three';
import { Colours } from "../Constants";
import { GetExistingStocks, GetStoredGraphics } from "../Requests";
import Style from "../Style";
import { MobileMapControls } from "./MobileMapControls";
import { Rackmobile } from "./Rackmobile";
import { Tablemobile } from "./Tablemobile";

// Main Floor of the currently seleced location
type MainPlaneProps = ThreeElements['mesh'] & {
  nodeProps: TreeData|undefined;
  ref: React.RefObject<never>;
}
const MainPlane = ({nodeProps, ref, ...props}: MainPlaneProps) => {
  if(nodeProps != undefined){
    return (
      <mesh visible {...props} ref={ref} position={[-nodeProps.sizeX/2,0,-nodeProps.sizeZ/2]} rotation={[Math.PI/2,0,0]} >
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
interface renderedObjects {
   refState: React.RefObject<any>,
  obj: FurnitureTypes,
  originalPos?: THREE.Vector3,
  originalRot?: number,
  furnitureId?: number
}
const ConvertDbObjects = (dbData: TreeLocals[]) => {
  var newObjs: renderedObjects[] = [];
  dbData.forEach((data) => {
    newObjs.push({
      obj: {name: data.nome, sizeX: data.sizeX, sizeY: data.sizeY, sizeZ: data.sizeZ} as FurnitureTypes,
      refState: { current: { position: new THREE.Vector3(data.coordX, data.coordY, data.coordZ), rotation: [0,data.rotation,0] } } as React.RefObject<any>,
      originalPos: new THREE.Vector3(data.coordX, data.coordY, data.coordZ),
      originalRot: data.rotation,
      furnitureId: data.id
    });
  });
  return newObjs;
}
interface Props{
  treeData:TreeData|undefined;
  resetTreeData: () => void;
}
const MainView = 
({treeData, resetTreeData}:Props) => {
  const floorRef = useRef(null!);
  // dynamic objects
  const [dbSavedObjs, setdbSavedObjs] = useState<renderedObjects[]>([]);
  const [cameraPos, setCameraPos] = useState<boolean>(false);
  const [products, setProducts] = useState<groupedStocks[]>();
  
  //const [OrbitControls, events] = useControls('map')
  // ---------------
  
  const spotRef = useRef<THREE.SpotLight>(null!);
  const spotRef2 = useRef<THREE.SpotLight>(null!);
  const spotRef3 = useRef<THREE.SpotLight>(null!);
  const spotRef4 = useRef<THREE.SpotLight>(null!);
  const pointRef = useRef<THREE.Object3D>(null!);
  useEffect(() => {
    if (spotRef.current && pointRef.current) {
      spotRef.current.target = pointRef.current;
      spotRef2.current.target = pointRef.current;
      spotRef3.current.target = pointRef.current;
      spotRef4.current.target = pointRef.current;
    }
  }, []);

  
  // dynamic objects funcs
  useEffect(() => {
    // fetches stored graphical data
      async function fetchData() {
        if(treeData != undefined){
          let data = await GetStoredGraphics(treeData?.id);
          if(data != null){
            // just needs to load them!
            // prepared for products as children, might need slight class tuning
            let newObjs = ConvertDbObjects(data);
            setdbSavedObjs(newObjs);
          }
          let stocks = await GetExistingStocks(treeData?.id);
          if(stocks != null){
            setProducts(stocks);
          }
        }
      }
      fetchData();
  }, [treeData]);

  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const scale = useSharedValue(1);
  const prevScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(1);

  const panGesture = Gesture.Pan().onUpdate((e) => {
    panX.value = e.translationX;
    panY.value = e.translationY;
  }).minDistance(0).onEnd(() => {
    panX.value = 0;
    panY.value = 0;
  });

  const pinchGesture = Gesture.Pinch().onBegin(() => {
    scale.value = 1; // reset at the start
    prevScale.value = 1;
  })
  .onUpdate((e) => {
    const raw = e.scale;
    const delta = raw / prevScale.value;

    // Apply a sensitivity curve (0.5 = less sensitive, 1 = raw, >1 = more sensitive)
    const sensitivity = 0.1;
    const adjusted = Math.pow(delta, sensitivity);

    scale.value *= adjusted; // accumulate
    prevScale.value = raw;
  })
  .onEnd(() => {
    scale.value = 1; // reset after pinch ends
    prevScale.value = 1;
  });

  const rotateGesture = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });


  const gesture = Gesture.Simultaneous(panGesture, pinchGesture, rotateGesture);
  
  if(treeData != undefined){
    return (
      <View style={{flex:1,flexDirection:"column"}}>
        <View style={style.toolbar}>
          <AntDesign style={[Style.buttonPrimary, style.buttonFurniture]} name="back" size={18} color="black" onPress={resetTreeData}>
            <Text style={[Style.textButtonPrimary]}>Voltar</Text>
          </AntDesign>
        </View>
        <View style={{flex:1}}>
          <GestureHandlerRootView>
            <Canvas shadows={"variance"} style={{backgroundColor:'black'}} camera={{ position: [-treeData.sizeX/2,500,-treeData.sizeZ], near: 0.1, far: 100000  }}>
                <Suspense fallback={<Loader/>}>
                  <MobileMapControls panX={panX} panY={panY} scale={scale} rotation={rotation} treeDataVal={treeData} setDefaultPos={cameraPos} callbackDefaultPos={() => setCameraPos(false)} />
                  <spotLight ref={spotRef}  position={[-treeData.sizeX/2,500,-treeData.sizeZ]} angle={Math.PI} penumbra={1} decay={0} intensity={5} />
                  <spotLight ref={spotRef2} position={[-treeData.sizeX,500,-treeData.sizeZ/2]} angle={Math.PI/2} penumbra={1} decay={0} intensity={5} />
                  <spotLight ref={spotRef3} position={[treeData.sizeX/2,500,-treeData.sizeZ/2]} angle={Math.PI} penumbra={1} decay={0} intensity={5} />
                  <spotLight ref={spotRef4} position={[-treeData.sizeX/2,500,treeData.sizeZ]} angle={Math.PI/2} penumbra={1} decay={0} intensity={5} />
                  <object3D ref={pointRef}  position={[-treeData.sizeX/2,0,-treeData.sizeZ/2]}/>


                  <MainPlane nodeProps={treeData} ref={floorRef}/>
                  {dbSavedObjs.map((ref, i) => {
                    if(ref.obj.name == 'mesa'){
                      return(
                        <Tablemobile key={i} ref={ref.refState} targetSize={[ref.obj.sizeX, ref.obj.sizeY, ref.obj.sizeZ]} rotation={ref.refState.current.rotation} pos={ref.refState.current.position} product={products?.find(p => p.furnitureId == ref.furnitureId)} />
                      )
                    }
                    else if (ref.obj.name == 'rack'){
                      return(
                        <Rackmobile key={i} ref={ref.refState} targetSize={[ref.obj.sizeX, ref.obj.sizeY, ref.obj.sizeZ]} rotation={ref.refState.current.rotation} pos={ref.refState.current.position} product={products?.find(p => p.furnitureId == ref.furnitureId)} />
                      );
                    }
                    })}
                  
                </Suspense>
            </Canvas>
            <GestureDetector gesture={gesture}>
              <View style={StyleSheet.absoluteFill} />
            </GestureDetector>
          </GestureHandlerRootView>
          <MaterialIcons style={{width:'auto',position:'absolute', right:15,top:15}} name="center-focus-strong" size={30} color="white" onPress={() => setCameraPos(true)} />
        </View>
      </View>
    )
  }
}

export default MainView

const style = StyleSheet.create({
  toolbar:{
    width:'100%',
    height: 50,
    backgroundColor:Colours.sidebarGrey,
    flexWrap:'wrap',
    justifyContent:'center',
    paddingLeft: 10,
    paddingRight: 10,
    alignContent:'space-between'
  },
  buttonFurniture:{
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 0
  },
  saveChanges:{
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 0
  },
  formButtons:{
    flexDirection:'row',
    gap:10,
  }
});