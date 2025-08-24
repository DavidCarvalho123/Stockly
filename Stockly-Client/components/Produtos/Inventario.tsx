import { Colours } from "@/libs/Constants";
import { GetAllLocals, GetStocksInventory } from "@/libs/Requests";
import { StocksInventario } from "@/models/Stocks";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <Text style={styles.label}>
    {text}{required ? <Text style={styles.required}> *</Text> : null}
  </Text>
);

const CellText: React.FC<{ text: string }> = ({ text }) => (
  <Text selectable numberOfLines={1} ellipsizeMode="tail" style={styles.cellText}>
    {text}
  </Text>
);
const COLS: { key: keyof StocksInventario | "acao"; label: string; flex: number; filterable?: boolean }[] = [
  { key: "ean",          label: "EAN",          flex: 1.6, filterable: true },
  { key: "nome",         label: "Nome",         flex: 2.0, filterable: true },
  { key: "stockAnt1",    label: "Stock Anterior Frente de Loja", flex: 0.8, filterable: false },
  { key: "stockPic1",  label: "Stock Picado Frente de Loja",      flex: 0.8, filterable: false },
  { key: "stockReal1",   label: "Stock Real Frente de Loja",  flex: 0.8, filterable: false },
  { key: "stockAnt2",          label: "Stock Anterior Armazém",          flex: 0.8, filterable: false },
  { key: "stockPic2",        label: "Stock Picado Armazém",        flex: 0.8, filterable: false },
  { key: "stockReal2",         label: "Stock Real Armazém",             flex: 0.8, filterable: false }, // ↑ mais largo para 2 botões
];
const TOTAL_FLEX = COLS.reduce((s, c) => s + c.flex, 0);
const COL_WIDTHS = COLS.map((c) => `${(c.flex / TOTAL_FLEX) * 100}%`);
const ACCENT = Colours.stocklyBlue;

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

const Inventario:React.FC = () => {
    const [localizacoes, setLocalizacoes] = useState<{ id: number; nome: string }[]>([]);
    const [stocksProd, setStocksProds] = useState<StocksInventario[]>([]);
    const [filtered, setFiltered] = useState<StocksInventario[]>([]);
    const [filters, setFilters] = useState<Record<string, string>>({});

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [selectedLocal, setSelectedLocal] = useState<number>()

    useEffect(() => {
        (async () => {
          try {
            const locals = await GetAllLocals();
            setLocalizacoes(locals);
          } catch (e) {
            console.error("Erro a carregar locais:", e);
          }
        })();
      }, []);

      useEffect(() => {
        (async () => {
            try{
                if(selectedLocal !== undefined){
                    const data = await GetStocksInventory(selectedLocal as number);
                    if(data !== null){
                        setStocksProds(data);
                        setFiltered(data);
                    }
                }
            }
            catch(e){
                console.error("Erro a carregar detalhes: ", e);
            }
        })();
      }, [selectedLocal])

    const onchangeLocals = (itemValue: any, itemIndex: number) => {
        setSelectedLocal(itemIndex)
    }


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
      useEffect(() => {
          const f = stocksProd.filter((p) =>
            COLS.every((c) => {
              if (!c.filterable) return true;
              const v = (filters[c.key as string] || "").trim().toLowerCase();
              if (!v) return true;
              const cell = String((p as any)[c.key] ?? "").toLowerCase();
              return cell.includes(v);
            })
          );
          setFiltered(f);
        }, [filters, stocksProd]);
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
    return ( 
        <>
            <View>

                <View style={styles.inputTopSide}>
                    <View style={styles.inputWrapper}>
                        <Label text="Localização" />
                        <View style={[
                            styles.pickerBox,
                            focusedField === "localizacoes" && styles.inputFocused
                        ]}>
                            <Picker
                                onValueChange={onchangeLocals}
                                style={styles.pickerInner}
                                dropdownIconColor="#5F5F5F"
                                onFocus={() => setFocusedField("localizacoes")}
                                onBlur={() => setFocusedField(null)}
                                >
                                <Picker.Item label="" value="" />
                                {localizacoes.map((loc) => (
                                    <Picker.Item key={loc.id} label={loc.nome} value={String(loc.id)} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>

                <View>
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
                                const val = String((p as any)[c.key] ?? "");
                
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
                </View>

            </View>
        </>
    );
}

export default Inventario;

const ROW_BORDER = "#e6e6e6";
const HEADER_BG = "#f5f5f5";

const ROW_H = 56;
const FILTER_H = 40;
const styles = StyleSheet.create({
    inputTopSide: {
        marginLeft: 30,
        marginTop: 20
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
    pagePad: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },

  tableBox: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: ROW_BORDER,
    backgroundColor: "#fff",
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
  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#fbfbfb" },

  headerText: { fontWeight: "700", color: "#000" },
 overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 10 },
  modal: { backgroundColor: "#FFF", borderRadius: 12, padding: 20, width: "70%", maxHeight: "90%" },
  title: { fontSize: 20, fontWeight: "700", color: "black", marginBottom: 10, textAlign: "center", paddingBottom: 20 },
  form: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  inputWrapper: { width: "15%", marginBottom: 15 },
  label: { fontSize: 14, color: "#1A1A1A", marginBottom: 4 },
  required: { color: "#EB5757" },
  inputError: { borderColor: "#EB5757" },
  input: {
    backgroundColor: "#F5F7FA",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: 44,
    outlineStyle: "none" as any,
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  inputFocused: {
    borderColor: Colours.stocklyBlue,
    borderWidth: 2,
    outlineStyle: "none" as any,
    outlineWidth: 0,
    outlineColor: "transparent",
    ...(Platform.OS === "web" ? { boxShadow: `0 0 0 2px ${Colours.stocklyBlue}20` } : null),
  },
  pickerBox: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    height: 44,
    justifyContent: "center",
    outlineStyle: "none" as any,
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  pickerError: { borderColor: "#EB5757", borderWidth: 1.5 },
  errorText: { fontSize: 12, color: "#EB5757", marginTop: 4 },
  pickerInner: { height: 44 },
  checkboxWrapper: { width: "100%", marginTop: 10, marginBottom: 15 },
  checkboxContainer: { flexDirection: "row", alignItems: "center" },
  checkboxLabel: { marginLeft: 8, fontSize: 14, color: "#1A1A1A" },
  actions: { flexDirection: "row", justifyContent: "flex-start", marginTop: 20, gap: 20 },
  buttonPrimary: {},
  buttonSecondary: {},
  textPrimary: { color: "#fff", paddingHorizontal: 20 },
  textSecondary: { paddingHorizontal: 20 },
});