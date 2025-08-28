import { Colours } from "@/libs/Constants";
import { CriarLocalizacao, GetAllLocals } from "@/libs/Requests";
import Style from "@/libs/Style";
import { localizacaoForm } from "@/models/Localizacoes";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Checkbox } from "react-native-paper";

// sombra cross-platform
const shadow = {
  ...Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    android: { elevation: 5 },
    web: { boxShadow: "0 2px 6px rgba(0,0,0,0.25)" as any },
  }),
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

// Estado "vazio" do formulário
const EMPTY_FORM: localizacaoForm = {
  nome: "",
  morada: '',
  codPostal: '',
  localizacaoPai: 0,
  armazemCentral: false,
  sizeX: 0,
  sizeZ: 0
};

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <Text style={styles.label}>
    {text}{required ? <Text style={styles.required}> *</Text> : null}
  </Text>
);

const CriarLocalizacaoModal: React.FC<Props> = ({ visible, onClose }) => {
  const { control, handleSubmit, reset, formState: { errors } } =
    useForm<localizacaoForm>({ defaultValues: EMPTY_FORM });

  const [dropdownLocals, setDropdownLocals] = useState<{ id: number; nome: string }[]>();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Ao abrir o modal, limpa o formulário e carrega deps/sups
  useEffect(() => {
    if (!visible) return;
    reset(EMPTY_FORM);
    (async () => {
      try {
        const locals = await GetAllLocals();
        setDropdownLocals(locals)
      } catch (e) {
        console.error("Erro a carregar locais:", e);
      }
    })();
  }, [visible, reset]);

const onSubmit = async (formData: localizacaoForm) => {
  try {
    const created = await CriarLocalizacao(formData);

    reset(EMPTY_FORM);
    onClose();
  } catch (e) {
    console.error("Erro ao criar localização:", e);
  }
};

  const onCancel = () => {
    reset(EMPTY_FORM); // limpa ao cancelar
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modal}>
          <Text style={styles.title}>Criar Localização</Text>

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
                    style={[
                      styles.input,
                      errors.nome && styles.inputError,
                      focusedField === "nome" && styles.inputFocused,
                    ]}
                    placeholder="Nome da localização"
                    placeholderTextColor="#A0A0A0"
                    onBlur={() => { onBlur(); setFocusedField(null); }}
                    onFocus={() => setFocusedField("nome")}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.nome && <Text style={styles.errorText}>{errors.nome.message}</Text>}
            </View>

            
            <View style={styles.inputWrapper}>
              <Label text="Morada" required />
              <Controller
                control={control}
                name="morada"
                rules={{ required: "Campo obrigatório" }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.morada && styles.inputError,
                      focusedField === "morada" && styles.inputFocused,
                    ]}
                    placeholder="Morada"
                    placeholderTextColor="#A0A0A0"
                    onBlur={() => { onBlur(); setFocusedField(null); }}
                    onFocus={() => setFocusedField("morada")}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.morada && <Text style={styles.errorText}>{errors.morada.message}</Text>}
            </View>

            <View style={styles.inputWrapper}>
              <Label text="Código Postal" required />
              <Controller
                control={control}
                name="codPostal"
                rules={{ required: 'Campo não é um código postal válido', pattern: /^\d{4}-\d{3}$/i }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.codPostal && styles.inputError,
                      focusedField === "codPostal" && styles.inputFocused,
                    ]}
                    placeholder="1234-123"
                    placeholderTextColor="#A0A0A0"
                    onBlur={() => { onBlur(); setFocusedField(null); }}
                    onFocus={() => setFocusedField("codPostal")}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.codPostal && <Text style={styles.errorText}>{errors.codPostal.message}</Text>}
            </View>

            {/* Departamento */}
            <View style={styles.inputWrapper}>
              <Label text="Localização superior" />
              <View style={[
                styles.pickerBox,
                (errors.localizacaoPai && styles.pickerError) || null,
                focusedField === "departamento" && styles.inputFocused
              ]}>
                <Controller
                  control={control}
                  name="localizacaoPai"
                  rules={{ required: "Campo obrigatório" }}
                  render={({ field: { onChange, value } }) => (
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.pickerInner}
                      dropdownIconColor="#5F5F5F"
                      onFocus={() => setFocusedField("localizacaoPai")}
                      onBlur={() => setFocusedField(null)}
                    >
                      <Picker.Item label="-- Selecione --" value="" />
                      {dropdownLocals?.map((loc) => (
                        <Picker.Item key={loc.id} label={loc.nome} value={String(loc.id)} />
                      ))}
                    </Picker>
                  )}
                />
              </View>
              {errors.localizacaoPai && <Text style={styles.errorText}>{errors.localizacaoPai.message as string}</Text>}
            </View>

           {/* Ativo */}
            <View style={styles.checkboxWrapper}>
              <Controller
                control={control}
                name="armazemCentral"
                render={({ field: { value, onChange } }) => (
                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      status={value ? "checked" : "unchecked"}
                      onPress={() => onChange(!value)}
                      color={Colours.stocklyBlue}
                    />
                    <Text style={styles.checkboxLabel}>Armazém Central</Text>
                  </View>
                )}
              />
            </View>

            {/* Preços, Stock, Dimensões */}
            {[
              { name: "sizeX", label: "Comprimento" },
              { name: "sizeZ", label: "Largura" },
            ].map((f) => (
              <View style={styles.inputWrapper} key={f.name}>
                <Label text={f.label} />
                <Controller
                  control={control}
                  name={f.name as keyof localizacaoForm}
                  rules={{
                    validate: (v) => (v && isNaN(Number(v)) ? "Deve ser numérico" : true),
                  }}
                  render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        (errors as any)[f.name] && styles.inputError,
                        focusedField === f.name && styles.inputFocused,
                      ]}
                      placeholder="0"
                      placeholderTextColor="#A0A0A0"
                      keyboardType="numeric"
                      onChangeText={onChange}
                      value={value as string}
                      onBlur={() => { onBlur(); setFocusedField(null); }}
                      onFocus={() => setFocusedField(f.name)}
                    />
                  )}
                />
                {(errors as any)[f.name] && (
                  <Text style={styles.errorText}>{(errors as any)[f.name]?.message?.toString()}</Text>
                )}
              </View>
            ))}

            
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[Style.buttonSecondary, styles.buttonPrimary, shadow]}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.textPrimary}>Criar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[Style.buttonPrimary, styles.buttonSecondary, shadow]}
              onPress={onCancel}
            >
              <Text style={styles.textSecondary}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CriarLocalizacaoModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 10 },
  modal: { backgroundColor: "#FFF", borderRadius: 12, padding: 20, width: "70%", maxHeight: "90%" },
  title: { fontSize: 20, fontWeight: "700", color: "black", marginBottom: 10, textAlign: "center", paddingBottom: 20 },
  form: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  inputWrapper: { width: "48%", marginBottom: 15 },
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
