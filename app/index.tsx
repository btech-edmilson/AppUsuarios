// app/index.tsx — BTech - Gerenciar Usuários com Drawer Lateral

import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFiltro } from './context/FiltroContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 260;

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

export default function App() {
  const { filtroStatus, setFiltroStatus } = useFiltro();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  // Drawer
  const [drawerAberto, setDrawerAberto] = useState(false);
  const drawerAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  // FlatList ref para scroll ao topo
  const flatListRef = useRef<FlatList>(null);

  // Modal Novo Usuário
  const [modalNovoVisible, setModalNovoVisible] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoCelular, setNovoCelular] = useState('');
  const [novoCep, setNovoCep] = useState('');
  const [novoBairro, setNovoBairro] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoDtcad, setNovoDtcad] = useState('');
  const [novoDtaltera, setNovoDtaltera] = useState('');
  const [novoAtivo, setNovoAtivo] = useState<'s' | 'n'>('s');

  // Modal Edição
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCelular, setEditCelular] = useState('');
  const [editCep, setEditCep] = useState('');
  const [editBairro, setEditBairro] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editDtcad, setEditDtcad] = useState('');
  const [editDtaltera, setEditDtaltera] = useState('');
  const [editAtivo, setEditAtivo] = useState<'s' | 'n'>('s');

  const API_BASE = 'http://esbsouza.com.br/ag1/';
  const hoje = new Date().toISOString().split('T')[0];

  // ── Drawer ──────────────────────────────────────────
  const abrirDrawer = () => {
    setDrawerAberto(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const fecharDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: DRAWER_WIDTH,
      duration: 240,
      useNativeDriver: true,
    }).start(() => setDrawerAberto(false));
  };

  const selecionarFiltro = (valor: 'todos' | 'ativo' | 'inativo') => {
    setFiltroStatus(valor);
    fecharDrawer();
  };

  const abrirNovoUsuario = () => {
    fecharDrawer();
    setTimeout(() => {
      setNovoDtcad(hoje);
      setNovoDtaltera(hoje);
      setModalNovoVisible(true);
    }, 300);
  };

  const voltarAoTopo = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    fecharDrawer();
  };

  // ── API ─────────────────────────────────────────────
  const carregarUsuarios = async (isRefresh = false) => {
    if (isRefresh) setAtualizando(true);
    else setCarregando(true);
    try {
      const res = await axios.get(`${API_BASE}?fn=sread`, { timeout: 15000 });
      if (res.data?.siieusers && Array.isArray(res.data.siieusers)) {
        setUsuarios(res.data.siieusers);
      } else {
        setUsuarios([]);
      }
    } catch {
      Alert.alert('Erro', 'Falha ao carregar usuários');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

const usuariosFiltrados = filtroNome.trim() === ''
    ? usuarios.filter((user) => {
        if (filtroStatus === 'ativo') return user.ativo === 's';
        if (filtroStatus === 'inativo') return user.ativo !== 's';
        return true;
      })
    : usuarios.filter((user) => {
        const nomeClean = user.nome.replace(/\s+/g, ' ').trim().toLowerCase();
        const buscaClean = filtroNome.replace(/\s+/g, ' ').trim().toLowerCase();
        const nomeOk = nomeClean.includes(buscaClean);
        if (filtroStatus === 'ativo') return nomeOk && user.ativo === 's';
        if (filtroStatus === 'inativo') return nomeOk && user.ativo !== 's';
        return nomeOk;
      });

  const excluirUsuario = async (id: string, nome: string) => {
    Alert.alert(
      'Excluir',
      `Tem certeza que deseja excluir "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.post(`${API_BASE}?fn=sdelete`, { id: parseInt(id) });
              Alert.alert('Sucesso', 'Usuário excluído!');
              carregarUsuarios();
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const salvarNovo = async () => {
    if (!novoNome.trim() || !novoCelular.trim()) {
      Alert.alert('Atenção', 'Nome e celular são obrigatórios');
      return;
    }
    try {
      await axios.post(`${API_BASE}?fn=screate`, {
        nome: novoNome,
        celular: novoCelular,
        cep: novoCep,
        bairro: novoBairro,
        valor: novoValor || '0',
        ativo: novoAtivo,
        dtcad: novoDtcad || hoje,
        dtaltera: novoDtaltera || hoje,
      });
      Alert.alert('Sucesso', 'Usuário criado!');
      setModalNovoVisible(false);
      limparNovo();
      carregarUsuarios();
    } catch {
      Alert.alert('Erro', 'Falha ao criar usuário');
    }
  };

  const salvarEdicao = async () => {
    if (!editNome.trim() || !editCelular.trim()) {
      Alert.alert('Atenção', 'Nome e celular são obrigatórios');
      return;
    }
    try {
      await axios.post(`${API_BASE}?fn=supdate1`, {
        id: editando?.id,
        nome: editNome,
        celular: editCelular,
        cep: editCep,
        bairro: editBairro,
        valor: editValor || '0',
        ativo: editAtivo,
        dtcad: editDtcad,
        dtaltera: editDtaltera || hoje,
      });
      Alert.alert('Sucesso', 'Usuário atualizado!');
      setEditando(null);
      carregarUsuarios();
    } catch {
      Alert.alert('Erro', 'Falha ao atualizar');
    }
  };

  const limparNovo = () => {
    setNovoNome(''); setNovoCelular(''); setNovoCep(''); setNovoBairro('');
    setNovoValor(''); setNovoAtivo('s'); setNovoDtcad(''); setNovoDtaltera('');
  };

  const abrirEdicao = (item: Usuario) => {
    setEditando(item);
    setEditNome(item.nome);
    setEditCelular(item.celular || '');
    setEditCep(item.cep || '');
    setEditBairro(item.bairro || '');
    setEditValor(item.valor || '');
    setEditAtivo(item.ativo as 's' | 'n');
    setEditDtcad(item.dtcad || '');
    setEditDtaltera(item.dtaltera || '');
  };

  const labelFiltro = filtroStatus === 'todos' ? 'Todos' : filtroStatus === 'ativo' ? 'Ativos' : 'Inativos';

  const renderItem = ({ item }: { item: Usuario }) => (
    <View style={styles.card}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => abrirEdicao(item)}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.info}>Altera: {item.dtaltera || '—'}</Text>
        <Text style={[styles.status, item.ativo === 's' ? styles.ativoVerde : styles.ativoVermelho]}>
          {item.ativo === 's' ? 'Ativo' : 'Inativo'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.lixeira} onPress={() => excluirUsuario(item.id, item.nome)}>
        <FontAwesome name="trash" size={26} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/LogoG1.jpg')}
          style={styles.logoHeader}
          resizeMode="contain"
        />
        <Text style={styles.titulo}>Gerenciar Usuários</Text>
        <TouchableOpacity style={styles.menuBtn} onPress={abrirDrawer}>
          <FontAwesome name="bars" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* BUSCA */}
      <TextInput
        style={styles.busca}
        placeholder="Buscar por nome..."
        value={filtroNome}
        onChangeText={setFiltroNome}
      />

      {/* INDICADOR DE FILTRO ATIVO */}
      {filtroStatus !== 'todos' && (
        <View style={styles.filtroAtivo}>
          <FontAwesome name="filter" size={13} color="#1a3a5c" />
          <Text style={styles.filtroAtivoText}>  Exibindo: {labelFiltro}</Text>
          <TouchableOpacity onPress={() => setFiltroStatus('todos')}>
            <Text style={styles.filtroAtivoLimpar}>  ✕ Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LISTA */}
      {carregando && !atualizando ? (
        <ActivityIndicator size="large" color="#1a3a5c" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={usuariosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => carregarUsuarios(true)} />}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum usuário encontrado</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}

      {/* DRAWER OVERLAY */}
      {drawerAberto && (
        <TouchableWithoutFeedback onPress={fecharDrawer}>
          <View style={styles.drawerOverlay} />
        </TouchableWithoutFeedback>
      )}

      {/* DRAWER LATERAL DIREITO */}
      {drawerAberto && (
        <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>

          {/* Logo no drawer */}
          <View style={styles.drawerHeader}>
            <Image
              source={require('../assets/images/LogoG1.jpg')}
              style={styles.drawerLogo}
              resizeMode="contain"
            />
            <Text style={styles.drawerTitulo}>BTech</Text>
          </View>

          <View style={styles.drawerDivider} />

          {/* Novo Usuário */}
          <TouchableOpacity style={styles.drawerItem} onPress={abrirNovoUsuario}>
            <FontAwesome name="plus-circle" size={20} color="#7ac231" />
            <Text style={styles.drawerItemText}>Novo Usuário</Text>
          </TouchableOpacity>

          {/* Voltar ao topo */}
          <TouchableOpacity style={styles.drawerItem} onPress={voltarAoTopo}>
            <FontAwesome name="home" size={20} color="#7ac231" />
            <Text style={styles.drawerItemText}>Início (topo)</Text>
          </TouchableOpacity>

          <View style={styles.drawerDivider} />

          {/* Filtros */}
          <Text style={styles.drawerSecao}>FILTRAR POR STATUS</Text>

          {(['todos', 'ativo', 'inativo'] as const).map((opcao) => (
            <TouchableOpacity
              key={opcao}
              style={[styles.drawerFiltroItem, filtroStatus === opcao && styles.drawerFiltroAtivo]}
              onPress={() => selecionarFiltro(opcao)}
            >
              <FontAwesome
                name={filtroStatus === opcao ? 'dot-circle-o' : 'circle-o'}
                size={16}
                color={filtroStatus === opcao ? '#7ac231' : '#ccc'}
              />
              <Text style={[styles.drawerFiltroText, filtroStatus === opcao && styles.drawerFiltroTextAtivo]}>
                {opcao === 'todos' ? 'Todos' : opcao === 'ativo' ? 'Ativos' : 'Inativos'}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.drawerDivider} />

          {/* Fechar */}
          <TouchableOpacity style={styles.drawerFechar} onPress={fecharDrawer}>
            <FontAwesome name="times" size={16} color="#aaa" />
            <Text style={styles.drawerFecharText}>Fechar menu</Text>
          </TouchableOpacity>

        </Animated.View>
      )}

      {/* MODAL NOVO USUÁRIO */}
      <Modal animationType="slide" transparent={true} visible={modalNovoVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Usuário</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nome completo *</Text>
              <TextInput style={styles.modalInput} value={novoNome} onChangeText={setNovoNome} />

              <Text style={styles.label}>Celular *</Text>
              <TextInput style={styles.modalInput} value={novoCelular} onChangeText={setNovoCelular} keyboardType="phone-pad" />

              <Text style={styles.label}>CEP</Text>
              <TextInput style={styles.modalInput} value={novoCep} onChangeText={setNovoCep} keyboardType="numeric" />

              <Text style={styles.label}>Bairro</Text>
              <TextInput style={styles.modalInput} value={novoBairro} onChangeText={setNovoBairro} />

              <Text style={styles.label}>Valor (ex: 150.00)</Text>
              <TextInput style={styles.modalInput} value={novoValor} onChangeText={setNovoValor} keyboardType="decimal-pad" />

              <Text style={styles.label}>Data de cadastro (AAAA-MM-DD)</Text>
              <TextInput style={styles.modalInput} value={novoDtcad} onChangeText={setNovoDtcad} />

              <Text style={styles.label}>Data de alteração (AAAA-MM-DD)</Text>
              <TextInput style={styles.modalInput} value={novoDtaltera} onChangeText={setNovoDtaltera} />

              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={novoAtivo} onValueChange={setNovoAtivo} style={styles.pickerModal}>
                  <Picker.Item label="Ativo" value="s" />
                  <Picker.Item label="Inativo" value="n" />
                </Picker>
              </View>
            </ScrollView>
            <View style={styles.modalBotoes}>
              <TouchableOpacity style={[styles.modalBotao, styles.botaoCancelar]} onPress={() => { setModalNovoVisible(false); limparNovo(); }}>
                <Text style={styles.textoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBotao, styles.botaoSalvar]} onPress={salvarNovo}>
                <Text style={styles.textoSalvar}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL EDIÇÃO */}
      <Modal animationType="slide" transparent={true} visible={!!editando}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Editar Usuário</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nome completo *</Text>
              <TextInput style={styles.modalInput} value={editNome} onChangeText={setEditNome} />

              <Text style={styles.label}>Celular *</Text>
              <TextInput style={styles.modalInput} value={editCelular} onChangeText={setEditCelular} keyboardType="phone-pad" />

              <Text style={styles.label}>CEP</Text>
              <TextInput style={styles.modalInput} value={editCep} onChangeText={setEditCep} keyboardType="numeric" />

              <Text style={styles.label}>Bairro</Text>
              <TextInput style={styles.modalInput} value={editBairro} onChangeText={setEditBairro} />

              <Text style={styles.label}>Valor (ex: 150.00)</Text>
              <TextInput style={styles.modalInput} value={editValor} onChangeText={setEditValor} keyboardType="decimal-pad" />

              <Text style={styles.label}>Data de cadastro (AAAA-MM-DD)</Text>
              <TextInput style={styles.modalInput} value={editDtcad} onChangeText={setEditDtcad} />

              <Text style={styles.label}>Data de alteração (AAAA-MM-DD)</Text>
              <TextInput style={styles.modalInput} value={editDtaltera} onChangeText={setEditDtaltera} />

              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={editAtivo} onValueChange={setEditAtivo} style={styles.pickerModal}>
                  <Picker.Item label="Ativo" value="s" />
                  <Picker.Item label="Inativo" value="n" />
                </Picker>
              </View>
            </ScrollView>
            <View style={styles.modalBotoes}>
              <TouchableOpacity style={[styles.modalBotao, styles.botaoCancelar]} onPress={() => setEditando(null)}>
                <Text style={styles.textoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBotao, styles.botaoSalvar]} onPress={salvarEdicao}>
                <Text style={styles.textoSalvar}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },

  // Header
  header: {
    backgroundColor: '#1a3a5c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 6,
  },
  logoHeader: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  titulo: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#fff' },
  menuBtn: { padding: 8 },

  // Busca
  busca: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },

  // Filtro ativo badge
  filtroAtivo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#ddeeff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  filtroAtivoText: { fontSize: 13, color: '#1a3a5c', fontWeight: '600' },
  filtroAtivoLimpar: { fontSize: 13, color: '#dc3545', fontWeight: '600' },

  // Cards
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 18,
    borderRadius: 14,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#1a3a5c' },
  info: { fontSize: 14, color: '#666', marginTop: 4 },
  status: { fontSize: 15, fontWeight: 'bold', marginTop: 8 },
  ativoVerde: { color: '#7ac231' },
  ativoVermelho: { color: '#dc3545' },
  lixeira: { padding: 10, backgroundColor: '#ffeaea', borderRadius: 30 },
  vazio: { textAlign: 'center', color: '#999', fontSize: 18, marginTop: 60 },

  // Drawer
  drawerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute', top: 0, right: 0, bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#1a3a5c',
    zIndex: 20,
    elevation: 20,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  drawerHeader: { alignItems: 'center', marginBottom: 16 },
  drawerLogo: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  drawerTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  drawerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 },
  drawerSecao: { color: '#aac4e0', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  drawerItemText: { color: '#fff', fontSize: 16, marginLeft: 14, fontWeight: '600' },
  drawerFiltroItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10, marginBottom: 4 },
  drawerFiltroAtivo: { backgroundColor: 'rgba(122,194,49,0.15)' },
  drawerFiltroText: { color: '#aaa', fontSize: 15, marginLeft: 12 },
  drawerFiltroTextAtivo: { color: '#7ac231', fontWeight: 'bold' },
  drawerFechar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  drawerFecharText: { color: '#aaa', fontSize: 14, marginLeft: 10 },

  // Modais
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '92%', maxHeight: '90%', elevation: 15 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#1a3a5c' },
  modalInput: { backgroundColor: '#f9f9f9', padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 14, borderWidth: 1, borderColor: '#ddd' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 8 },
  pickerContainer: { marginVertical: 10, backgroundColor: '#f0f0f0', borderRadius: 10 },
  pickerModal: { height: 50 },
  modalBotoes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBotao: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 8 },
  botaoCancelar: { backgroundColor: '#6c757d' },
  botaoSalvar: { backgroundColor: '#7ac231' },
  textoCancelar: { color: '#fff', fontWeight: 'bold' },
  textoSalvar: { color: '#fff', fontWeight: 'bold' },
});
