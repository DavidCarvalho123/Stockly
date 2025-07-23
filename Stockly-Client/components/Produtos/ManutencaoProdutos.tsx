import { Colours } from "@/libs/Constants";
import { GetAllPoducts } from "@/libs/Requests";
import { ProdutosManutencao } from "@/models/Produtos";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const ProdutosHeaders = ['EAN', 'Nome', 'Departamento', 'Unidade', 'Preço Venda', 'IVA', 'Ativo']

const ManutencaoProdutos:React.FC = () => {
    const [Products, setProducts] = useState<ProdutosManutencao[]>();
    
    useEffect(() => {
        async function fetchData() {
            let data = await GetAllPoducts();
            if(data != null){
                setProducts(data as ProdutosManutencao[]);
            }
        }
        fetchData();
    }, [])

    return ( 
        <View style={styles.container}>
            <View style={styles.tableContainer}>
               <View style={styles.tableRowHeader}>
                    {ProdutosHeaders.map((header) => 
                        <View style={styles.tableColumnHeader}>
                            <Text style={styles.textHeader}>{header}</Text>
                        </View>
                    )}
               </View>

                {Products?.map((product) => {
                    
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
    }
});