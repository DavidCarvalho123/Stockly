import { GetLinhasByPedido, ProcessLines } from "@/libs/Requests";
import Style from "@/libs/Style";
import { LinhaForm, LinhaFormResponse, LinhaTratarShow } from "@/models/Pedidos";
import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useClickOutside } from "react-native-click-outside";

// ---- Tabela (WEB) ----
var COLS = [
  { key: "idx",           label: "#",                             flex: 0.7 },
  { key: "ean",           label: "EAN",                           flex: 1.8 },
  { key: "estadoInicial", label: "Estado Inicial",                flex: 1.6 },
  { key: "estadoFinal",   label: "Estado Final",                  flex: 1.6 },
  { key: "qPed",          label: "Quantidade Pedida",             flex: 1.6 },
  { key: "qTransf",       label: "Quantidade a Transferir",       flex: 2.0 },
  { key: "check",         label: "Preencher quantidades pedidas", flex: 2.2 },
];



type Props = {
  visible: boolean;
  pedidoId: number | null;
  onClose: () => void;
  inHistorico: boolean;
};

const TratarPedidoModal: React.FC<Props> = ({ visible, pedidoId, onClose, inHistorico }) => {
  const [linhasPedido, setLinhasPedido] = useState<LinhaTratarShow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [qTransf1, setQTransf1] = useState<LinhaForm[]>([]);
  const [response, setResponse] = useState<LinhaFormResponse[]>([]);
  const refOutside = useClickOutside<View>(() => {
      Keyboard.dismiss();
    });
  if(inHistorico){
    COLS[5].flex = 0;
  }
  else{
    COLS[5].flex = 2.0;
  }
  const TOTAL_FLEX = COLS.reduce((s, c) => s + c.flex, 0);
  const COLW = COLS.map((c) => `${(c.flex / TOTAL_FLEX) * 100}%`);

  // Checkbox no cabeçalho
  const [autoFill, setAutoFill] = useState<boolean>(false);

  const load = async () => {
    try{
      if(pedidoId !== null){
        const result = await GetLinhasByPedido(pedidoId);
        setLinhasPedido(result);      
      }
    }catch(e){
      console.error("Erro a carregar linhas do pedido");
    }
    
  }

  useEffect(() => {
    load();
  }, [visible, pedidoId]);

  useEffect(() => {
    console.log(linhasPedido)
    if(linhasPedido !== undefined){
      if(Platform.OS === 'web'){
        var a = linhasPedido.map((item) => {return {id:item.idLinha, quantity:0} })
        setQTransf1(a)
      }
      else{
        var a = linhasPedido.map((item) => {return {id:item.idLinha, quantity:item.quantidadePedida} })
        setQTransf1(a)
      }
    }
  }, [linhasPedido])

  const handleAutoFill = () => {
    // Se ativo, preencher qTransf com qPed; senão, voltar a 0
    const newQs = qTransf1.map(item => {
      if(autoFill)
        return { id: item.id, quantity: linhasPedido.find(l => l.idLinha == item.id)?.quantidadePedida?? 0}
      else
        return {id: item.id, quantity: 0 }
    })
    setQTransf1(newQs);
    setAutoFill(!autoFill);
  }

  const handleSubmit = async () => {
    setIsProcessing(true);
    try{
      if(pedidoId !== null){
        const respRaw = await ProcessLines(pedidoId, qTransf1);
        if(respRaw.status >= 200 && respRaw.status < 300){
          const res = await respRaw.json() as LinhaFormResponse[];
          setResponse(res);
        }
      }
    }catch(e){
      console.error("Erro a efetuar transferência.")

    }
    finally{
      setIsProcessing(false);
    }
  }

  const handleQty = (idLinha:number, increaser: number) => {
     const newQ = qTransf1.map(ite => {
        if(ite.id === idLinha)
          return {...qTransf1, id: ite.id, quantity: ite.quantity > 0 || ite.quantity == 0 && increaser > 0 ? ite.quantity + (increaser) : ite.quantity}
        else
          return {...qTransf1, id: ite.id, quantity: ite.quantity}
      })
      setQTransf1(newQ);
  }


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
                <TextInput
                    readOnly={true}
                    style={[wStyles.inputMobile, wStyles.viewOnly]}
                    value={linhasPedido[0]?.estadoInicial?? ''}
                />
              </View>
              <View style={mStyles.block}>
                <Text style={mStyles.label}>Estado Final:</Text>
                <TextInput
                    readOnly={true}
                    style={[wStyles.inputMobile, wStyles.viewOnly]}
                    value={linhasPedido[0]?.estadoFinal?? ''}
                />
              </View>
            </View>

            {/* Linhas (mock) */}
            <ScrollView>
              <View ref={refOutside}>
                {linhasPedido && linhasPedido?.map((item, i) => (
                  <View  key={i} >
                    <View style={mStyles.lineRow}>
                      <Text style={mStyles.index}>{i+1}.</Text>
                      <Text style={mStyles.eanText}>{item.ean}</Text>

                      {/* Stepper visual */}
                      <View style={mStyles.stepper}>
                        <TextInput
                          style={wStyles.inputMobileQty}
                          inputMode="numeric"
                          keyboardType="numeric"
                          value={String(qTransf1.find(q => q.id == item.idLinha)?.quantity?? 0)}
                          onChangeText={(v) => {
                            const n = Math.max(0, parseInt(v || "0", 10) || 0);
                            const newQ = qTransf1.map(ite => {
                              if(ite.id === item.idLinha)
                                return {...qTransf1, id: ite.id, quantity: n}
                              else
                                return {...qTransf1, id: ite.id, quantity: ite.quantity}
                            })
                            setQTransf1(newQ);
                          }}
                        />
                        <View style={mStyles.stepperArrows}>
                          <TouchableOpacity onPress={() => {handleQty(item.idLinha, 1)}} >
                            <Text style={[mStyles.arrow, {marginBottom: 5}]}><AntDesign name="up" size={16} color="black" /></Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => {handleQty(item.idLinha, -1)}} >
                            <Text style={mStyles.arrow}><AntDesign name="down" size={16} color="black" /></Text>
                          </TouchableOpacity>
                        </View>
                        
                      </View>
                    </View>
                    <View style={{marginLeft: '12%'}}>
                      {response.find(r => r.id == item.idLinha)?.processado ? <Text style={{fontSize: 12}}>Processado!</Text> : 
                        response.find(r => r.id == item.idLinha) !== undefined ?<Text style={wStyles.errorText}>{response.find(r => r.id == item.idLinha)?.error}</Text>: 
                        item.tratado ? <Text style={{fontSize: 12}}>Processado</Text> : ''}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Ações */}
            <View style={mStyles.actions}>
              <TouchableOpacity style={[Style.buttonSecondary, mStyles.btnPrimary]} onPress={handleSubmit}>
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
  else{
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={wStyles.overlay}>
          <View style={wStyles.modal}>
            {inHistorico && <Text style={wStyles.title}>Pedido #{pedidoId}</Text>}
            {!inHistorico && <Text style={wStyles.title}>Tratar Pedido #{pedidoId}</Text>}
  
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
                {!inHistorico && <View style={[wStyles.headerCell, { width: COLW[5] } as any]}>
                  <Text style={wStyles.headerText}>{COLS[5].label}</Text>
                </View>}
  
                {/* Coluna da checkbox no CABEÇALHO */}
                {inHistorico && 
                <View style={[wStyles.headerCell, { width: COLW[6], flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 } as any]}>
                  <Text style={wStyles.headerText}>Estado</Text>
                </View>}
                {!inHistorico && <View style={[wStyles.headerCell, { width: COLW[6], flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 } as any]}>
                  <Text style={wStyles.headerText}>{COLS[6].label}</Text>
                  <TouchableOpacity
                    onPress={handleAutoFill}
                    style={[wStyles.checkbox, autoFill ? wStyles.checkboxOn : null]}
                  >
                    {autoFill ? <Text style={wStyles.checkMark}>✓</Text> : null}
                  </TouchableOpacity>
                </View>}
              </View>
  
              {/* Corpo — uma linha mock, agora com INPUT na coluna qTransf */}
              <ScrollView style={{ maxHeight: 420 }}>
                {linhasPedido.map((item,i) => (
                  <View key={i} style={[wStyles.dataRow, wStyles.rowAlt]}>
                    <View style={[wStyles.cell, { width: COLW[0] } as any]}>
                      <Text>{i+1}</Text>
                    </View>
                    <View style={[wStyles.cell, { width: COLW[1] } as any]}>
                      <Text selectable>{item.ean}</Text>
                    </View>
                    <View style={[wStyles.cell, { width: COLW[2] } as any]}>
                      <Text>{item.estadoInicial}</Text>
                    </View>
                    <View style={[wStyles.cell, { width: COLW[3] } as any]}>
                      <Text>{item.estadoFinal}</Text>
                    </View>
                    <View style={[wStyles.cell, { width: COLW[4], justifyContent: "center", alignItems: "flex-end" } as any, inHistorico ? {alignItems:'center'}: {}]}>
                      <Text>{item.quantidadePedida}</Text>
                    </View>
                    {!inHistorico && <View style={[wStyles.cell, { width: COLW[5] } as any]}>
                      <TextInput
                        style={wStyles.input}
                        inputMode="numeric"
                        keyboardType="numeric"
                        value={String(qTransf1.find(q => q.id == item.idLinha)?.quantity?? 0)}
                        onChangeText={(v) => {
                          const n = Math.max(0, parseInt(v || "0", 10) || 0);
                          const newQ = qTransf1.map(ite => {
                            if(ite.id === item.idLinha)
                              return {...qTransf1, id: ite.id, quantity: n}
                            else
                              return {...qTransf1, id: ite.id, quantity: ite.quantity}
                          })
                          setQTransf1(newQ);
                        }}
                      />
                    </View>}
                    <View style={[wStyles.cell, { width: COLW[6], alignItems: "center" } as any]}>
                      {response.find(r => r.id == item.idLinha)?.processado ? <Text>Processado!</Text> : 
                        response.find(r => r.id == item.idLinha) !== undefined ?<Text style={wStyles.errorText}>{response.find(r => r.id == item.idLinha)?.error}</Text>: 
                        item.tratado ? <Text>Processado</Text> : ''}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
  
            {/* Botões */}
            <View style={wStyles.footer}>
              {!inHistorico && <TouchableOpacity style={[Style.buttonSecondary, wStyles.btn]} onPress={handleSubmit}>
                <Text style={Style.textButtonSecondary}>Transferir</Text>
              </TouchableOpacity>}
              <ActivityIndicator size="large" animating={isProcessing} style={{justifyContent: 'flex-start'}}  />
              <TouchableOpacity style={[Style.buttonPrimary, wStyles.btn]} onPress={onClose}>
                <Text style={Style.textButtonPrimary}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // --- WEB UI (tabela + checkbox no cabeçalho + inputs na coluna qTransf + botões) ---
  

};

export default TratarPedidoModal;

/* ===== WEB STYLES ===== */
const ROW_H = 56;
const HEADER_BG = "#f5f5f5";
const ROW_BORDER = "#e6e6e6";

const wStyles = StyleSheet.create({
  inputMobile: { backgroundColor: "#F5F7FA", padding: 10, borderRadius: 6, borderWidth: 1, borderColor: "#E0E0E0", height: 44 },
  inputMobileQty: { backgroundColor: "#F5F7FA", padding: 10, borderRadius: 6, borderWidth: 1, borderColor: "#E0E0E0", height: 44, width: 50 },
  viewOnly: {
      backgroundColor: '#ecececff'
  },
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", alignItems: "center", padding: 10,
  },
  errorText: { fontSize: 12, color: "#EB5757", marginTop: 4 },
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
  fakeInput: { height: 40, borderRadius: 6 },

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
