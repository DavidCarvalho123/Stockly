import MainViewEditable from "@/libs/3D/MainViewEditable";
import { GetTreeLocals } from "@/libs/Requests";
import { TreeData, TreeLocals } from "@/models/Localizacoes";
import { useContext, useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import MainView from "@/libs/3D/MainView";
import { AuthContext } from "@/libs/AuthContext";
import AntDesign from '@expo/vector-icons/AntDesign';
import TreeMenu, { Item } from 'react-simple-tree-menu';
import '../../node_modules/react-simple-tree-menu/dist/main.css';

const ConvertTreeData = (dbData:TreeLocals[]) => {
    var treeData: TreeData[] = [];
    if(dbData == null)
        return undefined
    dbData.forEach((local, index) => {
        treeData.push({ key: local.id.toString() + '-level-node', 
                        label: '[L] ' + local.nome, 
                        index: index, 
                        id: local.id ,
                        sizeX: local.sizeX,
                        sizeZ: local.sizeZ,
                        nodes: ConvertTreeData(local.subLocalizacao)
                    });
    });
    return treeData;
}

const TreeNodeItem: React.FC<{
  node: TreeData;
  level: number;
  onNodeSelect: (node: TreeData) => void;
}> = ({ node, level, onNodeSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View>
      <View style={[styles.node, { paddingLeft: level * 40, flexDirection: 'row', alignItems: 'center', paddingBottom: 7, paddingTop:7 }]}>
        
        {node.nodes && node.nodes.length > 0 && (
          <TouchableOpacity onPress={() => setExpanded(prev => !prev)}>
            <AntDesign
              name={expanded ? 'minus' : 'plus'}
              size={24}
              color="black"
              style={{ marginRight: 6 }}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => onNodeSelect(node)}
          style={{ flex: 1 }}
        >
          <Text style={styles.label}>{node.label}</Text>
        </TouchableOpacity>
      </View>

      {expanded && node.nodes && (
        <FlatList
          data={node.nodes}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TreeNodeItem
              node={item}
              level={level + 1}
              onNodeSelect={onNodeSelect}
            />
          )}
        />
      )}
    </View>
  );
};

const Representacao3d:React.FC = () => {
    const [locals, setLocals] = useState<TreeData[]>();
    const [selectedLocal, setSelectedLocal] = useState<Item>();
    const [selectedViewLocal, setSelectedViewLocal] = useState<TreeData | undefined>(undefined);
    const context = useContext(AuthContext);

    useEffect(() => {
        async function fetchData() {
            let data = await GetTreeLocals();
            if(data != null){
                let treeData = ConvertTreeData(data)
                setLocals(treeData);
            }
        }
        fetchData();
    }, [])

    const updateSelectedNode = (selectedNode: Item) => {
        setSelectedLocal(selectedNode);
    }
    const updateSelectedMobileNode = (selectedNode: TreeData | undefined) => {
        setSelectedViewLocal(selectedNode);
        context.set3D(true);
    }
    const clearSelectedMobileNode = () => {
        setSelectedViewLocal(undefined);
        context.set3D(false);
    }
    
    if(Platform.OS === 'web'){
        return (
            <View style={styles.container}>
                <View style={styles.containerLocals}>
                    <TreeMenu data={locals} debounceTime={125} disableKeyboard={true} hasSearch={false} onClickItem={({...props})=>{ updateSelectedNode(props) }} />
                </View>
                <View style={styles.container3D}>
                    <MainViewEditable key={selectedLocal?.key} treeData={selectedLocal} />
                </View>
            </View>
        );
    }
    else{
        return ( 
            <>
            {selectedViewLocal === undefined &&
                <FlatList
                    data={locals}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => <TreeNodeItem node={item} level={0} onNodeSelect={updateSelectedMobileNode} />}
                />
            }
            {selectedViewLocal &&
                <MainView treeData={selectedViewLocal} resetTreeData={clearSelectedMobileNode}/>
            }
            </>
        );
    }
}

export default Representacao3d;

const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection:'row'
    },
    containerLocals:{
        flex:1
    },
    container3D:{
        flex:5
    },
    node: {
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    label: {
        fontSize: 18,
        color: "#222",
    },
})