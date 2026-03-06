# 📱 AppUsuarios — BTech

> Aplicativo mobile para gerenciamento de usuários/clientes, desenvolvido com React Native + Expo.

---

## 🚀 Funcionalidades

- 👥 **Listagem de clientes** — exibe todos os clientes cadastrados
- 🔍 **Busca incremental** — filtra clientes em tempo real a partir da 1ª letra digitada
- ➕ **Cadastro de clientes** — formulário completo com nome, celular, CEP, bairro, valor e status
- ✏️ **Edição de clientes** — edita qualquer informação do cliente
- 🗑️ **Exclusão de clientes** — remove clientes com confirmação
- 🎛️ **Filtro por status** — filtra entre Todos, Ativos e Inativos
- 📂 **Menu drawer lateral** — menu deslizante pela direita com acesso rápido às funções
- 🔄 **Atualização por pull-to-refresh** — puxa a lista para baixo para recarregar

---

## 🎨 Identidade Visual

- Cores: Azul escuro `#1a3a5c` + Verde `#7ac231`
- Logo: BTech — exibido no header, splash screen e ícone do app

---

## 🛠️ Tecnologias

- [React Native](https://reactnative.dev/)
- [Expo SDK 54](https://expo.dev/)
- [Expo Router](https://expo.github.io/router/)
- [EAS Build](https://docs.expo.dev/build/introduction/) — geração do APK
- [Axios](https://axios-http.com/) — requisições HTTP
- [@react-native-picker/picker](https://github.com/react-native-picker/picker)
- [@expo/vector-icons](https://docs.expo.dev/guides/icons/)

---

## ⚙️ Como rodar o projeto

**1. Instalar dependências**
```bash
npm install
```

**2. Corrigir compatibilidade das bibliotecas**
```bash
npx expo install --fix
```

**3. Iniciar o app**
```bash
npx expo start --clear
```

**4. Abrir no celular**
- Instale o **Expo Go** no celular
- Escaneie o QR code que aparece no terminal

---

## 📦 Gerar APK (Android)

```bash
$env:EAS_NO_VCS=1; eas build -p android --profile preview
```

> O APK é gerado na nuvem pelo EAS Build. Acompanhe em [expo.dev](https://expo.dev).

---

## 📁 Estrutura do projeto

```
AppUsuarios/
├── app/
│   ├── index.tsx          # Tela principal
│   ├── _layout.tsx        # Layout raiz com providers
│   └── context/
│       └── FiltroContext.tsx  # Contexto do filtro de status
├── assets/
│   └── images/
│       ├── LogoG1.png         # Ícone e splash screen
│       └── LogoG1-512.png     # Adaptive icon Android
├── app.json               # Configuração do Expo
└── package.json           # Dependências
```

---

## 🔗 API

- Base URL: `http://esbsouza.com.br/ag1/`
- Operações: `sread`, `screate`, `supdate1`, `sdelete`

---

## 📋 Versão

| Campo | Valor |
|---|---|
| Versão | 1.0.0 |
| versionCode Android | 1 |
| Expo SDK | 54 |
| React Native | 0.81.5 |

---

*Desenvolvido por **BTech — Serviços em Informática***
