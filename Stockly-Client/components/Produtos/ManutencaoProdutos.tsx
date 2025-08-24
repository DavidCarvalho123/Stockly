import CriarProdutoModal from "@/components/Modals/CriarProdutoModal";
import EditarProdutoModal from "@/components/Modals/EditarProdutoModal";
import VerStockModal from "@/components/Modals/VerStockModal";
import { Colours } from "@/libs/Constants";
import { GetAllProducts } from "@/libs/Requests";
import Style from "@/libs/Style";
import { ProdutosManutencao } from "@/models/Produtos";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---- Definição única das colunas ----
const COLS: { key: keyof ProdutosManutencao | "acao"; label: string; flex: number; filterable?: boolean }[] = [
  { key: "ean",          label: "EAN",          flex: 1.6, filterable: true },
  { key: "nome",         label: "Nome",         flex: 2.0, filterable: true },
  { key: "departamento", label: "Departamento", flex: 2.0, filterable: true },
  { key: "tipoUnidade",  label: "Unidade",      flex: 1.3, filterable: true },
  { key: "precoVenda",   label: "Preço Venda",  flex: 1.1, filterable: true },
  { key: "iva",          label: "IVA",          flex: 0.8, filterable: true },
  { key: "ativo",        label: "Ativo",        flex: 1.0, filterable: true },
  { key: "acao",         label: "",             flex: 1.9, filterable: false }, // ↑ mais largo para 2 botões
];

const TOTAL_FLEX = COLS.reduce((s, c) => s + c.flex, 0);
const COL_WIDTHS = COLS.map((c) => `${(c.flex / TOTAL_FLEX) * 100}%`);
const ACCENT = Colours.stocklyBlue;

/* ---------- Utilitários ---------- */
const CellText: React.FC<{ text: string }> = ({ text }) => (
  <Text selectable numberOfLines={1} ellipsizeMode="tail" style={styles.cellText}>
    {text}
  </Text>
);

const FilterBox: React.FC<{
  value: string;
  onChange: (t: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = "Filtrar" }) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[styles.filterInput, focused && styles.filterInputFocused]}
      placeholder={placeholder}
      placeholderTextColor="#777"
      value={value}
      onChangeText={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
    };

const ProdutosHeaders = ['EAN', 'Nome', 'Departamento', 'Unidade', 'Preço Venda', 'IVA', 'Ativo'];

/* ---------- Página ---------- */

