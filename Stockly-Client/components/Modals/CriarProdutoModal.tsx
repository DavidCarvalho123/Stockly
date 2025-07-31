

import React from 'react';
import { Checkbox } from 'react-native-paper';

import Style from "@/libs/Style";
import { Controller, useForm } from 'react-hook-form';
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
} from 'react-native';

export type ProdutoForm = {
  nome: string;
  codigoEAN: string;
  departamento: string;
  fornecedor: string;
  unidade: string;
  stockMinimo: string;
  altura: string;
  comprimento: string;
  largura: string;
  precoCompra: string;
  precoVenda: string;
  iva: string;
  ativo: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};
interface Fields{ 
  campo: keyof ProdutoForm; 
  label: string; 
  placeholder: string; 
  input:string
}

const campos: Fields[] = [
  { campo: 'nome', label: 'Nome do Produto', placeholder: 'Ex: XEROX Printer LASER MONO B230V_DNI' , input: 'text' },
  { campo: 'codigoEAN', label: 'Código EAN', placeholder: 'Ex: 1234567890111', input: 'text' },
  { campo: 'departamento', label: 'Departamento', placeholder: 'Ex: IT', input: 'text' },
  { campo: 'fornecedor', label: 'Fornecedor', placeholder: 'Ex: XeconXira', input: 'text' },
  { campo: 'unidade', label: 'Tipo de Unidade', placeholder: 'Ex: Unidade', input: 'text' },
  { campo: 'stockMinimo', label: 'Stock Mínimo', placeholder: 'Ex: 20', input: 'text' },
  { campo: 'altura', label: 'Altura', placeholder: 'Ex: 10', input: 'text' },
  { campo: 'comprimento', label: 'Comprimento', placeholder: 'Ex: 14', input: 'text' },
  { campo: 'largura', label: 'Largura', placeholder: 'Ex: 20', input: 'text' },
  { campo: 'precoCompra', label: 'Preço de Compra', placeholder: 'Ex: 19', input: 'text' },
  { campo: 'precoVenda', label: 'Preço de Venda', placeholder: 'Ex: 29,99', input: 'text' },
  { campo: 'iva', label: 'IVA', placeholder: 'Ex: 23', input: 'text' },
  { campo: 'ativo', label:'ativo', placeholder:'', input: 'check' }
];


const obrigatorios = ['nome', 'codigoEAN', 'departamento', 'unidade', 'codigo', 'quantidade'];

const CriarProdutoModal:React.FC<Props> = ({ visible, onClose }: Props) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProdutoForm>({defaultValues: { ativo: false }});

  const onSubmit = (data: ProdutoForm) => {
    console.log('Produto criado:', data);
    onClose();
    reset();
  };

  const handleCancel = () => {
  reset();
  onClose();
};
  

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modal}
        >
          <Text style={styles.title}>Criar Produto</Text>

          <ScrollView contentContainerStyle={styles.form}>
            {campos.map(({ campo, label, placeholder, input }) => (
              <View key={campo} style={styles.inputWrapper}>
                <Text style={styles.label}>{label}</Text>
                    {input === 'text' ? 
                    <Controller
                      control={control}
                      name={campo as keyof ProdutoForm}
                      rules={{
                        required: obrigatorios.includes(campo) ? 'Campo obrigatório' : false,
                        validate: (value) => {
                          if ((campo === 'precoCompra' || campo === 'precoVenda') && isNaN(Number(value))) {
                            return 'Deve ser um número';
                          }
                          if ((campo === 'precoCompra' || campo === 'precoVenda') && Number(value) <= 0) {
                            return 'Deve ser maior que zero';
                          }
                          return true;
                        }
                      }}
                      
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View style={styles.inputGroup}>
                          <TextInput placeholderTextColor={"#A0A0A0"} 
                              style={[
                                styles.input,
                                (campo === 'precoCompra' || campo === 'precoVenda') ? { paddingRight: 30 } : {},
                                errors[campo] && styles.inputError
                              ]}
                              placeholder={placeholder}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              value={value as string}
                              keyboardType={(campo === 'precoCompra' || campo === 'precoVenda') ? 'numeric' : 'default'}
                            />
                            {(campo === 'precoCompra' || campo === 'precoVenda') && (
                              <Text style={styles.suffix}>
                                {'€'}
                              </Text>
                            )}
                            {(campo === 'altura' || campo === 'comprimento'|| campo === 'largura') && (
                              <Text style={styles.suffix}>
                                {'cm'}
                              </Text>
                            )}
                            {(campo === 'iva') && (
                              <Text style={styles.suffix}>
                                {'%'}
                              </Text>
                            )}
                          
                          </View>
                        )}
                        
                      />
                       : 
                       <Controller
                      control={control}
                      name="ativo"
                      render={({ field: { value, onChange } }) => (
                       <View style={styles.checkboxWrapper}>
                          <View style={styles.checkboxContainer}>
                            <Checkbox
                            status={value ? 'checked' : 'unchecked'}
                            onPress={() => onChange(!value)}
                            color="#2F80ED"
                            />
                            <Text style={styles.checkboxLabel}>Produto Ativo</Text>
                          </View>
                       </View>
       
                    )}
                    />
                       }
                    
                      
                  
                
                {errors[campo] && (
                  <Text style={styles.errorText}>
                    {errors[campo]?.message?.toString()}
                  </Text>
                )}
              </View>
            ))}

              
          </ScrollView>

          <View style={styles.actions}>

            <TouchableOpacity style={[Style.buttonSecondary, styles.buttonPrimary]} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.textPrimary}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[Style.buttonPrimary,styles.buttonSecondary]} onPress={handleCancel}>
              <Text style={styles.textSecondary}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default CriarProdutoModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
    paddingBottom: 20,
  },
  form: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    width: '30%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  inputGroup: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#F5F7FA',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
  },
  suffix: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
    color: '#5F5F5F',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#EB5757',
  },
  errorText: {
    fontSize: 12,
    color: '#EB5757',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
    gap: 20,
    
  },
  checkboxWrapper: {
  width: '100%',
  marginTop: 10,
  marginBottom: 15,
},

checkboxContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},

checkboxLabel: {
  marginLeft: 8,
  fontSize: 14,
  color: '#1A1A1A',
},
//ARRUMAR BOTOES GENERICOS
  buttonPrimary:{
    boxShadow: "0 2px 4px darkslategray"
  },

  buttonSecondary: {
      boxShadow: "0 2px 4px darkslategray",
  },

  textPrimary: {
    color: "#fff",
    paddingHorizontal: 20,
  },
 
  textSecondary: {
    paddingHorizontal: 20,
  },

});
