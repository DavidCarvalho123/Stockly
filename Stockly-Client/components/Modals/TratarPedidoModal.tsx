import Style from "@/libs/Style";
import React from "react";
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  pedidoId: number | null;
  onClose: () => void;
};

// ---- Tabela (WEB) ----
const COLS = [
  { key: "idx",           label: "#",                           flex: 0.7 },
  { key: "ean",           label: "EAN",                         flex: 1.8 },
  { key: "estadoInicial", label: "Estado Inicial",              flex: 1.6 },
  { key: "estadoFinal",   label: "Estado Final",                flex: 1.6 },
  { key: "qPed",          label: "Quantidade Pedida",           flex: 1.6 },
  { key: "qTransf",       label: "Quantidade a Transferir",     flex: 2.0 },
  { key: "check",         label: "Preencher quantidades pedidas", flex: 2.2 },
] as const;

const TOTAL_FLEX = COLS.reduce((s, c) => s + c.flex, 0);
const COLW = COLS.map((c) => `${(c.flex / TOTAL_FLEX) * 100}%`);

const TratarPedidoModal: React.FC<Props> = ({ visible, pedidoId, onClose }) => {
  if (!visible || !pedidoId) return null;

  // --- MOBILE UI (iOS/Android) ---
  if (Platform.OS !== "web") {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={mStyles.overlay}>
          <View style={mStyles.modal}>
            <Text style={mStyles.title}>Pedido Nr: {String(pedidoId).padStart(6, "0")}</Text>

            {/* Linha com os dois “inputs” visuais (Estado Inicial / Estado Final) */}
            <View style={mStyles.rowTop}>
              <View style={mStyles.block}>
                <Text style={mStyles.label}>Estado Inicial:</Text>
                <View style={mStyles.fakeInput} />
              </View>
              <View style={mStyles.block}>
                <Text style={mStyles.label}>Estado Final:</Text>
                <View style={mStyles.fakeInput} />
              </View>
            </View>

            {/* Lista de linhas (apenas UI / placeholders) */}
            <View style={{ marginTop: 18 }}>
              {[1, 2].map((n) => (
                <View key={n} style={mStyles.lineRow}>
                  <Text style={mStyles.index}>{n}.</Text>
                  <Text style={mStyles.eanText}>xxx xxx xxx xxx xxx</Text>

                  {/* Stepper visual à direita da EAN */}
                  <View style={mStyles.stepper}>
                    <Text style={mStyles.stepperValue}>1</Text>
                    <View style={mStyles.stepperArrows}>
                      <Text style={mStyles.arrow}>^</Text>
                      <Text style={mStyles.arrow}>v</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Ações */}
            <View style={mStyles.actions}>
              <TouchableOpacity style={[Style.buttonSecondary, mStyles.btnPrimary]} onPress={onClose}>
                <Text style={Style.textButtonSecondary}>Transferir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[Style.buttonPrimary, mStyles.btnPrimary]} onPress={onClose}>
                <Text style={Style.textButtonPrimary}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // --- WEB UI (tabela com cabeçalho apenas) ---
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={wStyles.overlay}>
        <View style={wStyles.modal}>
          <Text style={wStyles.title}>Tratar Pedido #{pedidoId}</Text>

          <View style={wStyles.table}>
            {/* Cabeçalho */}
            <View style={wStyles.headerRow}>
              {COLS.map((c, i) => (
                <View key={`h-${c.key}`} style={[wStyles.headerCell, { width: COLW[i] } as any]}>
                  <Text style={wStyles.headerText}>{c.label}</Text>
                </View>
              ))}
            </View>

            {/* Corpo vazio (placeholder) */}
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={wStyles.placeholder}>Sem linhas (apenas cabeçalho).</Text>
            </ScrollView>
          </View>

          <View style={wStyles.footer}>
            <TouchableOpacity style={[Style.buttonPrimary, wStyles.btn]} onPress={onClose}>
              <Text style={Style.textButtonPrimary}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TratarPedidoModal;

/* ===== WEB STYLES ===== */
const ROW_H = 56;
const HEADER_BG = "#f5f5f5";
const ROW_BORDER = "#e6e6e6";

const wStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", alignItems: "center", padding: 10,
  },
  modal: {
    backgroundColor: "#FFF", borderRadius: 12, padding: 20,
    width: "80%", maxWidth: 1200, maxHeight: "90%",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 12, textAlign: "center" },
  table: {
    width: "100%", borderRadius: 8, overflow: "hidden",
    borderWidth: 1, borderColor: ROW_BORDER, backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row", backgroundColor: HEADER_BG, borderBottomWidth: 1,
    borderColor: ROW_BORDER, minHeight: ROW_H, alignItems: "center",
  },
  headerCell: { paddingHorizontal: 8, justifyContent: "center" },
  headerText: { fontWeight: "700", color: "#000" },
  placeholder: { padding: 16, textAlign: "center", color: "#666" },
  footer: { marginTop: 16, alignItems: "center" },
  btn: { minWidth: 140 },
});

/* ===== MOBILE STYLES ===== */
const mStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", alignItems: "center", padding: 10,
  },
  modal: {
    backgroundColor: "#FFF", borderRadius: 12, padding: 20,
    width: "95%", maxHeight: "90%",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 18, textAlign: "left" },
  rowTop: {
    flexDirection: "row", justifyContent: "space-between", gap: 16,
  },
  block: { flex: 1 },
  label: { fontSize: 14, color: "#111", marginBottom: 8 },
  fakeInput: {
    height: 40, borderRadius: 6, backgroundColor: "#ddd",
  },

  lineRow: {
    flexDirection: "row", alignItems: "center",
    marginTop: 20, gap: 10,
  },
  index: { width: 20, textAlign: "right", marginRight: 8, color: "#111" },
  eanText: { flex: 1, color: "#111" },

  stepper: {
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  stepperValue: {
    width: 32, height: 32, backgroundColor: "#ddd", borderRadius: 4,
    textAlign: "center", textAlignVertical: "center", lineHeight: 32, color: "#111",
  },
  stepperArrows: { height: 32, justifyContent: "space-between" },
  arrow: { color: "#666", fontSize: 12, textAlign: "center" },

  actions: {
    marginTop: 28, flexDirection: "row", justifyContent: "space-between",
  },
  btnPrimary: {
    minWidth: 140, alignSelf: "center",
  },
});
