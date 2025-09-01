import { Colours } from "@/libs/Constants";
import { GetAllLocals, GetAllStates, GetStocksInventory, UpdateInventory, UpdateInventoryMobile } from "@/libs/Requests";
import Style from "@/libs/Style";
import { Estado } from "@/models/Estados";
import { InventoryForm, InventoryMobileForm, InventoryMobileFormError, StocksInventario } from "@/models/Stocks";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ActivityIndicator, Button, Keyboard, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useClickOutside } from "react-native-click-outside";
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from "react-native-safe-area-context";

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
const COLS: { key: keyof StocksInventario | "acao"; label: string; flex: number; filterable?: boolean; editable?: boolean; }[] = [
  { key: "ean",          label: "EAN",          flex: 1.0, filterable: true },
  { key: "nome",         label: "Nome",         flex: 1.5, filterable: true },
  { key: "departamento",   label: "Departamento",  flex: 1.5, filterable: true},
  { key: "stockAnt1",    label: "Stock Anterior Frente de Loja", flex: 0.7, filterable: false },
  { key: "stockPic1",  label: "Stock Picado Frente de Loja",      flex: 0.7, filterable: false, editable: true },
  { key: "stockReal1",   label: "Stock Real Frente de Loja",  flex: 0.7, filterable: false,editable:true },
  { key: "stockAnt2",          label: "Stock Anterior Armazém",          flex: 0.7, filterable: false },
  { key: "stockPic2",        label: "Stock Picado Armazém",        flex: 0.7, filterable: false,editable:true },
  { key: "stockReal2",         label: "Stock Real Armazém",             flex: 0.7, filterable: false,editable:true }, 
  { key: "stock3",         label: "Stock Em Trânsito",             flex: 0.7, filterable: false }, 
  { key: "stock4",         label: "Stock Em Reparação",             flex: 0.7, filterable: false }, 
];
const TOTAL_FLEX = COLS.reduce((s, c) => s + c.flex, 0);
const COL_WIDTHS = COLS.map((c) => `${(c.flex / TOTAL_FLEX) * 100}%`);
const ACCENT = Colours.stocklyBlue;

const shadow = {
  ...Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    android: { elevation: 5 },
    web: { boxShadow: "0 2px 6px rgba(0,0,0,0.25)" as any },
  }),
};

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

  interface PreForm{
    values: InventoryForm[]
  }
  interface PreFormMobile{
    values: InventoryMobileForm[]
  }

  

