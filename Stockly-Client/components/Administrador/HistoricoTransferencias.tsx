import { Colours } from "@/libs/Constants";
import { GetAllHistorico, GetPedidoByLinha } from "@/libs/Requests";
import Style from "@/libs/Style";
import { HistoricoManutencao } from "@/models/HistoricoTransferencias";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import TratarPedidoModal from "../Modals/TratarPedidoModal";

// ---- Definição única das colunas ----
const COLS: { key: keyof HistoricoManutencao | "acao"; label: string; flex: number; filterable?: boolean }[] = [
  { key: "localizacao",          label: "Localização",          flex: 1.6, filterable: true },
  { key: "produto",         label: "Produto",         flex: 2.0, filterable: true },
  { key: "estado", label: "Estado", flex: 1.0, filterable: true },
  { key: "stockInicial",  label: "Stock Inicial",      flex: 0.8, filterable: true },
  { key: "stockFinal",   label: "Stock Final",  flex: 0.8, filterable: true },
  { key: "justificativa",          label: "Justificativa",          flex: 2.8, filterable: true },
  { key: "data",        label: "Data",        flex: 1.2, filterable: true },
  { key: "acao",         label: "",             flex: 1.0, filterable: false }, // ↑ mais largo para 2 botões
];

const TOTAL_FLEX = COLS.reduce((s, c) => s + c.flex, 0);
const COL_WIDTHS = COLS.map((c) => `${(c.flex / TOTAL_FLEX) * 100}%`);
const ACCENT = Colours.stocklyBlue;

/* ---------- Utilitários ---------- */
const CellText: React.FC<{ text: string }> = ({ text }) => (
  <Text selectable  style={[styles.cellText, {wordWrap:'normal'}]}>
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
      style={[styles.filterInput, focused && styles.filterInputFocused, Platform.OS !== 'web' ? {width: '60%', display: 'flex', flexDirection: 'row', marginBottom: 20, height: 40} : '']}
      placeholder={placeholder}
      placeholderTextColor="#777"
      value={value}
      onChangeText={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
    };

const HistoricoTransferencias:React.FC = () => {
    const [historico, setHistorico] = useState<HistoricoManutencao[]>([]);
    const [filtered, setFiltered] = useState<HistoricoManutencao[]>([]);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [treatOpen, setTreatOpen] = useState(false);
    const [selected, setSelected] = useState<number | null>(null);

    const load = async () => {
    const data = await GetAllHistorico();
    if (data) {
        setHistorico(data as HistoricoManutencao[]);
        setFiltered(data as HistoricoManutencao[]);
    }
    };
    
    useEffect(() => { load(); }, []);

    useEffect(() => {
        const f = historico.filter((p) =>
        COLS.every((c) => {
            if (!c.filterable) return true;
            const v = (filters[c.key as string] || "").trim().toLowerCase();
            if (!v) return true;
            const cell = String((p as any)[c.key] ?? "").toLowerCase();
            return cell.includes(v);
        })
        );
        setFiltered(f);
    }, [filters, historico]);
    
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

    const handleVerPedido = async (linhaPedidoId: number | null | undefined) => {
        if(linhaPedidoId !== null && linhaPedidoId !== undefined){
            // id do pedido
            const idPedido = await GetPedidoByLinha(linhaPedidoId);
            if(idPedido !== null){
                setSelected(idPedido);
                setTreatOpen(true);
            }
        }
    }


if(Platform.OS === 'web')
    return ( 
        <>
            {/* Tabela */}
      <View style={styles.pagePad}>
        <ScrollView>
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
            if (c.key === "acao" && p.idLinhaPedido !== null) {
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
                            handleVerPedido(p.idLinhaPedido)
                        }}
                      >
                        <Text style={Style.textButtonSecondary}>Ver Pedido</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }
               const val = c.key === 'data' ? String((p as any)[c.key]).replace("T"," ") : String((p as any)[c.key] ?? "");
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
        </ScrollView>
      </View>

      {/* Modais */}
            <TratarPedidoModal
                visible={treatOpen}
                pedidoId={selected?? null}
                onClose={() => { setTreatOpen(false); setSelected(null)  }}
                inHistorico={true}
            />
        </>
    );
}

export default HistoricoTransferencias;


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