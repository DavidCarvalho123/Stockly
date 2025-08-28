import {
  CreatePedido,
  GetAllLocals,
  GetAllStates,
  GetNextPedidoNumero,
  GetProdutoByEAN,
  GetStocksByProduto,
} from "@/libs/Requests";
import Style from "@/libs/Style";
import { Picker } from "@react-native-picker/picker";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Local = { id: number; nome: string };
type Estado = { id: number; nome: string };

type Linha = {
  key: number;
  ean: string;
  produtoId?: number;
  nomeProduto?: string;
  quantidade: string;
  disponivel?: number;
  aviso?: string | null;
  errEAN?: string | null;
};

const BOX = "#F5F7FA";
const BORDER = "#E0E0E0";
const ACCENT = "rgba(109, 206, 255, 1)";
const DANGER = "#EB5757";

const onlyDigits = (s: string) => (s || "").replace(/[^\d]/g, "");
const EMPTY_LINE = (k: number): Linha => ({ key: k, ean: "", quantidade: "", aviso: null, errEAN: null });
const webClickable: any = Platform.OS === "web" ? { cursor: "pointer" } : null;

/** Linha memoizada: EAN é local (não-controlado) e só faz commit no onBlur */
const LineItem = memo(function LineItem(props: {
  idx: number;
  ln: Linha;
  onCommitEAN: (key: number, v: string) => void;
  onChangeQtd: (key: number, v: string) => void;
  onRemove: (key: number) => void;
}) {
  const { idx, ln, onCommitEAN, onChangeQtd, onRemove } = props;

  const [eanLocal, setEanLocal] = useState<string>(ln.ean ?? "");
  useEffect(() => setEanLocal(ln.ean ?? ""), [ln.ean, ln.key]);

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={[styles.linhaRow, { gap: 8 }]}>
        <Text style={styles.linhaIndex}>{idx + 1}.</Text>

      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
  <TextInput
    style={[styles.input, ln.errEAN ? styles.inputError : null, { flex: 1 }]}
    placeholder="EAN"
    inputMode={Platform.OS === "web" ? "numeric" : undefined}
    keyboardType={Platform.OS === "web" ? "numeric" : "number-pad"}
    value={eanLocal}
    onChangeText={setEanLocal}
    onBlur={() => onCommitEAN(ln.key, eanLocal.trim())}
    blurOnSubmit={false}
  />
  {Platform.OS !== "web" && (
    <TouchableOpacity
      style={styles.btnScan}
      onPress={() => Alert.alert("Scan EAN", "Funcionalidade em implementação")}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>📷</Text>
    </TouchableOpacity>
  )}
</View>
{!!ln.errEAN && <Text style={styles.errorText}>{ln.errEAN}</Text>}


        <TextInput
          style={[styles.input, styles.inputQtd]}
          placeholder="1"
          inputMode={Platform.OS === "web" ? "numeric" : undefined}
          keyboardType={Platform.OS === "web" ? "numeric" : "number-pad"}
          value={ln.quantidade}
          onChangeText={(t) => onChangeQtd(ln.key, t)}
          blurOnSubmit={false}
        />

        <TouchableOpacity style={[styles.btnRemove, webClickable]} onPress={() => onRemove(ln.key)}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>X</Text>
        </TouchableOpacity>
      </View>

      {!!ln.nomeProduto && (
        <Text style={styles.prodInfo}>
          {ln.nomeProduto}
          {ln.disponivel != null ? ` • Disponível: ${ln.disponivel}` : ""}
        </Text>
      )}
      {!!ln.aviso && <Text style={styles.warn}>{ln.aviso}</Text>}
    </View>
  );
});

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CriarPedidoModal: React.FC<Props> = ({ visible, onClose }) => {
  const [locais, setLocais] = useState<Local[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [pedidoNumero, setPedidoNumero] = useState<number>(1);

  const [destinoId, setDestinoId] = useState<number | undefined>();
  const [estadoInicialId, setEstadoInicialId] = useState<number | undefined>();
  const [estadoFinalId, setEstadoFinalId] = useState<number | undefined>();

  const [linhas, setLinhas] = useState<Linha[]>([EMPTY_LINE(1)]);
  const [submitting, setSubmitting] = useState(false);

  // Quando abrir o modal, carregar dados e reset
  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const [locsRaw, estsRaw, nextNr] = await Promise.all([
          GetAllLocals(),
          GetAllStates(),
          GetNextPedidoNumero(),
        ]);

        const locs: Local[] = (locsRaw || []).map((l: any) => ({
          id: l.id ?? l.Id,
          nome: l.nome ?? l.Nome,
        }));
        setLocais(locs);

        const ests: Estado[] = Array.isArray(estsRaw)
          ? estsRaw.filter(Boolean).map((e: any) => ({
              id: e.id ?? e.Id,
              nome: e.Estado ?? e.estado1 ?? e.nome ?? e.Nome ?? `Estado ${e.id ?? e.Id}`,
            }))
          : [];
        setEstados(ests);

        setPedidoNumero(nextNr ?? 1);
        // limpa seleções/linhas ao abrir
        setDestinoId(undefined);
        setEstadoInicialId(undefined);
        setEstadoFinalId(undefined);
        setLinhas([EMPTY_LINE(1)]);
      } catch (e) {
        console.error("Erro a carregar dados do pedido:", e);
      }
    })();
  }, [visible]);

  const destinoNome = useMemo(
    () => locais.find((x) => x.id === destinoId)?.nome ?? "",
    [locais, destinoId]
  );

  const handleCommitEAN = useCallback((key: number, value: string) => {
    setLinhas((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((l) => l.key === key);
      if (idx >= 0) copy[idx] = { ...copy[idx], ean: value, errEAN: null };
      return copy;
    });
  }, []);

  const handleChangeQtd = useCallback((key: number, v: string) => {
    setLinhas((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((l) => l.key === key);
      if (idx < 0) return copy;

      const ln = copy[idx];
      const vv = onlyDigits(v);
      const q = Number(vv || 0);
      const disp = Number(ln.disponivel ?? 0);

      copy[idx] = {
        ...ln,
        quantidade: vv,
        aviso: ln.produtoId ? (q > disp ? `Pedido (${q}) > disponível (${disp})` : null) : ln.aviso,
      };

      const isLast = idx === copy.length - 1;
      const preenchida = (ln.ean || "").trim().length > 0 && q > 0;
      if (isLast && preenchida) copy.push(EMPTY_LINE(copy[copy.length - 1].key + 1));
      return copy;
    });
  }, []);

  const addLinha = useCallback(() => {
    setLinhas((prev) => [...prev, EMPTY_LINE(prev[prev.length - 1].key + 1)]);
  }, []);

  const handleRemoveLinha = useCallback((key: number) => {
    setLinhas((prev) => {
      let next = prev.filter((l) => l.key !== key);
      if (next.length === 0) next = [EMPTY_LINE(1)];
      return next;
    });
  }, []);

  const limpar = useCallback(() => {
    setDestinoId(undefined);
    setEstadoInicialId(undefined);
    setEstadoFinalId(undefined);
    setLinhas([EMPTY_LINE(1)]);
  }, []);

  const onSubmit = useCallback(async () => {
    if (!destinoId || !estadoInicialId || !estadoFinalId) {
      Alert.alert("Campos obrigatórios", "Seleciona destino, estado inicial e estado final.");
      return;
    }

    const alvo = [...linhas];
    let houveErros = false;
    const avisos: string[] = [];

    await Promise.all(
      alvo.map(async (ln, i) => {
        const q = Number(ln.quantidade || 0);
        const ean = (ln.ean || "").trim();
        if (!ean && q === 0) return;

        if (!ean) {
          alvo[i] = { ...ln, errEAN: "Campo obrigatório" };
          houveErros = true;
          return;
        }

        const p = await GetProdutoByEAN(ean);
        if (!p?.id) {
          alvo[i] = { ...ln, errEAN: "EAN inválido", produtoId: undefined, nomeProduto: undefined, disponivel: 0 };
          houveErros = true;
          return;
        }

        let disponivel = 0;
        try {
          const rows = await GetStocksByProduto(p.id);
          const norm = (rows || []).map((r: any) => ({
            loc: r.IdLocalizacao ?? r.idLocalizacao ?? r.localizacaoId,
            est: r.Estado ?? r.IdEstado ?? r.estadoId ?? r.estado,
            qtd: r.Quantidade ?? r.quantidade ?? 0,
          }));
          const match = norm.find(
            (r: any) => Number(r.loc) === Number(destinoId) && Number(r.est) === Number(estadoInicialId)
          );
          disponivel = Number(match?.qtd ?? 0);
        } catch {
          disponivel = 0;
        }

        const aviso = q > disponivel ? `Pedido (${q}) > disponível (${disponivel})` : null;
        if (aviso) avisos.push(`EAN ${ean}: ${aviso}`);

        alvo[i] = {
          ...ln,
          errEAN: null,
          produtoId: p.id,
          nomeProduto: p.nome,
          disponivel,
          aviso,
        };
      })
    );

    setLinhas(alvo);

    if (houveErros) {
      Alert.alert("Validação", "Revê os EAN inválidos assinalados a vermelho.");
      return;
    }

    const linhasValidas = alvo
      .filter((l) => l.produtoId && Number(l.quantidade) > 0)
      .map((l) => ({ produtoId: l.produtoId!, quantidade: Number(l.quantidade), ean: l.ean }));

    if (linhasValidas.length === 0) {
      Alert.alert("Sem linhas", "Adiciona pelo menos uma linha com EAN e quantidade.");
      return;
    }

    if (avisos.length > 0) {
      Alert.alert("Avisos", avisos.join("\n"));
    }

    try {
      setSubmitting(true);
      const resp = await CreatePedido({
        destinoId,
        estadoInicialId,
        estadoFinalId,
        linhas: linhasValidas,
      });
      Alert.alert("Sucesso", `Pedido #${resp?.numero ?? ""} criado.`);
      // prepara próximo
      const nextNr = await GetNextPedidoNumero();
      setPedidoNumero(nextNr);
      limpar();
      onClose(); // fecha modal
    } catch (e) {
      console.error("Erro a criar pedido:", e);
      Alert.alert("Erro", "Não foi possível criar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }, [destinoId, estadoInicialId, estadoFinalId, linhas, limpar, onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modal}>
          <Text style={styles.title}>Criar Pedido</Text>
          <Text style={styles.subtitle}>Pedido Nr: {pedidoNumero}</Text>

          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Destino</Text>
            <View style={[styles.pickerBox, Platform.OS === "web" && webClickable]}>
              <Picker selectedValue={destinoId} onValueChange={(v) => setDestinoId(v)} style={styles.pickerInner}>
                <Picker.Item label="-- Seleciona --" value={undefined} />
                {locais.map((l) => (
                  <Picker.Item key={l.id} label={l.nome} value={l.id} />
                ))}
              </Picker>
            </View>

            <View style={[styles.row2, { gap: 16 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Estado Inicial</Text>
                <View style={[styles.pickerBox, Platform.OS === "web" && webClickable]}>
                  <Picker selectedValue={estadoInicialId} onValueChange={(v) => setEstadoInicialId(v)} style={styles.pickerInner}>
                    <Picker.Item label="-- Seleciona --" value={undefined} />
                    {estados.map((e) => (
                      <Picker.Item key={e.id} label={e.nome} value={e.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Estado Final</Text>
                <View style={[styles.pickerBox, Platform.OS === "web" && webClickable]}>
                  <Picker selectedValue={estadoFinalId} onValueChange={(v) => setEstadoFinalId(v)} style={styles.pickerInner}>
                    <Picker.Item label="-- Seleciona --" value={undefined} />
                    {estados.map((e) => (
                      <Picker.Item key={e.id} label={e.nome} value={e.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              {linhas.map((ln, i) => (
                <LineItem
                  key={ln.key}
                  idx={i}
                  ln={ln}
                  onCommitEAN={handleCommitEAN}
                  onChangeQtd={handleChangeQtd}
                  onRemove={handleRemoveLinha}
                />
              ))}

              <TouchableOpacity onPress={addLinha} style={webClickable}>
                <Text style={styles.addLine}>Adicionar Linha…</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.actions, { gap: 16 }]}>
              <TouchableOpacity
                style={[Style.buttonSecondary, styles.btnSubmit, { backgroundColor: ACCENT }, webClickable]}
                onPress={onSubmit}
                disabled={submitting}
              >
                <Text style={Style.textButtonSecondary}>Submeter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[Style.buttonPrimary, styles.btnCancel, webClickable]}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={Style.textButtonPrimary}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CriarPedidoModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 10 },
  modal: { backgroundColor: "#FFF", borderRadius: 12, padding: 20, width: Platform.select({ web: "30%", default: "90%" }), maxHeight: "90%" },
  title: { fontSize: 20, fontWeight: "700", color: "#111", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 10, marginTop: 4 },

  form: { paddingVertical: 8 },

  label: { fontSize: 14, color: "#111", marginBottom: 6 },

  pickerBox: {
    backgroundColor: BOX,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    height: 44,
    justifyContent: "center",
    marginBottom: 12,
    outlineStyle: "none" as any,
    outlineWidth: 0,
    outlineColor: "transparent",
    ...(Platform.OS === "web" ? { boxShadow: "none" as any } : null),
  },
  pickerInner: { height: 44 },

  row2: { flexDirection: "row", flexWrap: "wrap" },

  input: {
    backgroundColor: BOX,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 10,
    outlineStyle: "none" as any,
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  inputError: { borderColor: DANGER, borderWidth: 1.5 },
  errorText: { fontSize: 12, color: DANGER, marginTop: 4 },

  inputQtd: { width: 64, textAlign: "center" },

  linhaRow: { flexDirection: "row", alignItems: "center" },
  linhaIndex: { width: 24, textAlign: "right", color: "#444" },

  btnRemove: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
  },

  prodInfo: { marginTop: 4, color: "#555" },
  warn: { marginTop: 4, color: "#E53935", fontSize: 12 },

  addLine: { color: ACCENT, marginTop: 6 },

  actions: { flexDirection: "row", justifyContent: "flex-start", marginTop: 16 },
  btnSubmit: { paddingHorizontal: 22 },
  btnCancel: { paddingHorizontal: 22 },

btnScan: {
  marginLeft: 6,
  width: 40,
  height: 40,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: ACCENT,
},
});
