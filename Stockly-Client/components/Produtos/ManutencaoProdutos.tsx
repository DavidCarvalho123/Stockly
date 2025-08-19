import CriarProdutoModal from "@/components/Modals/CriarProdutoModal";
import { Colours } from "@/libs/Constants";
import { GetAllPoducts } from "@/libs/Requests";
import Style from "@/libs/Style";
import { ProdutosManutencao } from "@/models/Produtos";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const ProdutosHeaders = ['EAN', 'Nome', 'Departamento', 'Unidade', 'Preço Venda', 'IVA', 'Ativo']

const ManutencaoProdutos:React.FC = () => {
    const [Products, setProducts] = useState<ProdutosManutencao[]>();
    const [modalVisible, setModalVisible] = useState(false);
    
    useEffect(() => {
        async function fetchData() {
            let data = await GetAllPoducts();
            if(data != null){
                setProducts(data as ProdutosManutencao[]);
            }
        }
        fetchData();
    }, [])

    const viewModal = () => {
        console.log("habemos button");
        setModalVisible(true);
    }

    if(Platform.OS === 'web')
        return ( 
            <>
                <View>
                    <Pressable style={[Style.buttonSecondary,styles.buttonMpPrimary]} onPress={viewModal}>
                        <Text style={Style.textButtonSecondary}>Criar</Text>
                    </Pressable>
                </View>

                
                <View style={styles.container}>
                    <View style={styles.tableContainer}>
                    <View style={styles.tableRowHeader}>
                            {ProdutosHeaders.map((header) => 
                                <View style={styles.tableColumnHeader}>
                                    <Text style={styles.textHeader}>{header}</Text>
                                </View>
                            )}
                    </View>

                    {Products && Products?.map((product) => {
                        
                        return(
                            <View style={styles.tableRow}>
                                <View style={styles.tableBodyCell}>
                                    <Text style={styles.textLineItem}>{product.ean}</Text>
                                </View>
                                <View style={styles.tableBodyCell}>
                                    <Text style={styles.textLineItem}>{product.nome}</Text>
                                </View>
                                <View style={styles.tableBodyCell}>
                                    <Text style={styles.textLineItem}>{product.departamento}</Text>
                                </View>
                                <View style={styles.tableBodyCell}>
                                    <Text style={styles.textLineItem}>{product.tipoUnidade}</Text>
                                </View>
                                <View style={styles.tableBodyCell}>
                                    <Text style={styles.textLineItem}>{product.precoVenda}</Text>
                                </View>
                                <View style={styles.tableBodyCell}>
                                    <Text style={styles.textLineItem}>{product.iva}</Text>
                                </View>
                                <View style={styles.tableBodyCell}>
                                    <Text style={styles.textLineItem}>{product.ativo ? 'Ativo' : 'Inativo'}</Text>
                                </View>
                            </View>
                        )})}
                    
                    </View>
                </View>
                    <SafeAreaView style={styles.container}>
                    <View>
                        <CriarProdutoModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        />
                    </View>
                    </SafeAreaView>
            
            </>
        );
    else
        return(
            <SafeAreaView>
                {Products && 
                    <FlatList data={Products}
                        renderItem={({item}) => <Item key={item.id} item={item}/>} />
                }
            </SafeAreaView>
        );
}

interface ItemProps{
    item: ProdutosManutencao
}
const Item = ({item}:ItemProps) => {
    return(
        <View style={[styles.itemContainer]}>
                <View style={[styles.itemLeft]}>
                    <Text><Text style={styles.headerItem}>EAN:</Text> {item.ean}</Text>
                    <Text><Text style={styles.headerItem}>Nome:</Text> {item.nome}</Text>
                    <Text ><Text style={styles.headerItem}>Departamento:</Text> {item.departamento}</Text>
                    <Text><Text style={styles.headerItem}>Fornecedor:</Text> {item.departamento}</Text>
                </View>
                <View style={styles.itemRight}>
                    <Text><Text style={styles.headerItem}>Unidade:</Text> {item.tipoUnidade}</Text>
                    <Text><Text style={styles.headerItem}>Preço Venda:</Text> {item.precoVenda} €</Text>
                    <View style={styles.checkboxItem}>
                        <Text style={[styles.headerItem, {marginTop: 1}]}>Ativo:</Text>
                        {item.ativo ? <AntDesign name="check" size={20} color="green" /> : <AntDesign name="close" size={20} color="#ec1f1fff" />}
                    </View>
                    <MaterialIcons style={{marginTop:'auto'}} name="inventory" size={24} color="black" />
                </View>
        </View>
    );
}


export default ManutencaoProdutos;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 10
   },
   tableColumnHeader: {
      alignItems: "center",
      backgroundColor: Colours.sidebarGrey,
      flex: 5,
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth
   },
   tableBodyCell: {
      alignItems: "center",
      flex: 3,
      justifyContent: "center",
      margin: 1,
      borderWidth: StyleSheet.hairlineWidth
   },
   tableColumnTotals: {
      alignItems: "center",
      flex: 2,
      justifyContent: "center",
      margin: 1
   },
   tableRow: {
      flex: 5,
      flexDirection: "row",
      maxHeight: 30,
      
   },
   tableRowHeader: {
      flex: 5,
      flexDirection: "row",
      maxHeight: 40
   },
   tableContainer: {
      borderRadius: 5,
      flex: 1,
      marginTop: 0,
      padding: 10
   },
   textHeader: {
      color: "#000000",
      fontWeight: "bold"
    },
    textHeaderSubTitle: {
        fontSize: 12
    },
    textLineItem: {
        color: "#000000"
    },
    buttonMpPrimary: {
      width: 90,
      borderRadius: 20,
      padding: 10,
      marginBottom: 0,
      marginTop: 20,
      marginLeft: 20,
      boxShadow: "0 2px 4px darkslategray"
    },
    itemContainer: {
        backgroundColor: Colours.sidebarGrey,
        borderWidth: 1,
        borderRadius: 5,
        marginLeft: 30,
        marginRight: 30,
        marginBottom: 30,
        padding: 20,
        display:'flex',
        flexDirection:'row'
    },
    headerItem:{
        fontWeight: 'bold'
    },
    itemLeft:{
        width: '50%',
        gap: 1,
        zIndex: 999
    },
    itemRight:{
        width: '50%',
        display:'flex',
        alignItems: 'flex-end',
        gap: 1
    },
    ativoItem:{
        height: 100
    },
    checkboxItem:{
        display:'flex',
        flexDirection: 'row'
    },
    inventoryIcon:{
        display:'flex',
        alignSelf:'flex-end'
    }

});