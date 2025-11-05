import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  ScrollView,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

interface Usuario {
  id: string;
  nome: string;
  cep: string;
  bairro: string;
  celular: string;
  dtcad: string;
  dtaltera: string;
  ativo: string;
  valor: string;
}

export default function TabOneScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  const hoje = new Date().toISOString().split('T')[0];

  const [novo, setNovo] = useState<Partial<Usuario>>({
    nome: '',
    cep: '',
    bairro: '',
    celular: '',
    dtcad: hoje,
    dtaltera: hoje,
    ativo: 's',
    valor: '0',
  });

  const API_BASE = 'http://esbsouza.com.br/ag1/';
  const API_READ = `${API_BASE}?fn=sread`;
  const API_CREATE = `${API_BASE}?fn=screate`;
  const API_UPDATE = `${API_BASE}?fn=supdate1`;  // CORRIGIDO!
  const API_DELETE = `${API_BASE}?fn=sdelete`;

  const carregarUsuarios = async (isRefresh = false) => {
    if (isRefresh) setAtualizando(true);
    else setCarregando(true);
    try {
      const url = filtro ? `${API_READ}&nome=${encodeURIComponent(filtro)}` : API_READ;
      const res = await axios.get(url, { timeout: 15000 });
      if (res.data?.siieusers && Array.isArray(res.data.siieusers)) {
        setUsuarios(res.data.siieusers);
      }
    } catch (erro: any) {
      Alert.alert('Erro', `Falha ao carregar: ${erro.message}`);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, [filtro]);

  const abrirEdicao = (usuario: Usuario) => {
    setEditando(usuario);
    setModalVisible(true);
  };

  // SALVAR EDIÇÃO (JSON)
  const salvarEdicao = async () => {
    if (!editando) return;
    setCarregando(true);
    try {
      const data = {
        id: parseInt(editando.id, 10),
        nome: editando.nome,
        cep: editando.cep,
        bairro: editando.bairro,
        celular: editando.celular,
        dtcad: editando.dtcad,
        dtaltera: editando.dtaltera,
        ativo: editando.ativo,
        valor: editando.valor,
      };

      await axios.post(API_UPDATE, data, {
        headers: { 'Content-Type': 'application/json' },
      });

      Alert.alert('Sucesso', 'Atualizado!');
      setModalVisible(false);
      setEditando(null);
      carregarUsuarios();
    } catch (erro: any) {
      Alert.alert('Erro', 'Falha ao salvar.');
    } finally {
      setCarregando(false);
    }
  };

  // CRIAR NOVO (JSON)
  const criarNovo = async () => {
    setCarregando(true);
    try {
      const data = {
        nome: novo.nome,
        cep: novo.cep,
        bairro: novo.bairro,
        celular: novo.celular,
        dtcad: novo.dtcad || hoje,
        dtaltera: novo.dtaltera || hoje,
        ativo: novo.ativo || 's',
        valor: novo.valor || '0',
      };

      await axios.post(API_CREATE, data, {
        headers: { 'Content-Type': 'application/json' },
      });

      Alert.alert('Sucesso', 'Criado!');
      setModalNovo(false);
      setNovo({ nome: '', cep: '', bairro: '', celular: '', valor: '0' });
      carregarUsuarios();
    } catch {
      Alert.alert('Erro', 'Falha ao criar.');
    } finally {
      setCarregando(false);
    }
  };

  // EXCLUIR (JSON)
  const excluirUsuario = async (id: string) => {
    const idNum = parseInt(id, 10);
    Alert.alert('Excluir', 'Tem certeza?', [
      { text: 'Não' },
      {
        text: 'Sim',
        onPress: async () => {
          setCarregando(true);
          try {
            await axios.post(API_DELETE, { id: idNum }, {
              headers: { 'Content-Type': 'application/json' },
            });
            Alert.alert('Sucesso', 'Excluído!');
            carregarUsuarios();
          } catch {
            Alert.alert('Erro', 'Falha ao excluir.');
          } finally {
            setCarregando(false);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Usuario }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => abrirEdicao(item)} style={{ flex: 1 }}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.info}>Bairro: {item.bairro}</Text>
        <Text style={styles.info}>Celular: {item.celular}</Text>
        <Text style={styles.valor}>R$ {(parseFloat(item.valor) || 0).toFixed(2)}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => excluirUsuario(item.id)} style={styles.lixeira}>
        <FontAwesome name="trash" style={styles.iconeLixeira} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gerenciar Usuários</Text>
      <TextInput style={styles.busca} placeholder="Buscar..." value={filtro} onChangeText={setFiltro} />
      <TouchableOpacity style={styles.botaoNovo} onPress={() => setModalNovo(true)}>
        <Text style={styles.textoBotaoNovo}>+ Novo</Text>
      </TouchableOpacity>

      {carregando && !atualizando ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => carregarUsuarios(true)} />}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum usuário.</Text>}
        />
      )}

      {/* Modal Edição */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Editar</Text>
            <ScrollView>
              {editando &&
                Object.keys(editando)
                  .filter((key) => key !== 'id')
                  .map((key) => (
                    <View key={key} style={styles.inputGroup}>
                      <Text style={styles.label}>{key.toUpperCase()}:</Text>
                      <TextInput
                        style={styles.input}
                        value={String(editando[key as keyof Usuario])}
                        onChangeText={(t) => setEditando({ ...editando, [key]: t })}
                      />
                    </View>
                  ))}
            </ScrollView>
            <View style={styles.botoes}>
              <Button title="Cancelar" onPress={() => { setModalVisible(false); setEditando(null); }} color="#999" />
              <Button title="Salvar" onPress={salvarEdicao} color="#28a745" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Novo */}
      <Modal visible={modalNovo} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Usuário</Text>
            <ScrollView>
              {Object.keys(novo).map((key) => (
                <View key={key} style={styles.inputGroup}>
                  <Text style={styles.label}>{key.toUpperCase()}:</Text>
                  <TextInput
                    style={styles.input}
                    value={String(novo[key as keyof typeof novo] || '')}
                    onChangeText={(t) => setNovo({ ...novo, [key]: t })}
                    placeholder={key}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.botoes}>
              <Button title="Cancelar" onPress={() => setModalNovo(false)} color="#999" />
              <Button title="Criar" onPress={criarNovo} color="#007bff" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 12, color: '#333' },
  busca: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  botaoNovo: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  textoBotaoNovo: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, marginVertical: 6, borderRadius: 10, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  info: { fontSize: 14, color: '#555', marginTop: 2 },
  valor: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginTop: 4 },
  lixeira: { marginLeft: 10, padding: 8 },
  iconeLixeira: { fontSize: 20, color: '#dc3545' },
  vazio: { textAlign: 'center', color: '#999', fontSize: 16, marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', maxHeight: '90%', borderRadius: 12, padding: 20, elevation: 5 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, color: '#333', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, backgroundColor: '#f9f9f9' },
  botoes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
});