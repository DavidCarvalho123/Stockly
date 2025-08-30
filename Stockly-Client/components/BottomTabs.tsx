import { AuthContext } from "@/libs/AuthContext";
import { Colours } from "@/libs/Constants";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
    currentComponent: string,
    updateComponent: (component: string) => () => void
}
const BottomTabs: React.FC<Props> = ({currentComponent, updateComponent}) => {
    const context = useContext(AuthContext);
    console.log(context.is3D);
    return(
        <>
            <SafeAreaView style={{flex: 1, backgroundColor: context.is3D ? '#000000' : '#F2F2F2'}}>
                <View style={styles.container}>
                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.buttonView} onPress={updateComponent("Manutenção Produtos")}>
                            <FontAwesome6 name="barcode" size={24} color={currentComponent == 'Manutenção Produtos' ? "#d2effd": "white"} />
                            <Text style={[styles.text, currentComponent == 'Manutenção Produtos' ? {borderBottomWidth:  2,borderColor:'#d2effd', color:'#d2effd'} : {}]}>Produtos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonView} onPress={updateComponent("Inventário")}>
                                <MaterialIcons name="inventory" size={24} color={currentComponent == 'Inventário' ? "#d2effd": "white"}/>
                                <Text style={[styles.text, currentComponent == 'Inventário' ? {borderBottomWidth:  2,borderColor:'#d2effd', color:'#d2effd'} : {}]}>Inventário</Text>
                            
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonView} onPress={updateComponent("Pedidos")}>
                            <MaterialCommunityIcons name="transfer" size={24} color={currentComponent == 'Pedidos' ? "#d2effd": "white"} />
                            <Text style={[styles.text, currentComponent == 'Pedidos' ? {borderBottomWidth:  2,borderColor:'#d2effd', color:'#d2effd'} : {}]}>Pedidos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonView} onPress={updateComponent("Representação 3D")}>
                            <AntDesign name="search1" size={24} color={currentComponent == 'Representação 3D' ? "#d2effd": "white"} />
                            <Text style={[styles.text, currentComponent == 'Representação 3D' ? {borderBottomWidth:  2,borderColor:'#d2effd', color:'#d2effd'} : {}]}>Pesquisa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

export default BottomTabs;

const styles = StyleSheet.create({
container: {
        backgroundColor: Colours.stocklyBlue,
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        gap: 10,
        zIndex: 99,
        height: 50,
        flex: 1,
        borderRadius: 40
    },
    buttons:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        flex: 1,
    },
    text:{
        color:'#ffffff',
        fontSize: 14,
    },
    buttonView: {
        justifyContent:'center',
        alignItems: 'center',
    }
});