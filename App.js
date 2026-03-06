import React, { useEffect, useState } from 'react';
import {
  Text, View, StyleSheet, FlatList, ActivityIndicator, Alert,
  TouchableOpacity, Modal, TextInput, Button, ScrollView, RefreshControl
} from 'react-native';
import axios from 'axios';

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);

  const API_LISTA = 'https://esbsouza.com.br/ag1/?fn=sread';
  const API_UPDATE = 'https://esbsouza.com.br/ag1/?fn=supdate';

  const carregarUsuarios = async (isRefresh = false) => {
    if (isRefresh) setAtualizando(true);
    else setCarregando(true);

    try {
      const res = await axios.get(API_LISTA);
      setUsuarios(res.data.siieusers || []);
    } catch (erro) {
      Alert.alert('Erro', 'Falha ao carregar usuários.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const abrirEdicao = (usuario) => {
    setEditando({ ...usuario });
    setModalVisible(true);
  };

  const salvarAlteracoes = async () => {
    if (!editando) return;

    setCarregando(true);
    try {
      const formData = new FormData();
      Object.keys(editando).forEach(key => {
        formData.append(key, editando[key]);
      });

      const res = await axios.post(API_UPDATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        Alert.alert('Sucesso', 'Atualizado com sucesso!');
        setModalVisible(false);
        carregarUsuarios();
      } else {
        Alert.alert('Erro', res.data.message || 'Falha ao atualizar.');
      }
    } catch (erro) {
        Alert.alert('Erro', 'Verifique sua conexão ou o PHP.');
        console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => abrirEdicao(item)}>
      <Text style={styles.nome}>{item.nome}</Text>
      <Text style={styles.info}>Bairro: {item.bairro}</Text>
      <Text style={styles.info}>Celular: {item.celular}</Text>
      <Text style={styles.valor}>R$ {parseFloat(item.valor).toFixed(2)}</Text>
      <Text style={styles.editar}>Toque para editar</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Usuários (Toque para editar)</Text>

      {carregando && !atualizando ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={() => carregarUsuarios(true)} />
          }
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum usuário.</Text>}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Editar Usuário</Text>
            {editando && (
              <ScrollView style={{ maxHeight: '80%' }}>
                {Object.keys(editando).map((key) => {
                  if (key === 'id') return null;
                  return (
                    <View key={key} style={styles.inputGroup}>
                      <Text style={styles.label}>{key.toUpperCase()}:</Text>
                      <TextInput
                        style={styles.input}
                        value={String(editando[key])}
                        onChangeText={(text) => setEditando({ ...editando, [key]: text })}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <View style={styles.botoes}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#999" />
              <Button title="Salvar" onPress={salvarAlteracoes} color="#28a745" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 16, color: '#333' },
  card: { backgroundColor: '#fff', padding: 16, marginVertical: 6, borderRadius: 10, elevation: 2 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  info: { fontSize: 14, color: '#555', marginTop: 4 },
  valor: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginTop: 6 },
  editar: { fontSize: 12, color: '#007bff', marginTop: 8, textAlign: 'right' },
  vazio: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', maxHeight: '90%', borderRadius: 12, padding: 20, elevation: 5 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, color: '#333', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, backgroundColor: '#f9f9f9' },
  botoes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
});
