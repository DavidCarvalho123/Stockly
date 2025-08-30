import Style from "@/libs/Style";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ---- Tabela (WEB) ----
const COLS = [
  { key: "idx",           label: "#",                             flex: 0.7 },
  { key: "ean",           label: "EAN",                           flex: 1.8 },
  { key: "estadoInicial", label: "Estado Inicial",                flex: 1.6 },
  { key: "estadoFinal",   label: "Estado Final",                  flex: 1.6 },
  { key: "qPed",          label: "Quantidade Pedida",             flex: 1.6 },
  { key: "qTransf",       label: "Quantidade a Transferir",       flex: 2.0 },
  { key: "check",         label: "Preencher quantidades pedidas", flex: 2.2 },
] as const;

const TOTAL_FLEX = COLS.reduce((s, c) => s + c.flex, 0);
const COLW = COLS.map((c) => `${(c.flex / TOTAL_FLEX) * 100}%`);

type Props = {
  visible: boolean;
  pedidoId: number | null;
  onClose: () => void;
};

const TratarPedidoModal: React.FC<Props> = ({ visible, pedidoId, onClose }) => {
  if (!visible || !pedidoId) return null;

  // --- MOBILE UI (iOS/Android) ---
  if (Platform.OS !== "web") {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={mStyles.overlay}>
          <View style={mStyles.modal}>
            <Text style={mStyles.title}>Pedido Nr: {String(pedidoId).padStart(6, "0")}</Text>

            {/* Linha com “inputs” visuais (apenas layout) */}
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

            {/* Linhas (mock) */}
            <View style={{ marginTop: 18 }}>
              {[1, 2].map((n) => (
                <View key={n} style={mStyles.lineRow}>
                  <Text style={mStyles.index}>{n}.</Text>
                  <Text style={mStyles.eanText}>xxx xxx xxx xxx xxx</Text>

                  {/* Stepper visual */}
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

  // --- WEB UI (tabela + checkbox no cabeçalho + inputs na coluna qTransf + botões) ---

  // Mock da linha (igual ao ficheiro anterior): qPed fixo e qTransf editável.
  const qPed1 = 5;
  const [qTransf1, setQTransf1] = useState<number>(0);

  // Checkbox no cabeçalho
  const [autoFill, setAutoFill] = useState<boolean>(false);

  useEffect(() => {
    // Se ativo, preencher qTransf com qPed; senão, voltar a 0
    setQTransf1(autoFill ? qPed1 : 0);
  }, [autoFill]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={wStyles.overlay}>
        <View style={wStyles.modal}>
          <Text style={wStyles.title}>Tratar Pedido #{pedidoId}</Text>

          <View style={wStyles.table}>
            {/* Cabeçalho */}
            <View style={wStyles.headerRow}>
              {/* As primeiras colunas são só texto */}
              <View style={[wStyles.headerCell, { width: COLW[0] } as any]}>
                <Text style={wStyles.headerText}>{COLS[0].label}</Text>
              </View>
              <View style={[wStyles.headerCell, { width: COLW[1] } as any]}>
                <Text style={wStyles.headerText}>{COLS[1].label}</Text>
              </View>
              <View style={[wStyles.headerCell, { width: COLW[2] } as any]}>
                <Text style={wStyles.headerText}>{COLS[2].label}</Text>
              </View>
              <View style={[wStyles.headerCell, { width: COLW[3] } as any]}>
                <Text style={wStyles.headerText}>{COLS[3].label}</Text>
              </View>
              <View style={[wStyles.headerCell, { width: COLW[4] } as any]}>
                <Text style={wStyles.headerText}>{COLS[4].label}</Text>
              </View>
              <View style={[wStyles.headerCell, { width: COLW[5] } as any]}>
                <Text style={wStyles.headerText}>{COLS[5].label}</Text>
              </View>

              {/* Coluna da checkbox no CABEÇALHO */}
              <View style={[wStyles.headerCell, { width: COLW[6], flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 } as any]}>
                <Text style={wStyles.headerText}>{COLS[6].label}</Text>
                <TouchableOpacity
                  onPress={() => setAutoFill((v) => !v)}
                  style={[wStyles.checkbox, autoFill ? wStyles.checkboxOn : null]}
                >
                  {autoFill ? <Text style={wStyles.checkMark}>✓</Text> : null}
                </TouchableOpacity>
              </View>
            </View>

            {/* Corpo — uma linha mock, agora com INPUT na coluna qTransf */}
            <ScrollView style={{ maxHeight: 420 }}>
              <View style={[wStyles.dataRow, wStyles.rowAlt]}>
                <View style={[wStyles.cell, { width: COLW[0] } as any]}>
                  <Text>1</Text>
                </View>
                <View style={[wStyles.cell, { width: COLW[1] } as any]}>
                  <Text selectable>1234567890123</Text>
                </View>
                <View style={[wStyles.cell, { width: COLW[2] } as any]}>
                  <Text>Disponível</Text>
                </View>
                <View style={[wStyles.cell, { width: COLW[3] } as any]}>
                  <Text>Exposição</Text>
                </View>
                <View style={[wStyles.cell, { width: COLW[4], justifyContent: "center", alignItems: "flex-end" } as any]}>
                  <Text>{qPed1}</Text>
                </View>
                <View style={[wStyles.cell, { width: COLW[5] } as any]}>
                  <TextInput
                    style={wStyles.input}
                    inputMode="numeric"
                    keyboardType="numeric"
                    value={String(qTransf1)}
                    onChangeText={(v) => {
                      const n = Math.max(0, parseInt(v || "0", 10) || 0);
                      setQTransf1(n);
                    }}
                  />
                </View>
                <View style={[wStyles.cell, { width: COLW[6], alignItems: "center" } as any]}>
                  {/* VAZIO – a checkbox foi movida para o cabeçalho */}
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Botões */}
          <View style={wStyles.footer}>
            <TouchableOpacity style={[Style.buttonSecondary, wStyles.btn]} onPress={onClose}>
              <Text style={Style.textButtonSecondary}>Transferir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[Style.buttonPrimary, wStyles.btn]} onPress={onClose}>
              <Text style={Style.textButtonPrimary}>Cancelar</Text>
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

  dataRow: {
    flexDirection: "row",
    minHeight: ROW_H, alignItems: "center",
    borderBottomWidth: 1, borderColor: ROW_BORDER,
  },
  rowAlt: { backgroundColor: "#fbfbfb" },
  cell: { paddingHorizontal: 12, justifyContent: "center" },

  input: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F7FA",
    width: 120,
    textAlign: "right",
    outlineStyle: "none" as any,
  },

  placeholder: { padding: 16, textAlign: "center", color: "#666" },

  footer: {
    marginTop: 16, flexDirection: "row", justifyContent: "center", gap: 16,
  },
  btn: { minWidth: 140, marginBottom: 0 },

  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: "#bbb",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOn: {
    backgroundColor: "rgba(109, 206, 255, 1.00)",
    borderColor: "rgba(109, 206, 255, 1.00)",
  },
  checkMark: { color: "#fff", fontWeight: "700" },
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
  fakeInput: { height: 40, borderRadius: 6, backgroundColor: "#ddd" },

  lineRow: {
    flexDirection: "row", alignItems: "center",
    marginTop: 20, gap: 10,
  },
  index: { width: 20, textAlign: "right", marginRight: 8, color: "#111" },
  eanText: { flex: 1, color: "#111" },

  stepper: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepperValue: {
    width: 32, height: 32, backgroundColor: "#ddd", borderRadius: 4,
    textAlign: "center", textAlignVertical: "center", lineHeight: 32, color: "#111",
  },
  stepperArrows: { height: 32, justifyContent: "space-between" },
  arrow: { color: "#666", fontSize: 12, textAlign: "center" },

  actions: { marginTop: 28, flexDirection: "row", justifyContent: "space-between" },
  btnPrimary: { minWidth: 140, alignSelf: "center" },
});
