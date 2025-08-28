import { GetAllLocals, GetAllStates, GetStocksByProduto } from "@/libs/Requests";
import Style from "@/libs/Style";
import React, { useEffect, useMemo, useState } from "react";
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
  produtoId: number;
  onClose: () => void;
};

type StockRow = {
  localizacaoId: number;
  localizacaoNome: string;
  estadoId: number;
  estadoNome: string; // <- será preenchido com Estado1
  quantidade: number;
};

const VerStockModal: React.FC<Props> = ({ visible, produtoId, onClose }) => {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    (async () => {
      try {
        // 1) Stocks brutos do produto
        const raw = await GetStocksByProduto(produtoId);

        // 2) Listas de locais e estados (arrays)
        //    - Localizacoes/GetAllLocalizacoes -> [{ Id, Nome }]
        //    - Estados/GetAllEstados          -> [{ Id, Estado1 }]
        
        const [localsArr, statesArr] = await Promise.all([
          GetAllLocals(),
          GetAllStates()
        ]);

        // 3) Construir dicionários de lookup
        const locMap = new Map<number, string>();
        (localsArr ?? []).forEach((l) => {
          const id = (l?.Id ?? l?.id) as number;
          const nome = (l?.Nome ?? l?.nome) as string;
          if (id != null) locMap.set(id, nome ?? `Local ${id}`);
        });

        const estMap = new Map<number, string>();
        
        (statesArr ?? []).forEach((e) => {
          const id = (e?.Id ?? e?.id) as number;
          // inclui também 'estado1' (camelCase por defeito no ASP.NET Core)
          const nome = (e?.Estado1 ?? e?.estado1 ?? e?.nome ?? e?.estado ?? e?.Estado) as string;
        if (id != null) estMap.set(id, nome ?? `Estado ${id}`);
        });
        
        // 4) Normalizar stocks e enriquecer com nomes
        const norm = (r: any) => {
          const idLoc =
            r?.idLocalizacao ?? r?.IdLocalizacao ?? r?.localizacaoId ?? r?.LocalizacaoId;
          const idEst =
            r?.idEstado ?? r?.IdEstado ?? r?.estado ?? r?.Estado ?? r?.estadoId ?? r?.EstadoId;
          const qtd = (r?.quantidade ?? r?.Quantidade ?? 0) as number;
          return { idLoc, idEst, qtd };
        };

        const enriched: StockRow[] = (Array.isArray(raw) ? raw : []).map((item: any) => {
          const { idLoc, idEst, qtd } = norm(item);
          const locNome = locMap.get(Number(idLoc)) ?? `Local ${idLoc ?? "?"}`;
          const estNome = estMap.get(Number(idEst)) ?? `Estado ${idEst ?? "?"}`;
          return {
            localizacaoId: Number(idLoc ?? 0),
            localizacaoNome: locNome,
            estadoId: Number(idEst ?? 0),
            estadoNome: estNome, // <- aqui fica o Estado1
            quantidade: Number(qtd ?? 0),
          };
        });

        setRows(enriched);
      } catch (e) {
        console.error("Erro no VerStockModal:", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, produtoId]);

  // Agrupar por localização e ordenar por estado
  const grouped = useMemo(() => {
    const m = new Map<number, { nome: string; linhas: StockRow[] }>();
    
    rows.forEach((r) => {
      const g = m.get(r.localizacaoId) ?? { nome: r.localizacaoNome, linhas: [] };
      g.linhas.push(r);
      m.set(r.localizacaoId, g);
    });
    return Array.from(m.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => ({
        nome: v.nome,
        linhas: v.linhas.sort((x, y) => x.estadoId - y.estadoId),
      }));
  }, [rows]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal,Platform.OS === 'web' ? {width: '20%'} : {width: '90%'}]}>
          <Text style={styles.title}>Stock por Localização</Text>

          <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
            {loading ? (
              <Text style={{ textAlign: "center", color: "#666" }}>A carregar…</Text>
            ) : grouped.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#666" }}>Sem dados de stock.</Text>
            ) : (
              grouped.map((loc, idx) => (
                <View key={`loc-${idx}`} style={styles.locBlock}>
                  <Text style={styles.locTitle}>{loc.nome}</Text>

                  <View style={[styles.row, styles.head]}>
                    <Text style={[styles.cellEstado, styles.headText]}>Estado</Text>
                    <Text style={[styles.cellQtd, styles.headText]}>Quantidade</Text>
                  </View>

                  {loc.linhas.map((l, i) => (
                    <View
                      key={`ln-${idx}-${i}`}
                      style={[styles.row, i % 2 ? styles.rowAlt : null]}
                    >
                      <Text style={styles.cellEstado}>{l.estadoNome}</Text>
                      <Text style={styles.cellQtd}>{l.quantidade}</Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={[Style.buttonPrimary, styles.btn]} onPress={onClose}>
              <Text style={Style.textButtonPrimary}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default VerStockModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modal: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
    textAlign: "center",
  },
  locBlock: {
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    overflow: "hidden",
  },
  locTitle: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "700",
    color: "#111",
    backgroundColor: "#f7f7f7",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  row: { flexDirection: "row", alignItems: "center", minHeight: 40, paddingHorizontal: 12 },
  rowAlt: { backgroundColor: "#fbfbfb" },
  head: { backgroundColor: "#f0f0f0", borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  headText: { fontWeight: "700", color: "#111" },
  cellEstado: { flex: 2, paddingVertical: 8 },
  cellQtd: { flex: 1, paddingVertical: 8, textAlign: "right" },
  actions: { marginTop: 14, flexDirection: "row", justifyContent: "center" },
  btn: { minWidth: 120, alignSelf: "center" },
});
