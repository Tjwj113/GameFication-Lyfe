/*
RPG Gamification Plugin for Obsidian
Version 1.0.0 - Standalone
*/

const { Plugin, PluginSettingTab, Setting, Notice, ItemView } = require('obsidian');

const VIEW_TYPE = 'gamification-view';

const DEFAULT_SETTINGS = {
    character: {
        name: 'Herói',
        gender: 'male',
        class: 'warrior',
        level: 1,
        xp: 0,
        gold: 0,
        hp: 100,
        maxHp: 100,
        atk: 10,
        def: 5,
        inventory: [],
        tasksCompleted: [],
        dailyProgress: 0,
        weeklyProgress: 0,
        monthlyProgress: 0,
        lastDaily: '',
        lastWeekly: '',
        lastMonthly: ''
    },
    shopItems: [
        { name: 'Espada de Aço', type: 'weapon', cost: 25, bonus: { atk: 5 } },
        { name: 'Espada Flamejante', type: 'weapon', cost: 50, bonus: { atk: 12 } },
        { name: 'Arco Élfico', type: 'weapon', cost: 30, bonus: { atk: 7 } },
        { name: 'Arco Lendário', type: 'weapon', cost: 60, bonus: { atk: 15 } },
        { name: 'Cajado Místico', type: 'weapon', cost: 35, bonus: { atk: 8 } },
        { name: 'Cajado do Arcano', type: 'weapon', cost: 70, bonus: { atk: 18 } },
        { name: 'Armadura de Couro', type: 'armor', cost: 20, bonus: { def: 5 } },
        { name: 'Armadura de Ferro', type: 'armor', cost: 45, bonus: { def: 10 } },
        { name: 'Armadura Dragônica', type: 'armor', cost: 100, bonus: { def: 25 } },
        { name: 'Capa de Energia', type: 'armor', cost: 40, bonus: { def: 8, hp: 10 } },
        { name: 'Poção de Vida', type: 'potion', cost: 5, bonus: { hp: 10 } },
        { name: 'Poção Grande', type: 'potion', cost: 15, bonus: { hp: 30 } }
    ]
};

