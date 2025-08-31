import CriarPedidoModal from "@/components/Modals/CriarPedidoModal";
import TratarPedidoModal from "@/components/Modals/TratarPedidoModal";
import { Colours } from "@/libs/Constants";
import { GetAllPedidos } from "@/libs/Requests";
import Style from "@/libs/Style";
import type { PedidosTransferencia } from "@/models/Pedidos";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable, ScrollView, StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

// ---- Definição das colunas (web) ----
const COLS: { key: keyof PedidosTransferencia | "acao"; label: string; flex: number; filterable?: boolean }[] = [
  { key: "id",             label: "Nr Pedido",      flex: 1.3, filterable: true },
  { key: "origem",         label: "Origem",         flex: 2.0, filterable: true },
  { key: "destino",        label: "Destino",        flex: 2.0, filterable: true },
  { key: "estadoInicial",  label: "Estado Inicial", flex: 1.5, filterable: true },
  { key: "estadoFinal",    label: "Estado Final",   flex: 1.5, filterable: true },
  { key: "observacoes",    label: "Observações",    flex: 2.2, filterable: true },
  { key: "concluido",      label: "Concluído",      flex: 1.2, filterable: true },
  { key: "acao",           label: "",               flex: 1.5, filterable: false },
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

const FilterBox: React.FC<{ value: string; onChange: (t: string) => void; placeholder?: string }> = ({
  value, onChange, placeholder = "Filtrar",
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[
        styles.filterInput,
        focused && styles.filterInputFocused,
        Platform.OS !== "web" ? { width: "60%", marginBottom: 12, height: 40 } : null,
      ]}
      placeholder={placeholder}
      placeholderTextColor="#777"
      value={value}
      onChangeText={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

const Pedidos: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);

  const [rows, setRows] = useState<PedidosTransferencia[]>([]);
  const [filtered, setFiltered] = useState<PedidosTransferencia[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [treatOpen, setTreatOpen] = useState(false);
  const [selected, setSelected] = useState<PedidosTransferencia | null>(null);

  const load = async () => {
    const data = await GetAllPedidos();
    setRows(data || []);
    setFiltered(data || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const f = rows.filter((r) =>
      COLS.every((c) => {
        if (!c.filterable) return true;
        const v = (filters[c.key as string] || "").trim().toLowerCase();
        if (!v) return true;
        const cell = String((r as any)[c.key] ?? "").toLowerCase();
        return cell.includes(v);
      }),
    );
    setFiltered(f);
  }, [filters, rows]);

  const Header = useMemo(
    () => (
      <View style={styles.headerRow}>
        {COLS.map((c, i) => (
          <View key={`h-${c.key}`} style={[styles.headerCell, { width: COL_WIDTHS[i] } as any]}>
            <Text style={styles.headerText}>{c.label}</Text>
          </View>
        ))}
      </View>
    ),
    [],
  );

  const FilterRow = useMemo(
    () => (
      <View style={styles.filterRow}>
        {COLS.map((c, i) => (
          <View key={`f-${c.key}`} style={[styles.filterCell, { width: COL_WIDTHS[i] } as any]}>
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
    [filters],
  );

  // --- Layout WEB ---
  const WebTable = () => (
    <View style={styles.pagePad}>
      <ScrollView>
        <View style={styles.tableBox}>
          {Header}
          {FilterRow}

          {filtered.map((p, idx) => (
            <View key={String(p.id)} style={[styles.dataRow, idx % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
              {COLS.map((c, i) => {
                if (c.key === "acao") {
                  return (
                    <View key={`${p.id}-acao`} style={[styles.actionCell, { width: COL_WIDTHS[i] } as any]}>
                      <Pressable
                        style={[Style.buttonSecondary, styles.btnSmall, styles.shadow, styles.tratar]}
                        onPress={() => { setSelected(p); setTreatOpen(true); }}
                      >
                        <Text style={Style.textButtonSecondary}>Tratar</Text>
                      </Pressable>
                    </View>
                  );
                }
                const val = c.key === "concluido" ? (p.concluido ? "Sim" : "Não") : String((p as any)[c.key] ?? "");
                return (
                  <View key={`${p.id}-${c.key}`} style={[styles.dataCell, { width: COL_WIDTHS[i] } as any]}>
                    <CellText text={val} />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // --- Layout MOBILE: cartões; tocar no número abre modal ---
  const MobileList = () => (
    <FlatList
      data={filtered}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Pressable onPress={() => { setSelected(item); setTreatOpen(true); }}>
            <Text style={styles.cardTitle}>Pedido #{String(item.id)}</Text>
          </Pressable>
          <Text style={styles.cardLine}><Text style={styles.bold}>Origem:</Text> {String(item.origem ?? "")}</Text>
          <Text style={styles.cardLine}><Text style={styles.bold}>Destino:</Text> {String(item.destino ?? "")}</Text>
          <Text style={styles.cardLine}><Text style={styles.bold}>Inicial:</Text> {String(item.estadoInicial ?? "")}</Text>
          <Text style={styles.cardLine}><Text style={styles.bold}>Final:</Text> {String(item.estadoFinal ?? "")}</Text>
        </View>
      )}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Botão Criar Pedido */}
      <View>
        <Pressable style={[Style.buttonSecondary, styles.btnCreate, styles.shadow]} onPress={() => setCreateOpen(true)}>
          <Text style={Style.textButtonSecondary}>Criar Pedido</Text>
        </Pressable>
      </View>

      {Platform.OS === "web" ? <WebTable /> : <MobileList />}

      {/* Modal Criar */}
      <CriarPedidoModal
        visible={createOpen}
        onClose={() => { setCreateOpen(false); load(); }}
      />

      {/* Modal Tratar */}
      <TratarPedidoModal
        visible={treatOpen}
        pedidoId={selected?.id ?? null}
        onClose={() => { setTreatOpen(false); setSelected(null);load(); }}
        inHistorico={false}
      />
    </View>
  );
};

export default Pedidos;

/* ====== ESTILOS ====== */
const ROW_BORDER = "#e6e6e6";
const HEADER_BG = "#f5f5f5";
const ROW_H = 56;
const FILTER_H = 40;

const styles = StyleSheet.create({
  btnCreate: {
    width: 160, borderRadius: 20, padding: 12, marginTop: 20, marginLeft: 20,
  },
  pagePad: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },

  tableBox: {
    width: "100%", borderRadius: 8, overflow: "hidden",
    borderWidth: 1, borderColor: ROW_BORDER, backgroundColor: "#fff",
  },

  headerRow: {
    flexDirection: "row", backgroundColor: HEADER_BG,
    borderBottomWidth: 1, borderColor: ROW_BORDER, minHeight: ROW_H,
  },
  headerCell: { paddingHorizontal: 8, justifyContent: "center", alignItems: "flex-start" },
  headerText: { fontWeight: "700", color: "#000" },

  filterRow: {
    flexDirection: "row", backgroundColor: "#fafafa",
    borderBottomWidth: 1, borderColor: ROW_BORDER, minHeight: FILTER_H,
  },
  filterCell: { paddingHorizontal: 5, justifyContent: "center", alignItems: "flex-start" },
  filterInput: {
    height: FILTER_H - 10, width: "100%", backgroundColor: "#fff",
    borderWidth: 1, borderColor: ROW_BORDER, borderRadius: 6,
    paddingHorizontal: 10, fontSize: 13, outlineStyle: "none" as any,
  },
  filterInputFocused: {
    borderColor: ACCENT,
    ...(Platform.OS === "web" ? { boxShadow: `0 0 0 2px ${ACCENT}20` } : null),
  },

  dataRow: {
    flexDirection: "row", minHeight: ROW_H, alignItems: "center",
    borderBottomWidth: 1, borderColor: ROW_BORDER
  },
  dataCell: { paddingHorizontal: 13, justifyContent: "center", alignItems: "flex-start" },
  cellText: { color: "#111" },

  actionCell: { alignSelf: "stretch", justifyContent: "center", alignItems: "center" },

  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#fbfbfb" },

  btnSmall: {
    height: 32, minWidth: 92, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, alignItems: "center", justifyContent: "center",
    alignSelf: "center", outlineStyle: "none" as any,
  },
  shadow: {
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  tratar: { marginBottom: 0 },

  // Mobile cards
  card: {
    backgroundColor: "#fff", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: "#eee", marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16, fontWeight: "700", color: Colours.stocklyBlue,
    marginBottom: 6, textDecorationLine: "underline",
  },
  cardLine: { color: "#111", marginBottom: 2 },
  bold: { fontWeight: "700" },
});
