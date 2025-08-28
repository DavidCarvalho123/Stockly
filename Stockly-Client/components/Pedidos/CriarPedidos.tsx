import CriarPedidoModal from "@/components/Modals/CriarPedidoModal";
import Style from "@/libs/Style";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CriarPedidos: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <Pressable
          style={[Style.buttonSecondary, styles.btnCreate, styles.shadow]}
          onPress={() => setOpen(true)}
        >
          <Text style={Style.textButtonSecondary}>Criar Pedido</Text>
        </Pressable>
      </View>

      {/* Modal com o formulário de criação */}
      <CriarPedidoModal visible={open} onClose={() => setOpen(false)} />
    </SafeAreaView>
  );
};

export default CriarPedidos;

const styles = StyleSheet.create({
  btnCreate: {
    width: 140,
    borderRadius: 20,
    padding: 12,
    marginTop: 20,
    marginLeft: 20,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