class GamificationView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE;
    }

    getDisplayText() {
        return '🎮 RPG Dashboard';
    }

    getIcon() {
        return 'gamepad-2';
    }

    async onOpen() {
        this.draw();
    }

    draw() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('gamification-view');

        const char = this.plugin.settings.character;
        
        // Adicionar estilos inline
        this.addStyles();

        // Header
        const header = container.createEl('div', { cls: 'gam-header' });
        header.createEl('h2', { text: `${this.getCharEmoji()} ${char.name} - Nível ${char.level}` });

        // Stats
        const stats = container.createEl('div', { cls: 'gam-stats' });
        stats.createEl('div', { cls: 'stat', text: `⚔️ ATK: ${char.atk}` });
        stats.createEl('div', { cls: 'stat', text: `🛡️ DEF: ${char.def}` });
        stats.createEl('div', { cls: 'stat', text: `❤️ HP: ${char.hp}/${char.maxHp}` });
        stats.createEl('div', { cls: 'stat', text: `💰 Gold: ${char.gold}` });

        // XP Progress
        const xpSection = container.createEl('div', { cls: 'gam-section' });
        const xpNeeded = char.level * 100;
        const xpPercent = (char.xp / xpNeeded) * 100;
        xpSection.createEl('p', { text: `📈 Progresso: ${char.xp}/${xpNeeded} XP` });
        const bar = xpSection.createEl('div', { cls: 'progress-bar' });
        bar.createEl('div', { 
            cls: 'progress-fill', 
            attr: { style: `width: ${xpPercent}%` } 
        });

        // Inventory
        const inv = container.createEl('div', { cls: 'gam-section' });
        inv.createEl('h3', { text: '🎒 Inventário' });
        if (char.inventory.length === 0) {
            inv.createEl('p', { text: 'Vazio' });
        } else {
            const list = inv.createEl('ul');
            char.inventory.forEach(item => {
                const bonus = Object.entries(item.bonus)
                    .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
                    .join(', ');
                list.createEl('li', { text: `${item.name} (${bonus})` });
            });
        }

        // Missions
        const missions = container.createEl('div', { cls: 'gam-section' });
        missions.createEl('h3', { text: '🎯 Missões' });
        missions.createEl('p', { text: `🌅 Diária: ${char.dailyProgress}/3 tarefas (+10 XP bônus)` });
        missions.createEl('p', { text: `📅 Semanal: ${char.weeklyProgress}/5 tarefas (+50 XP)` });
        missions.createEl('p', { text: `🗓️ Mensal: ${char.monthlyProgress}/3 grandes (+100 XP)` });

        // Buttons
        const actions = container.createEl('div', { cls: 'gam-actions' });
        
        const addBtn = actions.createEl('button', { text: '➕ Adicionar Tarefa' });
        addBtn.onclick = () => this.plugin.showTaskDialog();

        const shopBtn = actions.createEl('button', { text: '🏪 Loja' });
        shopBtn.onclick = () => this.plugin.showShop();

        const resetBtn = actions.createEl('button', { text: '🔄 Reset' });
        resetBtn.onclick = () => this.plugin.resetCharacter();

        // Recent Tasks
        const recent = container.createEl('div', { cls: 'gam-section' });
        recent.createEl('h3', { text: '📋 Tarefas Recentes' });
        const tasks = char.tasksCompleted.slice(-5).reverse();
        if (tasks.length === 0) {
            recent.createEl('p', { text: 'Nenhuma tarefa completada' });
        } else {
            const list = recent.createEl('ul');
            tasks.forEach(t => {
                const emoji = t.size === 'small' ? '✅' : t.size === 'medium' ? '⚔️' : '🏆';
                list.createEl('li', { text: `${emoji} ${t.description} (+${t.xp} XP, +${t.gold} Gold) - ${t.date}` });
            });
        }
    }

    getCharEmoji() {
        const { gender, class: c } = this.plugin.settings.character;
        const emojis = {
            male: { warrior: '🧔⚔️', archer: '🧔🏹', mage: '🧙‍♂️' },
            female: { warrior: '👩⚔️', archer: '👩🏹', mage: '🧙‍♀️' }
        };
        return emojis[gender][c];
    }

    addStyles() {
        if (document.getElementById('gam-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gam-styles';
        style.textContent = `
            .gamification-view { padding: 20px; }
            .gam-header { margin-bottom: 20px; text-align: center; border-bottom: 2px solid var(--background-modifier-border); padding-bottom: 15px; }
            .gam-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin: 15px 0; }
            .stat { background: var(--background-secondary); padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; }
            .gam-section { margin: 20px 0; padding: 15px; background: var(--background-secondary); border-radius: 5px; }
            .progress-bar { width: 100%; height: 20px; background: var(--background-modifier-border); border-radius: 10px; overflow: hidden; margin-top: 8px; }
            .progress-fill { height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A); transition: width 0.3s; }
            .gam-actions { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
            .gam-actions button { flex: 1; min-width: 120px; padding: 10px; border-radius: 5px; cursor: pointer; background: var(--interactive-accent); color: var(--text-on-accent); border: none; font-weight: bold; }
            .gam-actions button:hover { opacity: 0.8; }
            .gam-section ul { list-style: none; padding: 0; }
            .gam-section li { padding: 5px; margin: 3px 0; background: var(--background-primary); border-radius: 3px; }
        `;
        document.head.appendChild(style);
    }
}

class GamificationPlugin extends Plugin {
    async onload() {
        await this.loadSettings();

        this.registerView(VIEW_TYPE, (leaf) => new GamificationView(leaf, this));

        this.addRibbonIcon('gamepad-2', 'RPG Dashboard', () => this.activateView());

        this.addCommand({
            id: 'open-dashboard',
            name: 'Abrir Dashboard RPG',
            callback: () => this.activateView()
        });

        this.addCommand({
            id: 'add-small',
            name: 'Adicionar Tarefa Pequena',
            callback: () => this.showTaskDialog('small')
        });

        this.addCommand({
            id: 'add-medium',
            name: 'Adicionar Tarefa Média',
            callback: () => this.showTaskDialog('medium')
        });

        this.addCommand({
            id: 'add-large',
            name: 'Adicionar Tarefa Grande',
            callback: () => this.showTaskDialog('large')
        });

        this.addSettingTab(new GamificationSettingTab(this.app, this));
    }

    async activateView() {
        let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
        
        if (!leaf) {
            const rightLeaf = this.app.workspace.getRightLeaf(false);
            await rightLeaf.setViewState({ type: VIEW_TYPE, active: true });
            leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
        }

        if (leaf) {
            this.app.workspace.revealLeaf(leaf);
        }
    }

    showTaskDialog(size) {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000;';
        
        const content = document.createElement('div');
        content.style.cssText = 'background:var(--background-primary);padding:25px;border-radius:8px;max-width:400px;width:90%;';
        
        content.innerHTML = `
            <h2>➕ Nova Tarefa</h2>
            <input type="text" id="task-desc" placeholder="Descrição" style="width:100%;margin:10px 0;padding:10px;border-radius:5px;background:var(--background-secondary);border:1px solid var(--background-modifier-border);color:var(--text-normal);">
            <select id="task-size" style="width:100%;margin:10px 0;padding:10px;border-radius:5px;background:var(--background-secondary);border:1px solid var(--background-modifier-border);color:var(--text-normal);">
                <option value="small" ${size === 'small' ? 'selected' : ''}>✅ Pequena (5 XP, 2 Gold)</option>
                <option value="medium" ${size === 'medium' ? 'selected' : ''}>⚔️ Média (15 XP, 5 Gold)</option>
                <option value="large" ${size === 'large' ? 'selected' : ''}>🏆 Grande (30 XP, 10 Gold)</option>
            </select>
            <div style="display:flex;gap:10px;margin-top:15px;">
                <button id="submit" style="flex:1;padding:10px;border-radius:5px;background:var(--interactive-accent);color:var(--text-on-accent);border:none;cursor:pointer;font-weight:bold;">Completar</button>
                <button id="cancel" style="flex:1;padding:10px;border-radius:5px;background:var(--background-secondary);color:var(--text-normal);border:none;cursor:pointer;">Cancelar</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        const input = content.querySelector('#task-desc');
        const select = content.querySelector('#task-size');
        
        content.querySelector('#submit').onclick = () => {
            if (input.value.trim()) {
                this.addTask(input.value.trim(), select.value);
                document.body.removeChild(modal);
            } else {
                new Notice('Digite uma descrição!');
            }
        };
        
        content.querySelector('#cancel').onclick = () => {
            document.body.removeChild(modal);
        };
        
        input.focus();
    }

    addTask(desc, size) {
        const rewards = {
            small: { xp: 5, gold: 2 },
            medium: { xp: 15, gold: 5 },
            large: { xp: 30, gold: 10 }
        };

        const r = rewards[size];
        const task = {
            description: desc,
            size: size,
            xp: r.xp,
            gold: r.gold,
            date: new Date().toLocaleDateString('pt-BR')
        };

        this.settings.character.tasksCompleted.push(task);
        this.settings.character.xp += r.xp;
        this.settings.character.gold += r.gold;

        // Missions
        const today = new Date().toDateString();
        if (this.settings.character.lastDaily !== today) {
            this.settings.character.dailyProgress = 0;
            this.settings.character.lastDaily = today;
        }
        this.settings.character.dailyProgress++;

        if (this.settings.character.dailyProgress === 3) {
            this.settings.character.xp += 10;
            new Notice('🎉 Missão Diária Completa! +10 XP!');
        }

        this.checkLevelUp();
        this.saveSettings();
        this.refreshView();
        
        new Notice(`✅ +${r.xp} XP, +${r.gold} Gold`);
    }

    checkLevelUp() {
        const xpNeeded = this.settings.character.level * 100;
        if (this.settings.character.xp >= xpNeeded) {
            this.settings.character.level++;
            this.settings.character.xp -= xpNeeded;
            this.settings.character.maxHp += 10;
            this.settings.character.hp = this.settings.character.maxHp;
            this.settings.character.atk += 2;
            this.settings.character.def += 1;
            new Notice(`🎊 Level Up! Nível ${this.settings.character.level}!`);
        }
    }

    showShop() {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000;overflow:auto;';
        
        const content = document.createElement('div');
        content.style.cssText = 'background:var(--background-primary);padding:25px;border-radius:8px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;';
        
        let html = `<h2>🏪 Loja de Itens</h2><p>💰 Gold: ${this.settings.character.gold}</p><div style="display:grid;gap:10px;">`;
        
        this.settings.shopItems.forEach((item, i) => {
            const bonus = Object.entries(item.bonus).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
            const canBuy = this.settings.character.gold >= item.cost;
            html += `
                <div style="border:1px solid var(--background-modifier-border);padding:12px;border-radius:5px;">
                    <strong>${item.name}</strong> - ${item.cost} Gold<br>
                    <small>${bonus}</small><br>
                    <button class="buy" data-i="${i}" ${!canBuy ? 'disabled' : ''} 
                        style="margin-top:8px;padding:8px 15px;border-radius:5px;background:${canBuy ? 'var(--interactive-accent)' : 'var(--background-secondary)'};color:${canBuy ? 'var(--text-on-accent)' : 'var(--text-muted)'};border:none;cursor:${canBuy ? 'pointer' : 'not-allowed'};">
                        ${canBuy ? '💰 Comprar' : '❌ Sem Gold'}
                    </button>
                </div>
            `;
        });
        
        html += `</div><button id="close" style="margin-top:20px;width:100%;padding:10px;border-radius:5px;background:var(--background-secondary);border:none;cursor:pointer;">Fechar</button>`;
        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        content.querySelectorAll('.buy').forEach(btn => {
            btn.onclick = (e) => {
                const i = parseInt(e.target.dataset.i);
                this.buyItem(i);
                document.body.removeChild(modal);
            };
        });
        
        content.querySelector('#close').onclick = () => document.body.removeChild(modal);
    }

    buyItem(i) {
        const item = this.settings.shopItems[i];
        
        if (this.settings.character.gold < item.cost) {
            new Notice('❌ Gold insuficiente!');
            return;
        }

        this.settings.character.gold -= item.cost;
        this.settings.character.inventory.push(item);

        if (item.bonus.atk) this.settings.character.atk += item.bonus.atk;
        if (item.bonus.def) this.settings.character.def += item.bonus.def;
        if (item.bonus.hp) {
            this.settings.character.maxHp += item.bonus.hp;
            this.settings.character.hp += item.bonus.hp;
        }

        this.saveSettings();
        this.refreshView();
        new Notice(`✅ ${item.name} comprado!`);
    }

    async resetCharacter() {
        this.settings.character = { ...DEFAULT_SETTINGS.character };
        await this.saveSettings();
        this.refreshView();
        new Notice('🔄 Resetado!');
    }

    refreshView() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
        leaves.forEach(leaf => {
            if (leaf.view instanceof GamificationView) {
                leaf.view.draw();
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class GamificationSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: '⚙️ Configurações RPG' });

        new Setting(containerEl)
            .setName('Nome do Personagem')
            .addText(text => text
                .setValue(this.plugin.settings.character.name)
                .onChange(async (v) => {
                    this.plugin.settings.character.name = v || 'Herói';
                    await this.plugin.saveSettings();
                    this.plugin.refreshView();
                }));

        new Setting(containerEl)
            .setName('Gênero')
            .addDropdown(dd => dd
                .addOption('male', '🧔 Masculino')
                .addOption('female', '👩 Feminino')
                .setValue(this.plugin.settings.character.gender)
                .onChange(async (v) => {
                    this.plugin.settings.character.gender = v;
                    await this.plugin.saveSettings();
                    this.plugin.refreshView();
                }));

        new Setting(containerEl)
            .setName('Classe')
            .addDropdown(dd => dd
                .addOption('warrior', '⚔️ Guerreiro(a)')
                .addOption('archer', '🏹 Arqueiro(a)')
                .addOption('mage', '🔮 Mago(a)')
                .setValue(this.plugin.settings.character.class)
                .onChange(async (v) => {
                    this.plugin.settings.character.class = v;
                    await this.plugin.saveSettings();
                    this.plugin.refreshView();
                }));
    }
}

module.exports = GamificationPlugin;