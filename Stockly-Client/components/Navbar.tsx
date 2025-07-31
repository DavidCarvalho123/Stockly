import { Colours } from "@/libs/Constants";
import Style from "@/libs/Style";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useClickOutside } from "react-native-click-outside";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
    componentTitle: string,
    updateComponent: (component: string) => () => void
}

const Navbar: React.FC<Props> = ({updateComponent}) => {
    const [ProdutosDropdown, setProdutosDropdown] = useState(false);
    const [PedidosDropdown, setPedidosDropdown] = useState(false);

    const openDropdown = (button: string) => () => {
        switch(button) {
            case 'produtos':
                setProdutosDropdown(!ProdutosDropdown);
                setPedidosDropdown(false);
                break;
            case 'pedidos':
                setProdutosDropdown(false);
                setPedidosDropdown(!PedidosDropdown);
                break;
        }
    }

    const refOutside = useClickOutside<View>(() => {
        setProdutosDropdown(false);
        setPedidosDropdown(false);
    });

    return(
        <>
            <SafeAreaView style={styles.container} ref={refOutside}>
                <View style={styles.buttonContainer}>
                    <Pressable style={Style.mobileButtonPrimary} onPress={openDropdown('produtos')}>
                        <Text style={Style.mobileTextButtonPrimary}>Produtos</Text>
                    </Pressable>
                    <View style={ProdutosDropdown ? styles.dropdown : styles.hideDropdown}>
                        <Pressable onPress={updateComponent("Manutenção Produtos")}>
                            <Text style={styles.optionsDropdown}>Listar Produtos</Text>
                        </Pressable>
                        <View
                            style={{
                                borderBottomColor: 'black',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                            />
                        <Pressable onPress={updateComponent("Inventário")}>
                            <Text style={styles.optionsDropdown} >Inventário</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Pressable style={Style.mobileButtonPrimary} onPress={openDropdown('pedidos')}>
                        <Text style={Style.mobileTextButtonPrimary}>Pedidos</Text>
                    </Pressable>
                    <View style={PedidosDropdown ? styles.dropdown : styles.hideDropdown}>
                        <Text style={styles.optionsDropdown}>Criar Pedido</Text>
                        <View
                            style={{
                                borderBottomColor: 'black',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                            />
                        <Text style={styles.optionsDropdown}>Transferência Stock</Text>
                        <View
                            style={{
                                borderBottomColor: 'black',
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                            />
                        <Text style={styles.optionsDropdown}>Tratar Pedidos</Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Pressable style={Style.mobileButtonPrimary} onPress={updateComponent("Representação 3D")}>
                        <Text style={Style.mobileTextButtonPrimary}>Pesquisa</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
            
        </>
    );
}

export default React.memo(Navbar);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colours.stocklyBlue,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        zIndex: 10
    },
    currentBodyTitle: {
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'roboto',
        marginStart: 20
    },
    emptyBody: {
        paddingTop:47
    },
    buttonContainer: {
        width: '30%'
    },
    dropdown: {
        display: 'flex',
        position: 'absolute',
        top: 35,
        flexDirection: 'column',
        backgroundColor: '#f4f4f4',
        marginLeft: 20,
        marginRight: -20,
        paddingTop: 10,
        paddingBottom: 10,
        gap: 10,
        width: 120
    },
    optionsDropdown:{
        paddingLeft: 10
    },
    hideDropdown: {
        display: 'none'
    }
});