import { FurnitureTypes, renderedObjectsToSave, TreeLocals } from '@/models/Localizacoes';
import AntDesign from '@expo/vector-icons/AntDesign';
import { MapControls, Stats, useProgress } from "@react-three/drei";
import { Canvas, ThreeElements } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Item } from "react-simple-tree-menu";
import * as THREE from 'three';
import { Colours } from "../Constants";
import { GetStoredGraphics, PostGraphicalChanges, UpdatePosObject } from '../Requests';
import Style from '../Style';
import DraggableObj from "./DynObj";

// @react-three/drei - DOM only, only used in web view

// Main Floor of the currently seleced location
type MainPlaneProps = ThreeElements['mesh'] & {
  nodeProps: Item|undefined;
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
const furniture:FurnitureTypes[] = [
  {name: 'mesa', sizeX: 100,sizeY:70, sizeZ:70,renderColour:'orange'}
];
interface renderedObjects {
  refState: React.RefObject<any>,
  obj: FurnitureTypes,
  originalPos?: THREE.Vector3,
  furnitureId?: number
}
const ConvertDbObjects = (dbData: TreeLocals[]) => {
  var newObjs: renderedObjects[] = [];
  dbData.forEach((data) => {
    newObjs.push({
      obj: {name: data.nome, sizeX: data.sizeX, sizeY: data.sizeY, sizeZ: data.sizeZ} as FurnitureTypes,
      refState: { current: { position: new THREE.Vector3(data.coordX, data.coordY, data.coordZ) } } as React.RefObject<any>,
      originalPos: new THREE.Vector3(data.coordX, data.coordY, data.coordZ),
      furnitureId: data.id
    });
  });
  return newObjs;
}
interface Props{
  treeData:Item|undefined;
}
const MainViewEditable = 
({treeData}: Props) => {
  const floorRef = useRef(null!);
  const [controlsEnabled, setControlsEnabled] = useState<boolean>(true);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  // dynamic objects
  const [notSavedObjs, setNotSavedObjs] = useState<renderedObjects[]>([]);
  const [dbSavedObjs, setdbSavedObjs] = useState<renderedObjects[]>([]);
  var allDynamicRefs = notSavedObjs.map((r) => r.refState).concat(dbSavedObjs.map((d) => d.refState));
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


  const dynamicObjectDrag = (value: boolean) => {
    setControlsEnabled(value);
  } 

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
        }
      }
      fetchData();
  }, [treeData])

  const submit3DUpdates = async () => {
      setIsProcessing(true);
      var graphicalChanges: renderedObjectsToSave[] = [];
      if(notSavedObjs.length > 0){
        notSavedObjs.forEach((notSavObj)=> {
          graphicalChanges.push({
            obj: notSavObj.obj,
            localPai:treeData?.id,
            position:{x:notSavObj.refState.current.position.x,y:notSavObj.refState.current.position.y,z:notSavObj.refState.current.position.z}
          });
        })
        let result = await PostGraphicalChanges(graphicalChanges);
        if(result.status >= 200 && result.status < 300){
            
        }
      }
      // process edited positions
      if(dbSavedObjs.length > 0){
        dbSavedObjs.forEach(async (newObj) => {
          const newVec = newObj.refState.current.position as THREE.Vector3;
          if(!newObj.originalPos?.equals(newVec)){
            let result = await UpdatePosObject(newVec,newObj.furnitureId as number);
            if(result.status >= 200 && result.status < 300){
                
            }
          }
        });
      }
      setIsProcessing(false)
  }

  const addDynObjTable = () => {
    const newRef = { current: null } as React.RefObject<any>;
    setNotSavedObjs( [...notSavedObjs,{ refState: newRef, obj: furniture[0] }] );
  }
  // ---------------
  
  if(treeData != undefined){
    return (
      <View style={{flex:1,flexDirection:"column"}}>
        <View style={style.toolbar}>
          <View>
            <AntDesign style={[Style.buttonPrimary, style.buttonFurniture, {opacity:isProcessing ? 0.5 : 1}]} name="plus" size={18} color="black" disabled={isProcessing} onPress={addDynObjTable}>
              <Text style={Style.textButtonPrimary}>Adicionar mesa</Text>
            </AntDesign>
          </View>

          <View style={style.formButtons}>
            <ActivityIndicator size="large" animating={isProcessing}/>
            <Pressable style={[Style.buttonSecondary, style.saveChanges,{opacity:isProcessing ? 0.5 : 1}]} disabled={isProcessing} onPress={submit3DUpdates}>
              <Text style={Style.textButtonSecondary}>Guardar Alterações</Text>
            </Pressable>
          </View>

        </View>
        <View style={{flex:1}}>
            <Canvas shadows={"variance"} style={{backgroundColor:'black'}} camera={{ position:[-treeData.sizeX/2,500,-treeData.sizeZ], near: 0.1, far: 100000  }}>
                <MapControls makeDefault minZoom={5} maxZoom={5} enabled={controlsEnabled}  />
                <Suspense fallback={<Loader/>}>
                  <spotLight ref={spotRef}  position={[-treeData.sizeX/2,500,-treeData.sizeZ]} angle={Math.PI} penumbra={1} decay={0} intensity={5} />
                  <spotLight ref={spotRef2} position={[-treeData.sizeX,500,-treeData.sizeZ/2]} angle={Math.PI/2} penumbra={1} decay={0} intensity={5} />
                  <spotLight ref={spotRef3} position={[treeData.sizeX/2,500,-treeData.sizeZ/2]} angle={Math.PI} penumbra={1} decay={0} intensity={5} />
                  <spotLight ref={spotRef4} position={[-treeData.sizeX/2,500,treeData.sizeZ]} angle={Math.PI/2} penumbra={1} decay={0} intensity={5} />
                  <object3D ref={pointRef}  position={[-treeData.sizeX/2,0,-treeData.sizeZ/2]}/>


                  <MainPlane nodeProps={treeData} ref={floorRef}/>
                  {notSavedObjs.map((ref, i) => (
                    <DraggableObj id={i} nodeProps={treeData} refProp={ref.refState} otherRefs={allDynamicRefs} 
                                  objToRender={ref.obj} dragControl={dynamicObjectDrag} activeDragId={activeDragId} 
                                  setActiveDragId={setActiveDragId} isDbLoaded={false}/>
                  ))}
                  {dbSavedObjs.map((ref, i) => (
                    <DraggableObj id={i} nodeProps={treeData} refProp={ref.refState} otherRefs={allDynamicRefs} 
                                  objToRender={ref.obj} dragControl={dynamicObjectDrag} activeDragId={activeDragId} 
                                  setActiveDragId={setActiveDragId} isDbLoaded={true}/>
                  ))}
                  <Stats/>
                </Suspense>
            </Canvas>
        </View>
      </View>
    )
  }
}

const DebugLight = ({treeData}:Props) => {
  console.log(treeData)
  
  if(treeData != null){
    console.log('in')
    return(
      <>
        
      </>
    )
  }
}

export default MainViewEditable;

const style = StyleSheet.create({
  toolbar:{
    width:'100%',
    height: 60,
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