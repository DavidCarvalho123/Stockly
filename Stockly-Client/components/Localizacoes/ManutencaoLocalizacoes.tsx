import { Colours } from "@/libs/Constants";
import { GetAllLocals, GetLocalizacaoById, GetTreeLocals } from "@/libs/Requests";
import Style from "@/libs/Style";
import { localizacaoForm, TreeData, TreeLocals } from "@/models/Localizacoes";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Checkbox } from "react-native-paper";
import TreeMenu, { Item } from "react-simple-tree-menu";
import '../../node_modules/react-simple-tree-menu/dist/main.css';

const ConvertTreeData = (dbData:TreeLocals[]) => {
    var treeData: TreeData[] = [];
    if(dbData == null)
        return undefined
    dbData.forEach((local, index) => {
        treeData.push({ key: local.id.toString() + '-level-node', 
                        label: '[L] ' + local.nome, 
                        index: index, 
                        id: local.id ,
                        sizeX: local.sizeX,
                        sizeZ: local.sizeZ,
                        nodes: ConvertTreeData(local.subLocalizacao)
                    });
    });
    return treeData;
}

const shadow = {
  ...Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    android: { elevation: 5 },
    web: { boxShadow: "0 2px 6px rgba(0,0,0,0.25)" as any },
  }),
};

const EMPTY_FORM: localizacaoForm = {
  nome: "",
  morada: '',
  codPostal: '',
  localizacaoPai: '',
  armazemCentral: false,
  sizeX: 0,
  sizeZ: 0
};

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <Text style={styles.label}>
    {text}{required ? <Text style={styles.required}> *</Text> : null}
  </Text>
);

const ManutencaoLocalizacoes:React.FC = () => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<localizacaoForm>();
    const [locals, setLocals] = useState<TreeData[]>();
    const [dropdownLocals, setDropdownLocals] = useState<{ id: number; nome: string }[]>();
    const [selectedLocal, setSelectedLocal] = useState<Item>();
    const [currentMode, setCurrentMode] = useState<'edit' | 'view'>('view');

    useEffect(() => {
        async function fetchData() {
            try{
                let data = await GetTreeLocals();
                if(data != null){
                    let treeData = ConvertTreeData(data)
                    setLocals(treeData);
                }
                let dropLocals = await GetAllLocals();
                setDropdownLocals(dropLocals);
            }
            catch(e){
                console.error("Erro a carregar locais:", e);
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        if(selectedLocal !== undefined){
            (async () => {
                var data = await GetLocalizacaoById(selectedLocal.id)
                reset(data);
            })();
        }
    }, [selectedLocal])

    const updateSelectedNode = (selectedNode: Item) => {
        setCurrentMode('view');
        reset(EMPTY_FORM);
        setSelectedLocal(selectedNode);
    }

    const activateUpdatingLocal = () => {
        setCurrentMode('edit');
    }
        

    if(Platform.OS === 'web'){
        return (
            <View style={styles.container}>
                <View style={styles.containerLocals}>
                    <TreeMenu data={locals} debounceTime={125} disableKeyboard={true} hasSearch={false} onClickItem={({...props})=>{ updateSelectedNode(props) }} />
                </View>
                <View style={styles.container3D}>
                    <View style={styles.toolbar}>
                        <View>
                            <Pressable style={[Style.buttonSecondary, styles.buttonMpPrimary, styles.shadow]} onPress={() => {}}>
                                <Text style={Style.textButtonSecondary}>Criar</Text>
                            </Pressable>
                        </View>
                        <View>
                            { selectedLocal &&
                            <Pressable style={[Style.buttonSecondary, Style.editButton, styles.buttonMpPrimary,styles.shadow]} onPress={() => activateUpdatingLocal()}>
                                <Text style={Style.textButtonSecondary}>Editar</Text>
                            </Pressable>
                            }
                        </View>
                    </View>
                    {selectedLocal && 
                    <>
                        <ScrollView contentContainerStyle={styles.form}>
                            <View style={styles.inputWrapper}>
                                <Label text="Nome" required={currentMode === 'edit'} />
                                <Controller
                                    control={control}
                                    name="nome"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        readOnly={currentMode==='view'}
                                        style={[styles.input, errors.nome && styles.inputError, currentMode === 'view' && styles.viewOnly]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                    )}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Label text="Morada" />
                                <Controller
                                    control={control}
                                    name="morada"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        readOnly={currentMode==='view'}
                                        style={[styles.input, errors.nome && styles.inputError, currentMode === 'view' && styles.viewOnly]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                    )}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Label text="Código Postal" />
                                <Controller
                                    control={control}
                                    name="codPostal"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        readOnly={currentMode==='view'}
                                        style={[styles.input, errors.nome && styles.inputError, currentMode === 'view' && styles.viewOnly]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                    )}
                                />
                            </View>

                            {currentMode === 'view' ? <View style={styles.inputWrapper}>
                                <Label text="Localização Superior" />
                                <Controller
                                    control={control}
                                    name="localizacaoPai"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        readOnly
                                        style={[styles.input, errors.nome && styles.inputError, styles.viewOnly]}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                    )}
                                />
                            </View> : 
                            <View style={styles.inputWrapper}>
                                <Label text="Localização Superior" />
                                <Controller
                                    control={control}
                                    name="localizacaoPai"
                                    rules={{required: 'Campo obrigatório'}}
                                    render={({ field: { onChange, value } }) => (
                                        <Picker
                                        selectedValue={dropdownLocals?.find(d => d.nome === value)?.id}
                                        onValueChange={onChange}
                                        style={styles.pickerInner}
                                        dropdownIconColor="#5F5F5F"
                                        >
                                        
                                        <Picker.Item label="" value="" />
                                        {dropdownLocals?.map((d) => (
                                            <Picker.Item key={d.id} label={d.nome} value={String(d.id)} />
                                        ))}
                                    </Picker>
                                    )}
                                />
                            </View>}
                            

                            <View style={styles.checkboxWrapper}>
                                <Controller
                                    control={control}
                                    name="armazemCentral"
                                    render={({ field: { value, onChange } }) => (
                                    <View style={[styles.checkboxContainer, {pointerEvents: currentMode === 'edit' ? 'auto' : 'none'}]}>
                                        <Checkbox status={value ? "checked" : "unchecked"}  onPress={() => {currentMode==='edit' ? onChange(!value) : ''} } color={Colours.stocklyBlue} />
                                        <Text style={styles.checkboxLabel}>Armazém Central</Text>
                                    </View>
                                    )}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Label text="Comprimento" />
                                <Controller
                                    control={control}
                                    name="sizeX"
                                    render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        readOnly={currentMode==='view'}
                                        style={[styles.input, errors.nome && styles.inputError, currentMode === 'view' && styles.viewOnly]}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={onChange}
                                        value={value as unknown as string}
                                    />
                                    )}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Label text="Largura" />
                                <Controller
                                    control={control}
                                    name="sizeZ"
                                    render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        readOnly={currentMode==='view'}
                                        style={[styles.input, errors.nome && styles.inputError, currentMode === 'view' && styles.viewOnly]}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        onChangeText={onChange}
                                        value={value as unknown as string}
                                    />
                                    )}
                                />
                            </View>
                            <View style={{width: '100%'}}>
                                <View style={styles.actions}>
                                    { currentMode === 'edit' &&
                                    <TouchableOpacity style={[Style.buttonSecondary, shadow]} onPress={() => {}}>
                                        <Text style={styles.textPrimary}>Guardar</Text>
                                    </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        </ScrollView>
                    </>
                    }
                </View>
            </View>
        );
    }
}