const Inventario:React.FC = () => {
    const [localizacoes, setLocalizacoes] = useState<{ id: number; nome: string }[]>([]);
    const [stocksProd, setStocksProds] = useState<StocksInventario[]>([]);
    const [filtered, setFiltered] = useState<StocksInventario[]>([]);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [selectedLocal, setSelectedLocal] = useState<number>()
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [permission, requestPermission] = useCameraPermissions();
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [torch, setTorch] = useState<boolean>(false);
    const refOutside = useClickOutside<View>(() => {
      Keyboard.dismiss();
    });
    const [estados, setEstados] = useState<Estado[]>([]);
    const [selectedEstado, setSelectedEstado] = useState<number>();
    const [lastSelectedEan, setLastSelectedEan] = useState<number>(0);
    const [localError, setLocalError] = useState<boolean>(false);
    const [estadoError, setEstadoError] = useState<boolean>(false);

    const { setValue, control, handleSubmit, reset, formState: { errors } } = useForm<PreForm>();
    const { setError: setErrorMobile,setValue: setValueMobile, control: controlMobile, handleSubmit: handleSubmitMobile, reset: resetMobile, formState: {errors: errorsMobile}} = useForm<PreFormMobile>({defaultValues: {values: [{ean:'',quantity: 0}]}})
    const { fields, insert } = useFieldArray({ control, name: "values"})
    const { fields: fieldsMobile, append: appendMobile } = useFieldArray({ control: controlMobile, name: "values"})

    useEffect(() => {
        (async () => {
          try {
            const locals = await GetAllLocals();
            setLocalizacoes(locals);
            const estsRaw = await GetAllStates();
            const ests: Estado[] = Array.isArray(estsRaw)
              ? estsRaw.filter(Boolean).filter((e: any) => e.id < 3 ).map((e: any) => ({
                  id: e.id ?? e.Id,
                  nome: e.Estado ?? e.estado1 ?? e.nome ?? e.Nome ?? `Estado ${e.id ?? e.Id}`,
                }))
              : [];
            setEstados(ests);
          } catch (e) {
            console.error("Erro a carregar locais:", e);
          }
        })();
      }, []);

      useEffect(() => {
        (async () => {
            try{
                if(selectedLocal !== undefined){
                    const data = await GetStocksInventory(selectedLocal as number) as StocksInventario[];
                    if(data !== null){
                      setStocksProds(data);
                      setFiltered(data);
                      var inventoryForm: InventoryForm[] = [];
                      data.forEach((stock) => {
                        inventoryForm.push({
                          produtoId: stock.id,
                          stockReal1: stock.stockReal1?? 0,
                          stockPic1: stock.stockPic1?? 0,
                          stockReal2: stock.stockReal2?? 0,
                          stockPic2: stock.stockPic2?? 0
                        });
                      });
                      reset({values: inventoryForm});
                    }
                }
            }
            catch(e){
                console.error("Erro a carregar detalhes: ", e);
            }
        })();
      }, [selectedLocal])

    const onchangeLocals = (itemValue: any, itemIndex: number) => {
        console.log(itemValue)
        setSelectedLocal(itemValue)
    }

    const onSubmit = async (data: PreForm) => {
      setIsProcessing(true);
      try{
        if(selectedLocal !== undefined){
          await UpdateInventory(selectedLocal,data.values);
        }
      }
      catch(e) {
        console.error("Erro a atualizar o inventário: ", e)
      }
      finally{
        setIsProcessing(false);
      }
    }

    const onSubmitMobile = async (data: PreFormMobile) => {
      setIsProcessing(true);
      try{
        if(selectedLocal !== undefined && selectedEstado !== undefined){
          setLocalError(false);
          setEstadoError(false);
          const resp = await UpdateInventoryMobile(selectedLocal,selectedEstado,data.values);

          if(resp.status == 404){ // one of the Eans doesn't exist
            const errors = await resp.json() as InventoryMobileFormError[]
            errors.map(err => {
              setErrorMobile(`values.${err.index}.ean`, {message: err.error});
            });
          }
          else if(resp.status >= 200 && resp.status < 300){
            setSelectedLocal(undefined);
            setSelectedEstado(undefined);
            resetMobile();
          }
        }
        else{
          console.log(selectedLocal)
          console.log(selectedEstado)
          setLocalError(selectedLocal === undefined);
          setEstadoError(selectedEstado === undefined);
        }
      }
      catch(e) {
        console.error("Erro a atualizar o inventário: ", e)
      }
      finally{
        setIsProcessing(false);
      }
      //setErrorMobile('values.1.ean',{message: 'erro'});
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

    if(Platform.OS === 'web'){
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
                          <ScrollView>
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
    
                                    if(!c.editable){
                                      return (
                                          <View
                                          key={`${p.id}-${c.key}`}
                                          style={[styles.dataCell, { width: COL_WIDTHS[i] } as any]}
                                          >
                                          <CellText text={val} />
                                          </View>
                                      );
                                    }
                                    else{
                                      var stockRowForm = fields.findIndex(f => f.produtoId == p.id);
                                      if(stockRowForm === -1) return null;
                                      
                                      if(c.key == 'stockPic1'){
                                        return (
                                          <Controller 
                                            control={control}
                                            name={`values.${stockRowForm}.stockPic1`}
                                            defaultValue={0}
                                            rules={{validate: (v) => (v && isNaN(Number(v)) ? "Deve ser numérico" : true),}}
                                            render={({ field: { onChange, value} }) => (
                                              <TextInput 
                                                onChangeText={(text) => {onChange(Number(text) || 0); setValue(`values.${stockRowForm}.stockReal1`,Number(text) || 0)}} 
                                                value={value?.toString()?? "0"} 
                                                keyboardType="numeric" 
                                                style={[styles.input, {width: COL_WIDTHS[i] } as any ]}
                                              />
                                            )}
                                            />
                                        );
                                      }
                                      else if(c.key == 'stockPic2'){
                                        return (
                                          <Controller 
                                            control={control}
                                            name={`values.${stockRowForm}.stockPic2`}
                                            defaultValue={0}
                                            render={({ field: { onChange, value} }) => (
                                              <TextInput 
                                                onChangeText={(text) => {onChange(Number(text) || 0); setValue(`values.${stockRowForm}.stockReal2`,Number(text) || 0) }} 
                                                value={value?.toString()?? "0"} 
                                                keyboardType="numeric" 
                                                style={[styles.input, {width: COL_WIDTHS[i] } as any ]}
                                              />
                                            )}
                                            />
                                        );
                                      }
                                      else if(c.key == 'stockReal1'){
                                        return (
                                          <Controller 
                                            control={control}
                                            name={`values.${stockRowForm}.stockReal1`}
                                            defaultValue={0}
                                            render={({ field: { onChange, value} }) => (
                                              <TextInput 
                                                onChangeText={(text) => onChange(Number(text) || 0)} 
                                                value={value?.toString()?? "0"} 
                                                keyboardType="numeric" 
                                                style={[styles.input, {width: COL_WIDTHS[i] } as any ]}
                                              />
                                            )}
                                            />
                                        );
                                      }else if(c.key == 'stockReal2'){
                                        return (
                                          <Controller 
                                            control={control}
                                            name={`values.${stockRowForm}.stockReal2`}
                                            defaultValue={0}
                                            render={({ field: { onChange, value} }) => (
                                              <TextInput 
                                                onChangeText={(text) => onChange(Number(text) || 0)} 
                                                value={value?.toString()?? "0"} 
                                                keyboardType="numeric" 
                                                style={[styles.input, {width: COL_WIDTHS[i] } as any ]}
                                              />
                                            )}
                                            />
                                        );
                                      }
    
                                    }
                                    })}
                                </View>
                                ))}
                            </View>
                          </ScrollView>
                      </View>
                  </View>
  
                  <View style={styles.saveInventory}>
                    <ActivityIndicator size="large" animating={isProcessing} style={{justifyContent: 'flex-start'}}  />
                    <TouchableOpacity style={[Style.buttonSecondary, shadow]} disabled={selectedLocal === undefined} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.textPrimary}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
  
              </View>
          </>
      );
    }
    else{
      if(!permission){
        return <View/>;
      }

      if(!permission.granted){
        return (
        <View style={styles.container}>
          <Text style={styles.message}>É necessário permissões para aceder à camera.</Text>
          <Button onPress={requestPermission} title="Permitir utilização" />
        </View>
      );
      }

      const toggleCameraState = (index:number) => {
        setLastSelectedEan(index);
        setCameraActive(!cameraActive);
      }

      const readBarcode = (data:string) => {
        setCameraActive(false);
        setTorch(false);
        setValueMobile(`values.${lastSelectedEan}.ean`,data);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
      }
      
      return(
        
            <View style={{flex:1}}>
              
                <View style={dropdownStyles.container}>
                  <Text style={[dropdownStyles.label, focusedField === 'localizacoes' && { color: Colours.stocklyBlue }]}>
                    Localização
                  </Text>
                  <Dropdown
                    style={[dropdownStyles.dropdown, focusedField === 'localizacoes' && { borderColor: Colours.stocklyBlue }]}
                    placeholderStyle={dropdownStyles.placeholderStyle}
                    placeholder="Selecionar Localização"
                    selectedTextStyle={dropdownStyles.selectedTextStyle}
                    inputSearchStyle={dropdownStyles.inputSearchStyle}
                    iconStyle={dropdownStyles.iconStyle}
                    data={localizacoes}
                    value={selectedLocal}
                    labelField="nome"
                    valueField="id"
                    onFocus={() => setFocusedField("localizacoes")}
                    onBlur={() => setFocusedField(null)}
                    onChange={item => {
                      onchangeLocals(item.id,item.nome);
                    }}
                  />
                  {localError && <Text style={styles.errorText}>É necessário selecionar uma localização</Text>}
                </View>
                <View style={[dropdownStyles.container,{paddingBottom: 24}]}>
                  <Text style={[dropdownStyles.label, focusedField === 'estado' && { color: Colours.stocklyBlue }]}>
                    Estado
                  </Text>
                  <Dropdown
                    style={[dropdownStyles.dropdown, focusedField === 'estado' && { borderColor: Colours.stocklyBlue }]}
                    placeholderStyle={dropdownStyles.placeholderStyle}
                    placeholder="Selecionar Estado"
                    selectedTextStyle={dropdownStyles.selectedTextStyle}
                    inputSearchStyle={dropdownStyles.inputSearchStyle}
                    iconStyle={dropdownStyles.iconStyle}
                    data={estados}
                    value={selectedEstado}
                    labelField="nome"
                    valueField="id"
                    onFocus={() => setFocusedField("estado")}
                    onBlur={() => setFocusedField(null)}
                    onChange={item => {
                      setSelectedEstado(item.id);
                    }}
                  />
                  {estadoError && <Text style={styles.errorText}>É necessário selecionar um Estado</Text>}
                </View>
                <ScrollView>
                      <View ref={refOutside}>
                        {fieldsMobile.map((field, index) => {
                          return(
                            <View key={field.id} style={{flexDirection:'row'}}>
                              <View style={[dropdownStyles.container,{width: '60%',paddingRight: 0, paddingTop: 0}]}>
                                <Label text="EAN" />
                                <Controller
                                  key={field.id}
                                  control={controlMobile}
                                  name={`values.${index}.ean`}
                                  render={({ field: { onChange, value, onBlur } }) => {
                                    return(
                                    <View style={{ display:'flex',flexDirection:'row' }}>
                                      <TextInput
                                        style={[
                                          styles.input,
                                          errorsMobile.values && errorsMobile.values[index]?.ean && styles.inputError,
                                          focusedField === `ean.${index}` && styles.inputFocused, {flex: 5}
                                        ]}
                                        onChangeText={onChange}
                                        value={value?? ""}
                                        onBlur={() => { onBlur(); setFocusedField(null); }}
                                        onFocus={() => setFocusedField(`ean.${index}`)}
                                      />
                                    </View>
                                  )}}
                                />
                                {errorsMobile.values && errorsMobile.values[index]?.ean && <Text style={styles.errorText}>{errorsMobile.values && errorsMobile.values[index]?.ean.message as string}</Text>}
                              </View>
                                      <TouchableOpacity style={styles.buttonView} onPress={() => {toggleCameraState(index)}}>
                                            <FontAwesome6 name="barcode" size={24} color="black" />
                                        </TouchableOpacity>
                                <View style={[dropdownStyles.container,{width: '40%',paddingLeft: 0,paddingRight: 20, paddingTop: 0}]}>
                                <Label text="Quantidade" />
                                <Controller
                                  key={field.id}
                                  control={controlMobile}
                                  name={`values.${index}.quantity`}
                                  render={({ field: { onChange, value, onBlur } }) => {
                                    return(
                                    <View style={{ display:'flex',flexDirection:'row', marginRight: 40 }}>
                                      <TextInput
                                        style={[
                                          styles.input,
                                          errorsMobile.values && errorsMobile.values[index]?.quantity && styles.inputError,
                                          focusedField === `quantity.${index}` && styles.inputFocused, {flex: 5}
                                        ]}
                                        placeholder="0"
                                        placeholderTextColor={'#fafafa'}
                                        onChangeText={onChange}
                                        value={value.toString() == '0' ? '' : value.toString()}
                                        onBlur={() => { onBlur(); setFocusedField(null); }}
                                        onFocus={() => setFocusedField(`quantity.${index}`)}
                                        keyboardType="numeric"
                                      />
                                    </View>
                                  )}}
                                />
                                {errorsMobile.values && errorsMobile.values[index]?.quantity && <Text style={styles.errorText}>{errorsMobile.values && errorsMobile.values[index]?.quantity.message as string}</Text>}
                              </View>
                            </View>
                            
                          );
                        })}
                      </View>
                    <View style={{flexDirection: 'row', width: '100%', justifyContent:'space-between'}}>
                      <TouchableOpacity style={[dropdownStyles.container,{width:'50%',overflow:'hidden'}]} onPress={() => {appendMobile({ean: '', quantity: 0} as InventoryMobileForm)}}>
                          <Text style={styles.addLine} numberOfLines={1}>Adicionar Linha...</Text>
                      </TouchableOpacity>
                      <ActivityIndicator size="large" animating={isProcessing} style={{justifyContent: 'center'}}  />
                      <TouchableOpacity style={[Style.buttonSecondary, shadow, {marginBottom:'auto',marginTop:'auto',height:'auto',justifyContent:'center', marginRight: 20}]} onPress={handleSubmitMobile(onSubmitMobile)}>
                          <Text style={styles.textPrimary}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                </ScrollView>


                
                <Modal visible={cameraActive} animationType="fade" transparent>
                  <CameraView barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','code128','code39','code93','codabar']}} 
                          onBarcodeScanned={(barcode) => {readBarcode(barcode.data)}} 
                          style={{ height: '100%'}} facing={'back'} enableTorch={torch} >
                            
                            <SafeAreaView style={{alignSelf:'center',marginTop:'auto', marginBottom:80}}>

                              <View style={{flexDirection:'row', justifyContent:'space-between', width: '100%',paddingLeft: 40, paddingRight: 40}}>
                                <TouchableOpacity onPress={() => {setCameraActive(false)}}>
                                  <AntDesign name="closecircleo" size={36} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {setTorch(!torch)}}>
                                  {!torch &&<MaterialIcons name="flashlight-on" size={36} color="white" />}
                                  {torch  && <MaterialIcons name="flashlight-off" size={36} color="white" /> }
                                </TouchableOpacity>
                              </View>

                            </SafeAreaView>
                    </CameraView>
                </Modal>
                
            </View>
          
        
      );
    }
}

export default Inventario;

const ROW_BORDER = "#e6e6e6";
const HEADER_BG = "#f5f5f5";

const ROW_H = 56;
const FILTER_H = 40;
const dropdownStyles = StyleSheet.create({
  container: {
      padding: 16,
    },
    dropdown: {
      backgroundColor: 'white',
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: '#fafafa',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonView: {
        justifyContent:'center',
        alignItems: 'center',
        marginHorizontal:10
    },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
    saveInventory: {
      flexDirection: "row", 
      justifyContent: "flex-end",
      marginTop: 20, 
      gap: 20,
      marginRight: 20
    },
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
addLine: { color: ACCENT, marginTop: 6,fontSize: 16 },
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
    marginRight: 0
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