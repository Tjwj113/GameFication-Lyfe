# 🎮 RPG Gamification - Plugin para Obsidian

Transforme suas tarefas do Obsidian em uma aventura RPG épica! Ganhe XP, colete Gold, evolua seu personagem e desbloqueie equipamentos poderosos enquanto completa suas metas diárias.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Obsidian](https://img.shields.io/badge/obsidian-0.15.0+-purple)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Funcionalidades

### 🧙 Sistema de Personagem
- **3 Classes**: Guerreiro ⚔️, Arqueiro 🏹, Mago 🔮
- **2 Gêneros**: Masculino 🧔 / Feminino 👩
- **Atributos**: HP, ATK, DEF, Level, XP, Gold
- **Sistema de Inventário**: Equipe armas e armaduras

### 📈 Sistema de Progressão
- **Tarefas Pequenas**: +5 XP, +2 Gold
- **Tarefas Médias**: +15 XP, +5 Gold
- **Tarefas Grandes**: +30 XP, +10 Gold
- **Level Up**: A cada 100 XP (+10 HP, +2 ATK, +1 DEF)

### 🎯 Missões Especiais
- **🌅 Diária**: Complete 3 tarefas → +10 XP bônus
- **📅 Semanal**: Complete 5 tarefas médias/grandes → +50 XP
- **🗓️ Mensal**: Complete 3 tarefas grandes → +100 XP + item raro

### 🏪 Loja de Itens
- **Armas**: Espadas, Arcos, Cajados (+ATK)
- **Armaduras**: Proteções diversas (+DEF, +HP)
- **Poções**: Restauração de vida (+HP)

### 📊 Dashboard Visual
- Estatísticas em tempo real
- Barra de progresso de XP
- Histórico de tarefas
- Progresso de missões

---

## 📦 Instalação

### Método 1: Instalação Manual (Recomendado)

1. **Baixe os arquivos do plugin**
   - Clone ou baixe este repositório

2. **Copie para o Obsidian**
   ```bash
   # Navegue até seu vault
   cd /caminho/para/seu/vault/.obsidian/plugins/
   
   # Crie a pasta do plugin
   mkdir gamification-rpg
   cd gamification-rpg
   
   # Copie todos os arquivos do plugin para esta pasta
   ```

3. **Instale as dependências**
   ```bash
   npm install
   ```

4. **Compile o plugin**
   ```bash
   npm run build
   ```

5. **Ative no Obsidian**
   - Abra Obsidian
   - Vá em Settings → Community plugins
   - Encontre "RPG Gamification"
   - Ative o toggle ✅

### Método 2: Desenvolvimento com Hot Reload

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/obsidian-rpg-gamification.git

# Entre na pasta
cd obsidian-rpg-gamification

# Instale dependências
npm install

# Modo desenvolvimento (auto-reload)
npm run dev
```

---

## 🎮 Como Usar

### Configuração Inicial

1. **Abra o Dashboard**
   - Clique no ícone 🎮 na barra lateral
   - Ou: `Ctrl/Cmd + P` → "Abrir Dashboard RPG"

2. **Configure seu Personagem**
   - Vá em Settings → RPG Gamification
   - Escolha nome, gênero e classe

### Adicionando Tarefas

**Pelo Dashboard:**
```
1. Clique em "➕ Adicionar Tarefa"
2. Digite a descrição
3. Escolha o tamanho
4. Clique em "Completar"
```

**Por Comandos:**
```
Ctrl/Cmd + P → Digite:
- "Adicionar Tarefa Pequena"
- "Adicionar Tarefa Média"
- "Adicionar Tarefa Grande"
```

### Comprando Itens

1. Clique em "🏪 Loja" no Dashboard
2. Navegue pelos itens disponíveis
3. Clique em "💰 Comprar" no item desejado
4. O item será adicionado ao seu inventário
5. Bônus aplicados automaticamente

---

## 🛠️ Estrutura de Arquivos

```
gamification-rpg/
├── main.ts              # Código principal do plugin
├── main.js              # Código compilado (gerado)
├── manifest.json        # Configurações do plugin
├── package.json         # Dependências npm
├── tsconfig.json        # Configuração TypeScript
├── esbuild.config.mjs   # Configuração de build
├── versions.json        # Controle de versões
├── styles.css           # Estilos (opcional)
├── .gitignore          # Arquivos ignorados
└── README.md           # Esta documentação
```

---

## ⚙️ Configurações

### Personalizações Disponíveis

**Settings → RPG Gamification:**
- Nome do Personagem
- Gênero (Masculino/Feminino)
- Classe (Guerreiro/Arqueiro/Mago)

### Modificando Valores (Avançado)

Edite `main.ts` para ajustar:

**Recompensas de Tarefas:**
```typescript
const rewards = {
  small: { xp: 5, gold: 2 },
  medium: { xp: 15, gold: 5 },
  large: { xp: 30, gold: 10 }
};
```

**XP por Nível:**
```typescript
const xpNeeded = char.level * 100; // Altere 100 para ajustar
```

**Novos Itens na Loja:**
```typescript
DEFAULT_SHOP_ITEMS.push({
  name: 'Espada Lendária',
  type: 'weapon',
  cost: 150,
  bonus: { atk: 30 }
});
```

---

## 🐛 Solução de Problemas

### Plugin não aparece

**Problema:** Plugin não está na lista
**Solução:**
1. Verifique se está em `.obsidian/plugins/gamification-rpg/`
2. Confirme que `manifest.json` existe
3. Reinicie o Obsidian

### Erro ao compilar

**Problema:** `npm run build` falha
**Solução:**
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstalar
npm install
npm run build
```

### Dashboard não abre

**Problema:** Clico no ícone e nada acontece
**Solução:**
1. Use o comando: `Ctrl/Cmd + P` → "Abrir Dashboard RPG"
2. Verifique Console (Ctrl/Cmd + Shift + I) por erros
3. Desative e reative o plugin

### Dados não salvam

**Problema:** Progresso perdido ao fechar
**Solução:**
- Os dados são salvos automaticamente
- Verifique permissões da pasta `.obsidian/`
- Não feche o Obsidian durante salvamento

---

## 🔄 Atualizações

### Como Atualizar

```bash
# Baixe a nova versão
git pull origin main

# Recompile
npm run build

# Reinicie o Obsidian
```

---

## 📊 Roadmap Futuro

- [ ] Sistema de conquistas (achievements)
- [ ] Gráficos de progresso
- [ ] Exportação de relatórios
- [ ] Sistema de batalhas contra "monstros"
- [ ] Multiplayer (compartilhamento de progresso)
- [ ] Temas visuais customizáveis
- [ ] Integração com calendário
- [ ] Sistema de guilds/grupos

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Changelog

### v1.0.0 (2024-11-03)
- 🎉 Lançamento inicial
- ✅ Sistema completo de personagem
- ✅ Sistema de tarefas e XP
- ✅ Loja de itens
- ✅ Missões diárias/semanais/mensais
- ✅ Dashboard visual
- ✅ Inventário e equipamentos

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 💡 Créditos

Desenvolvido com ❤️ para a comunidade Obsidian

**Tecnologias:**
- [Obsidian API](https://docs.obsidian.md/)
- TypeScript
- esbuild

---

## 📞 Suporte

- 📧 **Issues**: [GitHub Issues](https://github.com/seu-usuario/obsidian-rpg-gamification/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/obsidian-rpg-gamification/discussions)
- 📚 **Documentação**: [Wiki](https://github.com/seu-usuario/obsidian-rpg-gamification/wiki)

---

## 🌟 Apoie o Projeto

Se você gosta deste plugin, considere:
- ⭐ Dar uma estrela no GitHub
- 🐛 Reportar bugs
- 💡 Sugerir novas features
- 📢 Compartilhar com outros usuários

---

**Boa aventura! 🗡️🛡️✨**