const ManutencaoProdutos: React.FC = () => {
  const [products, setProducts] = useState<ProdutosManutencao[]>([]);
  const [filtered, setFiltered] = useState<ProdutosManutencao[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [createVisible, setCreateVisible] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // novo: ver stock
  const [viewStockId, setViewStockId] = useState<number | null>(null);
  const [viewStockVisible, setViewStockVisible] = useState(false);

  const load = async () => {
    const data = await GetAllProducts();
    if (data) {
      setProducts(data as ProdutosManutencao[]);
      setFiltered(data as ProdutosManutencao[]);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const f = products.filter((p) =>
      COLS.every((c) => {
        if (!c.filterable) return true;
        const v = (filters[c.key as string] || "").trim().toLowerCase();
        if (!v) return true;
        const cell = String((p as any)[c.key] ?? "").toLowerCase();
        return cell.includes(v);
      })
    );
    setFiltered(f);
  }, [filters, products]);

  const Header = useMemo(
    () => (
      <View style={styles.headerRow}>
        {COLS.map((c, i) => (
          <View
            key={`h-${c.key}`}
            style={[styles.headerCell, { width: COL_WIDTHS[i] } as any]}
          >
            <Text style={styles.headerText}>{c.label}</Text>
          </View>
        ))}
      </View>
    ),
    []
  );

  const FilterRow = useMemo(
    () => (
      <View style={styles.filterRow}>
        {COLS.map((c, i) => (
          <View
            key={`f-${c.key}`}
            style={[styles.filterCell, { width: COL_WIDTHS[i] } as any]}
          >
            {c.filterable ? (
              <FilterBox
                value={filters[c.key as string] || ""}
                onChange={(t) => setFilters({ ...filters, [c.key as string]: t })}
              />
            ) : null}
          </View>
        ))}
      </View>
    ),
    [filters]
  );
if (Platform.OS === 'web')
  return (
    <>
      {/* Botão Criar */}
      <View>
        <Pressable
          style={[Style.buttonSecondary, styles.buttonMpPrimary, styles.shadow]}
          onPress={() => setCreateVisible(true)}
        >
          <Text style={Style.textButtonSecondary}>Criar</Text>
        </Pressable>
      </View>

      {/* Tabela */}
      <View style={styles.pagePad}>
        <View style={styles.tableBox}>
          {Header}
          {FilterRow}

          {filtered.map((p, idx) => (
            <View
              key={p.id}
              style={[
                styles.dataRow,
                idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
              ]}
            >
              {COLS.map((c, i) => {
           if (c.key === "acao") {
  return (
    <View
      key={`${p.id}-acao`}
      style={[styles.actionCell, { width: COL_WIDTHS[i] } as any]}
    >
      <View style={styles.actionRow}>
        {/* Ver Stock primeiro */}
        <Pressable
          style={[
            Style.buttonSecondary,
            styles.btnSmallReset,
            styles.btnSmall,
            styles.shadow,
          ]}
          onPress={() => {
            setViewStockId(p.id);
            setViewStockVisible(true);
          }}
        >
          <Text style={Style.textButtonSecondary}>Ver Stock</Text>
        </Pressable>

        {/* Editar depois, com espaçamento à esquerda */}
        <Pressable
          style={[
            Style.buttonSecondary,
            Style.editButton,
            styles.btnSmallReset,
            styles.btnSmall,
            styles.shadow,
            { marginLeft: 8 },
          ]}
          onPress={() => setEditId(p.id)}
        >
          <Text style={Style.textButtonSecondary}>Editar</Text>
        </Pressable>
      </View>
    </View>
  );
}


                const val =
                  c.key === "ativo"
                    ? (p.ativo ? "Ativo" : "Inativo")
                    : String((p as any)[c.key] ?? "");

                return (
                  <View
                    key={`${p.id}-${c.key}`}
                    style={[styles.dataCell, { width: COL_WIDTHS[i] } as any]}
                  >
                    <CellText text={val} />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Modais */}
      <SafeAreaView style={{ flex: 1 }}>
        <CriarProdutoModal
          visible={createVisible}
          onClose={() => {
            setCreateVisible(false);
            load();
          }}
        />
        {editId !== null && (
          <EditarProdutoModal
            produtoId={editId}
            visible={true}
            onClose={() => {
              setEditId(null);
              load();
            }}
          />
        )}
        {viewStockId !== null && (
          <VerStockModal
            produtoId={viewStockId}
            visible={viewStockVisible}
            onClose={() => {
              setViewStockVisible(false);
              setViewStockId(null);
            }}
          />
        )}
      </SafeAreaView>
    </>
        );
else
    return (
        <SafeAreaView>
            {products &&
                <FlatList data={products}
                    renderItem={({ item }) => <Item key={item.id} item={item} />} />
            }
        </SafeAreaView>
    );
};

export default ManutencaoProdutos;

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

const ROW_BORDER = "#e6e6e6";
const HEADER_BG = "#f5f5f5";

const ROW_H = 56;
const FILTER_H = 40;

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
    },
  pagePad: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },

  tableBox: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: ROW_BORDER,
    backgroundColor: "#fff",
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: HEADER_BG,
    borderBottomWidth: 1,
    borderColor: ROW_BORDER,
    minHeight: ROW_H,
  },
  headerCell: {
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerText: { fontWeight: "700", color: "#000" },

  filterRow: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderColor: ROW_BORDER,
    minHeight: FILTER_H,
  },
  filterCell: {
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  filterInput: {
    height: FILTER_H - 10,
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: ROW_BORDER,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    outlineStyle: "none" as any,
  },
  filterInputFocused: {
    borderColor: ACCENT,
    ...(Platform.OS === "web" ? { boxShadow: `0 0 0 2px ${ACCENT}20` } : null),
  },

  dataRow: {
    flexDirection: "row",
    minHeight: ROW_H,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: ROW_BORDER,
  },
  dataCell: {
    paddingHorizontal: 13,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  cellText: { color: "#111" },

  actionCell: {
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
  actionRow: { flexDirection: "row", alignItems: "center" },

  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#fbfbfb" },

  btnSmallReset: {
    marginTop: 0,
    marginBottom: 0,
    marginVertical: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  btnSmall: {
    height: 32,
    minWidth: 86,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    outlineStyle: "none" as any,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
