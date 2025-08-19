import { GetTreeLocals } from "@/libs/Requests";
import { TreeData, TreeLocals } from "@/models/Localizacoes";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import TreeMenu, { Item } from "react-simple-tree-menu";
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

const ManutencaoLocalizacoes:React.FC = () => {

    const [locals, setLocals] = useState<TreeData[]>();
        const [selectedLocal, setSelectedLocal] = useState<Item>();
    
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
        

    if(Platform.OS === 'web'){
        return (
            <View style={styles.container}>
                <View style={styles.containerLocals}>
                    <TreeMenu data={locals} debounceTime={125} disableKeyboard={true} hasSearch={false} onClickItem={({...props})=>{ updateSelectedNode(props) }} />
                </View>
                <View style={styles.container3D}>
                    
                </View>
            </View>
        );
    }
}

export default ManutencaoLocalizacoes;

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
    }
})