import { AuthContext } from "@/libs/AuthContext";
import { Colours } from "@/libs/Constants";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    updateComponent: (component: string) => () => void
}
const BottomTabs: React.FC<Props> = ({updateComponent}) => {
    const context = useContext(AuthContext);


    return(
        <>
            <View style={{flex: 1, backgroundColor: context.is3D ? '#000000' : ''}}>
                <View style={styles.container}>
                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.buttonView} onPress={updateComponent("Manutenção Produtos")}>
                            <FontAwesome6 name="barcode" size={24} color="white" />
                            <Text style={styles.text}>Produtos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonView} onPress={updateComponent("Inventário")}>
                                <MaterialIcons name="inventory" size={24} color="white"/>
                                <Text style={styles.text}>Inventário</Text>
                            
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonView} onPress={updateComponent("Manutenção Produtos")}>
                            <MaterialCommunityIcons name="transfer" size={24} color="white" />
                            <Text style={styles.text}>Pedidos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonView} onPress={updateComponent("Representação 3D")}>
                            <AntDesign name="search1" size={24} color="white" />
                            <Text style={styles.text}>Pesquisa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
}

export default BottomTabs;

const styles = StyleSheet.create({
container: {
        backgroundColor: Colours.stocklyBlue,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        zIndex: 0,
        marginTop: 'auto',
        flex: 1,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40
    },
    buttons:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        flex: 1,
        marginBottom: 10
    },
    text:{
        color:'#ffffff',
        fontSize: 14,
    },
    buttonView: {
        justifyContent:'center',
        alignItems: 'center'
    }
});