export default ManutencaoLocalizacoes;

const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection:'row'
    },
    containerLocals:{
        flex:1
    },
    container3D:{
        flex:5,
        borderStartWidth: 1,
        borderColor: Colours.sidebarGrey
    },
    textPrimary: { color: "#fff", paddingHorizontal: 20 },
    inputWrapper: { width: "48%", marginBottom: 15 },
    label: { fontSize: 14, color: "#1A1A1A", marginBottom: 4 },
    required: { color: "#EB5757" },
    input: { backgroundColor: "#F5F7FA", padding: 10, borderRadius: 6, borderWidth: 1, borderColor: "#E0E0E0", height: 44 },
    inputError: { borderColor: "#EB5757" },
    checkboxWrapper: { width: "100%", marginTop: 10, marginBottom: 15 },
    checkboxContainer: { flexDirection: "row", alignItems: "center" },
    checkboxLabel: { marginLeft: 8, fontSize: 14, color: "#1A1A1A" },
    actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 20, gap: 20 },
    form: { 
        flexDirection: "row", 
        flexWrap: "wrap", 
        justifyContent: "space-between",
        padding: 20
    },
    toolbar:{
        width:'100%',
        height: 60,
        backgroundColor:Colours.sidebarGrey,
        flexWrap:'wrap',
        justifyContent:'center',
        paddingLeft: 10,
        paddingRight: 10,
        
    },
    buttonMpPrimary: {
        width: 90,
        borderRadius: 20,
        marginTop: 20,
        boxShadow: "0 2px 4px darkslategray",
        marginRight: 15
    },
    shadow: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    viewOnly: {
        backgroundColor: '#ecececff'
    },
    pickerInner: { height: 44 },
})