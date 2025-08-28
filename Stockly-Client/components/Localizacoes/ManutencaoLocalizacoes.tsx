import { Colours } from "@/libs/Constants";
import { EditarLocalizacao, GetAllLocals, GetLocalizacaoById, GetTreeLocals } from "@/libs/Requests";
import Style from "@/libs/Style";
import { localizacaoForm, TreeData, TreeLocals } from "@/models/Localizacoes";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Checkbox } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import TreeMenu, { Item } from "react-simple-tree-menu";
import '../../node_modules/react-simple-tree-menu/dist/main.css';
import CriarLocalizacaoModal from "../Modals/CriarLocalizacaoModal";

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

const ManutencaoLocalizacoes:React.FC = () => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<localizacaoForm>();
    const [locals, setLocals] = useState<TreeData[]>();
    const [dropdownLocals, setDropdownLocals] = useState<{ id: number; nome: string }[]>();
    const [selectedLocal, setSelectedLocal] = useState<Item>();
    const [currentMode, setCurrentMode] = useState<'edit' | 'view'>('view');
    const [createVisible, setCreateVisible] = useState(false);

    const fetchData = async () => {
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

    useEffect(() => {
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
    
    const onSubmit = async (formData: localizacaoForm) => {
        try{
            await EditarLocalizacao(selectedLocal?.id, formData);
            setCurrentMode('view');
        }
        catch(e){
            console.error("Erro ao editar localização: ", e)
        }
    }

    if(Platform.OS === 'web'){
        return (
            <>
                <View style={styles.container}>
                    <View style={styles.containerLocals}>
                        <TreeMenu data={locals} debounceTime={125} disableKeyboard={true} hasSearch={false} onClickItem={({...props})=>{ updateSelectedNode(props) }} />
                    </View>
                    <View style={styles.container3D}>
                        <View style={styles.toolbar}>
                            <View>
                                <Pressable style={[Style.buttonSecondary, styles.buttonMpPrimary, styles.shadow]} onPress={() => setCreateVisible(true)}>
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
                                        rules={{required: 'Campo Obrigatório'}}
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
                                    {errors.nome && <Text style={styles.errorText}>{errors.nome.message}</Text>}
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Label text="Morada" required={currentMode === 'edit'} />
                                    <Controller
                                        control={control}
                                        name="morada"
                                        rules={{required: 'Campo Obrigatório'}}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            readOnly={currentMode==='view'}
                                            style={[styles.input, errors.morada && styles.inputError, currentMode === 'view' && styles.viewOnly]}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                        )}
                                    />
                                    {errors.morada && <Text style={styles.errorText}>{errors.morada?.message}</Text>}
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Label text="Código Postal" required={currentMode === 'edit'} />
                                    <Controller
                                        control={control}
                                        name="codPostal"
                                        rules={{required: 'Campo não é um código postal válido', pattern: /^\d{4}-\d{3}$/i}}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            readOnly={currentMode==='view'}
                                            style={[styles.input, errors.codPostal && styles.inputError, currentMode === 'view' && styles.viewOnly]}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                        )}
                                    />
                                    {errors.codPostal && <Text style={styles.errorText}>{errors.codPostal?.message}</Text>}
                                </View>

                                {currentMode === 'view' ? <View style={styles.inputWrapper}>
                                    <Label text="Localização Superior" />
                                    <Controller
                                        control={control}
                                        name="localizacaoPai"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            readOnly
                                            style={[styles.input, styles.viewOnly]}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={dropdownLocals?.find(f => f.id == value)?.nome ?? ''}
                                        />
                                        )}
                                    />
                                </View> : 
                                <View style={styles.inputWrapper}>
                                    <Label text="Localização Superior" />
                                    <Controller
                                        control={control}
                                        name="localizacaoPai"
                                        render={({ field: { onChange, value } }) => (
                                            <Picker
                                            selectedValue={value}
                                            onValueChange={onChange}
                                            style={styles.pickerInner}
                                            dropdownIconColor="#5F5F5F"
                                            >
                                            
                                            <Picker.Item label="" value="0" />
                                            {dropdownLocals?.map((d) => { 
                                                if(d.id == selectedLocal.id) return null;
                                                return(
                                                <Picker.Item key={d.id} label={d.nome} value={String(d.id)} /> 
                                            )} )}
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
                                            <Text style={styles.checkboxLabel} >Armazém Central</Text>
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
                                            style={[styles.input, currentMode === 'view' && styles.viewOnly]}
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
                                            style={[styles.input, currentMode === 'view' && styles.viewOnly]}
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
                                        <TouchableOpacity style={[Style.buttonSecondary, shadow]} onPress={handleSubmit(onSubmit)}>
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
                <SafeAreaView>
                <CriarLocalizacaoModal
                    visible={createVisible}
                    onClose={() => {
                        setCreateVisible(false);
                        fetchData();
                    }}
                />
                </SafeAreaView>
            </>
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
        padding: 20,
        height: 200
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
    errorText: { fontSize: 12, color: "#EB5757", marginTop: 4 },
})