import React, { useEffect, useState } from "react";
import { Checkbox } from "react-native-paper";
import Style from "@/libs/Style";
import { Controller, useForm } from "react-hook-form";
import { ProdutoForm } from "@/models/Produtos";
import { GetProdutoById, EditarProduto, GetAllSuppliers, GetAllDepartments } from "@/libs/Requests";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colours } from "@/libs/Constants";

type Props = {
  produtoId: number;
  visible: boolean;
  onClose: () => void;
};

// sombra cross-platform
const shadow = {
  ...Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    android: { elevation: 5 },
    web: { boxShadow: "0 2px 6px rgba(0,0,0,0.25)" as any },
  }),
};

const unidades = ["Unidade", "Kg", "Litro", "Caixa"];
const ivaOptions = ["6", "13", "23"];

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <Text style={styles.label}>
    {text}{required ? <Text style={styles.required}> *</Text> : null}
  </Text>
);

const EditarProdutoModal: React.FC<Props> = ({ produtoId, visible, onClose }) => {
  const { control, handleSubmit, reset, formState: { errors } } =
    useForm<ProdutoForm>({ defaultValues: { ativo: false } as any });

  const [departamentos, setDepartamentos] = useState<{ id: number; nome: string }[]>([]);
  const [fornecedores, setFornecedores] = useState<{ id: number; nome: string }[]>([]);

  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        const [deps, sups, produto] = await Promise.all([
          GetAllDepartments(),
          GetAllSuppliers(),
          GetProdutoById(produtoId)
        ]);

        setDepartamentos(deps);
        setFornecedores(sups);

        reset({
          nome: produto.nome ?? "",
          codigoEAN: produto.ean ?? "",
          departamento: String(produto.idDepartamento ?? ""),
          fornecedor: String(produto.idFornecedor ?? ""),
          unidade: produto.tipoUnidade ?? "",
          stockMinimo: produto.quantidadeMinimaPedido?.toString() ?? "",
          altura: produto.altura?.toString() ?? "",
          largura: produto.largura?.toString() ?? "",
          comprimento: produto.comprimento?.toString() ?? "",
          precoCompra: produto.precoCompra?.toString() ?? "",
          precoVenda: produto.precoVenda?.toString() ?? "",
          iva: produto.iva?.toString() ?? "",
          ativo: !!produto.ativo,
        });
      } catch (e) {
        console.error("Erro a carregar produto:", e);
      }
    })();
  }, [visible, produtoId, reset]);

  const onSubmit = async (formData: ProdutoForm) => {
    try {
      await EditarProduto(produtoId, formData);
      onClose();
    } catch (e) {
      console.error("Erro ao editar produto:", e);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modal}>
          <Text style={styles.title}>Editar Produto</Text>

          <ScrollView contentContainerStyle={styles.form}>
            {/* Nome */}
            <View style={styles.inputWrapper}>
              <Label text="Nome" required />
              <Controller
                control={control}
                name="nome"
                rules={{ required: "Campo obrigatório" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.nome && styles.inputError]}
                    placeholder="Nome do produto"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.nome && <Text style={styles.errorText}>{errors.nome.message}</Text>}
            </View>

            {/* Código EAN */}
            <View style={styles.inputWrapper}>
              <Label text="Código EAN" required />
              <Controller
                control={control}
                name="codigoEAN"
                rules={{ required: "Campo obrigatório" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.codigoEAN && styles.inputError]}
                    placeholder="EAN único"
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.codigoEAN && <Text style={styles.errorText}>{errors.codigoEAN.message}</Text>}
            </View>

            {/* Departamento */}
            <View style={styles.inputWrapper}>
              <Label text="Departamento" required />
              <View style={[styles.pickerBox, errors.departamento && styles.pickerError]}>
                <Controller
                  control={control}
                  name="departamento"
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.pickerInner}
                      dropdownIconColor="#5F5F5F"
                    >
                      <Picker.Item label="-- Selecione --" value="" />
                      {departamentos.map((dep) => (
                        <Picker.Item key={dep.id} label={dep.nome} value={String(dep.id)} />
                      ))}
                    </Picker>
                  )}
                />
              </View>
              {errors.departamento && <Text style={styles.errorText}>{errors.departamento.message as string}</Text>}
            </View>

            {/* Fornecedor */}
            <View style={styles.inputWrapper}>
              <Label text="Fornecedor" required />
              <View style={[styles.pickerBox, errors.fornecedor && styles.pickerError]}>
                <Controller
                  control={control}
                  name="fornecedor"
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.pickerInner}
                      dropdownIconColor="#5F5F5F"
                    >
                      <Picker.Item label="-- Selecione --" value="" />
                      {fornecedores.map((f) => (
                        <Picker.Item key={f.id} label={f.nome} value={String(f.id)} />
                      ))}
                    </Picker>
                  )}
                />
              </View>
              {errors.fornecedor && <Text style={styles.errorText}>{errors.fornecedor.message as string}</Text>}
            </View>

            {/* Unidade */}
            <View style={styles.inputWrapper}>
              <Label text="Unidade" required />
              <View style={[styles.pickerBox, errors.unidade && styles.pickerError]}>
                <Controller
                  control={control}
                  name="unidade"
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.pickerInner}
                      dropdownIconColor="#5F5F5F"
                    >
                      <Picker.Item label="-- Selecione --" value="" />
                      {unidades.map((u) => (
                        <Picker.Item key={u} label={u} value={u} />
                      ))}
                    </Picker>
                  )}
                />
              </View>
              {errors.unidade && <Text style={styles.errorText}>{errors.unidade.message as string}</Text>}
            </View>

            {/* IVA */}
            <View style={styles.inputWrapper}>
              <Label text="IVA" required />
              <View style={[styles.pickerBox, errors.iva && styles.pickerError]}>
                <Controller
                  control={control}
                  name="iva"
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.pickerInner}
                      dropdownIconColor="#5F5F5F"
                    >
                      <Picker.Item label="-- Selecione --" value="" />
                      {ivaOptions.map((i) => (
                        <Picker.Item key={i} label={`${i}%`} value={i} />
                      ))}
                    </Picker>
                  )}
                />
              </View>
              {errors.iva && <Text style={styles.errorText}>{errors.iva.message as string}</Text>}
            </View>

            {/* Preços, Stock, Dimensões */}
            {[
              { name: "precoCompra", label: "Preço Compra", required: true },
              { name: "precoVenda", label: "Preço Venda", required: true },
              { name: "stockMinimo", label: "Stock Mínimo" },
              { name: "altura", label: "Altura" },
              { name: "largura", label: "Largura" },
              { name: "comprimento", label: "Comprimento" },
            ].map((f) => (
              <View style={styles.inputWrapper} key={f.name}>
                <Label text={f.label} required={!!f.required} />
                <Controller
                  control={control}
                  name={f.name as keyof ProdutoForm}
                  rules={{
                    required: f.required ? "Campo obrigatório" : false,
                    validate: (v) => (v && isNaN(Number(v)) ? "Deve ser numérico" : true),
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        (errors as any)[f.name] && styles.inputError,
                      ]}
                      placeholder="0"
                      keyboardType="numeric"
                      onChangeText={onChange}
                      value={value as string}
                    />
                  )}
                />
                {(errors as any)[f.name] && (
                  <Text style={styles.errorText}>{(errors as any)[f.name]?.message?.toString()}</Text>
                )}
              </View>
            ))}

            {/* Ativo */}
            <View style={styles.checkboxWrapper}>
              <Controller
                control={control}
                name="ativo"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.checkboxContainer}>
                    <Checkbox status={value ? "checked" : "unchecked"} onPress={() => onChange(!value)} color={Colours.stocklyBlue} />
                    <Text style={styles.checkboxLabel}>Produto Ativo</Text>
                  </View>
                )}
              />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={[Style.buttonSecondary, styles.buttonPrimary, shadow]} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.textPrimary}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[Style.buttonPrimary, styles.buttonSecondary, shadow]} onPress={onClose}>
              <Text style={styles.textSecondary}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default EditarProdutoModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 10 },
  modal: { backgroundColor: "#FFF", borderRadius: 12, padding: 20, width: "70%", maxHeight: "90%" },
  title: { fontSize: 20, fontWeight: "700", color: "black", marginBottom: 10, textAlign: "center", paddingBottom: 20 },
  form: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  inputWrapper: { width: "48%", marginBottom: 15 },
  label: { fontSize: 14, color: "#1A1A1A", marginBottom: 4 },
  required: { color: "#EB5757" },
  input: { backgroundColor: "#F5F7FA", padding: 10, borderRadius: 6, borderWidth: 1, borderColor: "#E0E0E0", height: 44 },
  inputError: { borderColor: "#EB5757" },
  errorText: { fontSize: 12, color: "#EB5757", marginTop: 4 },
  pickerBox: { backgroundColor: "#F5F7FA", borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 6, height: 44, justifyContent: "center" },
  pickerError: { borderColor: "#EB5757", borderWidth: 1.5 },
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
