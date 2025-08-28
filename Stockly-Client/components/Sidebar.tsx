import { Colours } from "@/libs/Constants";
import Style from "@/libs/Style";
import React from "react";
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
    parentStyle: any,
    updateComponent: (component: string) => () => void
}

const Sidebar: React.FC<Props> = ({ parentStyle, updateComponent }) => {

    return(
        <>
            <View style={[styles.container, parentStyle]}>
                <View style={styles.titleContainer}>
                    <Text style={Style.StocklyTitle}>
                        Stockly
                    </Text>
                </View>
                <View style={styles.sidebarContent}>

                    <Text style={styles.categories}>
                        Produtos
                    </Text>

                    <Pressable style={Style.buttonPrimary} onPress={updateComponent("Manutenção Produtos")}>
                        <Text style={Style.textButtonPrimary}>Manutenção</Text>
                    </Pressable>
                    <Pressable style={Style.buttonPrimary} onPress={updateComponent("Inventário")}>
                        <Text style={Style.textButtonPrimary}>Inventário</Text>
                    </Pressable>


                    <Text style={styles.categories}>
                        Pedidos
                    </Text>

                    <Pressable style={Style.buttonPrimary} onPress={updateComponent("Tratar Pedidos")}>
                        <Text style={Style.textButtonPrimary}>Tratar Pedidos</Text>
                    </Pressable>
                    <Pressable style={Style.buttonPrimary} onPress={updateComponent("Transferências")}>
                        <Text style={Style.textButtonPrimary}>Transferências</Text>
                    </Pressable>


                    <Text style={styles.categories}>
                        Localizações
                    </Text>

                    <Pressable style={Style.buttonPrimary} onPress={updateComponent("Manutenção Localizações")}>
                        <Text style={Style.textButtonPrimary}>Manutenção</Text>
                    </Pressable>
                    <Pressable style={Style.buttonPrimary} onPress={updateComponent("Representação 3D")}>
                        <Text style={Style.textButtonPrimary}>Representação 3D</Text>
                    </Pressable>


                    <Text style={styles.categories}>
                        Administrador
                    </Text>

                    <Pressable style={Style.buttonPrimary} onPress={updateComponent("Gestão de Utilizadores")}>
                        <Text style={Style.textButtonPrimary}>Gestão de Utilizadores</Text>
                    </Pressable>
                    <Pressable style={Style.buttonPrimary} onPress={updateComponent("Historico de Transferencias")}>
                        <Text style={Style.textButtonPrimary}>Histórico de Transferências</Text>
                    </Pressable>
                </View>
            </View>
        </>
    );
}

export default React.memo(Sidebar);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colours.sidebarGrey,
    },
    titleContainer: {
        backgroundColor: Colours.stocklyBlue,
        paddingTop: 5,
        paddingBottom: 5,
        borderEndWidth: 1,
        borderColor: '#929292ff',
        marginBottom: 10
    },
    categories: {
        fontSize: 16,
        fontWeight: '600',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#929292ff',
        textAlign: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        marginTop: 10,
        marginBottom: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '50%'
    },
    sidebarContent:{
        flexWrap: 'wrap',
        alignContent: 'center'
    }
});