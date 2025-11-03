import { App, Plugin, PluginSettingTab, Setting, Notice, WorkspaceLeaf, ItemView, TFile, Menu } from 'obsidian';

interface CharacterData {
    name: string;
    gender: 'male' | 'female';
    class: 'warrior' | 'archer' | 'mage';
    level: number;
    xp: number;
    gold: number;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    inventory: Item[];
    tasksCompleted: Task[];
    dailyProgress: number;
    weeklyProgress: number;
    monthlyProgress: number;
    lastDaily: string;
    lastWeekly: string;
    lastMonthly: string;
}

interface Item {
    name: string;
    type: 'weapon' | 'armor' | 'potion';
    cost: number;
    bonus: {
        atk?: number;
        def?: number;
        hp?: number;
    };
}

interface Task {
    description: string;
    size: 'small' | 'medium' | 'large';
    xp: number;
    gold: number;
    date: string;
}

interface GamificationSettings {
    character: CharacterData;
    shopItems: Item[];
}

const DEFAULT_SHOP_ITEMS: Item[] = [
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
];

const DEFAULT_SETTINGS: GamificationSettings = {
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
    shopItems: DEFAULT_SHOP_ITEMS
};

const VIEW_TYPE_GAMIFICATION = 'gamification-view';

class GamificationView extends ItemView {
    plugin: GamificationPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: GamificationPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_GAMIFICATION;
    }

    getDisplayText(): string {
        return '🎮 RPG Dashboard';
    }

    getIcon(): string {
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
        
        // Header
        const header = container.createEl('div', { cls: 'gamification-header' });
        header.createEl('h2', { text: `${this.getCharacterEmoji()} ${char.name} - Nível ${char.level}` });

        // Stats
        const stats = container.createEl('div', { cls: 'gamification-stats' });
        stats.createEl('div', { cls: 'stat-item', text: `⚔️ ATK: ${char.atk}` });
        stats.createEl('div', { cls: 'stat-item', text: `🛡️ DEF: ${char.def}` });
        stats.createEl('div', { cls: 'stat-item', text: `❤️ HP: ${char.hp}/${char.maxHp}` });
        stats.createEl('div', { cls: 'stat-item', text: `💰 Gold: ${char.gold}` });

        // XP Progress
        const xpSection = container.createEl('div', { cls: 'gamification-xp' });
        const xpNeeded = char.level * 100;
        const xpPercent = (char.xp / xpNeeded) * 100;
        xpSection.createEl('p', { text: `📈 Progresso: ${char.xp}/${xpNeeded} XP` });
        const progressBar = xpSection.createEl('div', { cls: 'progress-bar' });
        progressBar.createEl('div', { cls: 'progress-fill', attr: { style: `width: ${xpPercent}%` } });

        // Inventory
        const invSection = container.createEl('div', { cls: 'gamification-section' });
        invSection.createEl('h3', { text: '🎒 Inventário' });
        if (char.inventory.length === 0) {
            invSection.createEl('p', { text: 'Vazio' });
        } else {
            const invList = invSection.createEl('ul');
            char.inventory.forEach(item => {
                const bonusText = Object.entries(item.bonus)
                    .map(([key, val]) => `+${val} ${key.toUpperCase()}`)
                    .join(', ');
                invList.createEl('li', { text: `${item.name} (${bonusText})` });
            });
        }

        // Missions
        const missionsSection = container.createEl('div', { cls: 'gamification-section' });
        missionsSection.createEl('h3', { text: '🎯 Missões' });
        
        const today = new Date().toDateString();
        const thisWeek = this.getWeekNumber(new Date());
        const thisMonth = new Date().getMonth();

        missionsSection.createEl('p', { text: `🌅 Diária: ${char.dailyProgress}/3 tarefas (+10 XP bônus)` });
        missionsSection.createEl('p', { text: `📅 Semanal: ${char.weeklyProgress}/5 tarefas (+50 XP)` });
        missionsSection.createEl('p', { text: `🗓️ Mensal: ${char.monthlyProgress}/3 grandes tarefas (+100 XP + item raro)` });

        // Action Buttons
        const actions = container.createEl('div', { cls: 'gamification-actions' });
        
        const addTaskBtn = actions.createEl('button', { text: '➕ Adicionar Tarefa' });
        addTaskBtn.onclick = () => this.plugin.showTaskDialog();

        const shopBtn = actions.createEl('button', { text: '🏪 Loja' });
        shopBtn.onclick = () => this.plugin.showShop();

        const resetBtn = actions.createEl('button', { text: '🔄 Reset' });
        resetBtn.onclick = () => this.plugin.resetCharacter();

        // Recent Tasks
        const recentSection = container.createEl('div', { cls: 'gamification-section' });
        recentSection.createEl('h3', { text: '📋 Tarefas Recentes' });
        const recentTasks = char.tasksCompleted.slice(-5).reverse();
        if (recentTasks.length === 0) {
            recentSection.createEl('p', { text: 'Nenhuma tarefa completada ainda' });
        } else {
            const taskList = recentSection.createEl('ul');
            recentTasks.forEach(task => {
                taskList.createEl('li', { 
                    text: `${this.getTaskEmoji(task.size)} ${task.description} (+${task.xp} XP, +${task.gold} Gold) - ${task.date}` 
                });
            });
        }
    }

    getCharacterEmoji(): string {
        const { gender, class: charClass } = this.plugin.settings.character;
        const emojis = {
            male: { warrior: '🧔⚔️', archer: '🧔🏹', mage: '🧙‍♂️' },
            female: { warrior: '👩⚔️', archer: '👩🏹', mage: '🧙‍♀️' }
        };
        return emojis[gender][charClass];
    }

    getTaskEmoji(size: string): string {
        return size === 'small' ? '✅' : size === 'medium' ? '⚔️' : '🏆';
    }

    getWeekNumber(date: Date): number {
        const onejan = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    }
}

export default class GamificationPlugin extends Plugin {
    settings: GamificationSettings;

    async onload() {
        await this.loadSettings();

        // Register view
        this.registerView(
            VIEW_TYPE_GAMIFICATION,
            (leaf) => new GamificationView(leaf, this)
        );

        // Add ribbon icon
        this.addRibbonIcon('gamepad-2', 'RPG Dashboard', () => {
            this.activateView();
        });

        // Add commands
        this.addCommand({
            id: 'open-rpg-dashboard',
            name: 'Abrir Dashboard RPG',
            callback: () => this.activateView()
        });

        this.addCommand({
            id: 'add-small-task',
            name: 'Adicionar Tarefa Pequena',
            callback: () => this.showTaskDialog('small')
        });

        this.addCommand({
            id: 'add-medium-task',
            name: 'Adicionar Tarefa Média',
            callback: () => this.showTaskDialog('medium')
        });

        this.addCommand({
            id: 'add-large-task',
            name: 'Adicionar Tarefa Grande',
            callback: () => this.showTaskDialog('large')
        });

        // Add settings tab
        this.addSettingTab(new GamificationSettingTab(this.app, this));

        // Add CSS
        this.addStyles();
    }

    async activateView() {
        const { workspace } = this.app;
        
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_GAMIFICATION)[0];
        
        if (!leaf) {
            const rightLeaf = workspace.getRightLeaf(false);
            await rightLeaf?.setViewState({
                type: VIEW_TYPE_GAMIFICATION,
                active: true
            });
            leaf = workspace.getLeavesOfType(VIEW_TYPE_GAMIFICATION)[0];
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    showTaskDialog(preselectedSize?: 'small' | 'medium' | 'large') {
        const modal = document.createElement('div');
        modal.className = 'modal-container';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;';
        
        const content = document.createElement('div');
        content.style.cssText = 'background:var(--background-primary);padding:20px;border-radius:8px;max-width:400px;width:90%;';
        
        content.innerHTML = `
            <h2>➕ Nova Tarefa</h2>
            <input type="text" id="task-desc" placeholder="Descrição da tarefa" style="width:100%;margin:10px 0;padding:8px;">
            <select id="task-size" style="width:100%;margin:10px 0;padding:8px;">
                <option value="small" ${preselectedSize === 'small' ? 'selected' : ''}>✅ Pequena (5 XP, 2 Gold)</option>
                <option value="medium" ${preselectedSize === 'medium' ? 'selected' : ''}>⚔️ Média (15 XP, 5 Gold)</option>
                <option value="large" ${preselectedSize === 'large' ? 'selected' : ''}>🏆 Grande (30 XP, 10 Gold)</option>
            </select>
            <div style="display:flex;gap:10px;margin-top:15px;">
                <button id="task-submit" style="flex:1;padding:8px;">Completar</button>
                <button id="task-cancel" style="flex:1;padding:8px;">Cancelar</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        const descInput = content.querySelector('#task-desc') as HTMLInputElement;
        const sizeSelect = content.querySelector('#task-size') as HTMLSelectElement;
        
        content.querySelector('#task-submit')?.addEventListener('click', () => {
            const desc = descInput.value.trim();
            if (desc) {
                this.addTask(desc, sizeSelect.value as 'small' | 'medium' | 'large');
                document.body.removeChild(modal);
            } else {
                new Notice('Digite uma descrição para a tarefa!');
            }
        });
        
        content.querySelector('#task-cancel')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        descInput.focus();
    }

    addTask(description: string, size: 'small' | 'medium' | 'large') {
        const rewards = {
            small: { xp: 5, gold: 2 },
            medium: { xp: 15, gold: 5 },
            large: { xp: 30, gold: 10 }
        };

        const reward = rewards[size];
        const task: Task = {
            description,
            size,
            xp: reward.xp,
            gold: reward.gold,
            date: new Date().toLocaleDateString('pt-BR')
        };

        this.settings.character.tasksCompleted.push(task);
        this.settings.character.xp += reward.xp;
        this.settings.character.gold += reward.gold;

        // Update missions
        const today = new Date().toDateString();
        if (this.settings.character.lastDaily !== today) {
            this.settings.character.dailyProgress = 0;
            this.settings.character.lastDaily = today;
        }
        this.settings.character.dailyProgress++;

        const thisWeek = this.getWeekNumber(new Date()).toString();
        if (this.settings.character.lastWeekly !== thisWeek) {
            this.settings.character.weeklyProgress = 0;
            this.settings.character.lastWeekly = thisWeek;
        }
        if (size === 'medium' || size === 'large') {
            this.settings.character.weeklyProgress++;
        }

        const thisMonth = new Date().getMonth().toString();
        if (this.settings.character.lastMonthly !== thisMonth) {
            this.settings.character.monthlyProgress = 0;
            this.settings.character.lastMonthly = thisMonth;
        }
        if (size === 'large') {
            this.settings.character.monthlyProgress++;
        }

        // Check mission completion
        if (this.settings.character.dailyProgress === 3) {
            this.settings.character.xp += 10;
            new Notice('🎉 Missão Diária Completa! +10 XP bônus!');
        }
        if (this.settings.character.weeklyProgress === 5) {
            this.settings.character.xp += 50;
            new Notice('🎊 Missão Semanal Completa! +50 XP!');
        }
        if (this.settings.character.monthlyProgress === 3) {
            this.settings.character.xp += 100;
            new Notice('🏆 Missão Mensal Completa! +100 XP + Item Raro!');
        }

        // Check level up
        this.checkLevelUp();

        this.saveSettings();
        this.refreshView();
        
        new Notice(`✅ Tarefa completada! +${reward.xp} XP, +${reward.gold} Gold`);
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
            new Notice(`🎊 Level Up! Agora você é nível ${this.settings.character.level}!`);
        }
    }

    showShop() {
        const modal = document.createElement('div');
        modal.className = 'modal-container';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;overflow:auto;';
        
        const content = document.createElement('div');
        content.style.cssText = 'background:var(--background-primary);padding:20px;border-radius:8px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;';
        
        let html = `<h2>🏪 Loja de Itens</h2>`;
        html += `<p style="margin:10px 0;">💰 Seu Gold: ${this.settings.character.gold}</p>`;
        html += `<div style="display:grid;gap:10px;">`;
        
        this.settings.shopItems.forEach((item, index) => {
            const bonusText = Object.entries(item.bonus)
                .map(([key, val]) => `+${val} ${key.toUpperCase()}`)
                .join(', ');
            const canAfford = this.settings.character.gold >= item.cost;
            html += `
                <div style="border:1px solid var(--background-modifier-border);padding:10px;border-radius:4px;">
                    <strong>${item.name}</strong> - ${item.cost} Gold<br>
                    <small>${bonusText}</small><br>
                    <button class="shop-buy" data-index="${index}" ${!canAfford ? 'disabled' : ''} 
                        style="margin-top:5px;padding:5px 10px;${!canAfford ? 'opacity:0.5;' : ''}">
                        ${canAfford ? '💰 Comprar' : '❌ Sem Gold'}
                    </button>
                </div>
            `;
        });
        
        html += `</div>`;
        html += `<button id="shop-close" style="margin-top:15px;width:100%;padding:8px;">Fechar</button>`;
        
        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        content.querySelectorAll('.shop-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLElement).dataset.index || '0');
                this.buyItem(index);
                document.body.removeChild(modal);
            });
        });
        
        content.querySelector('#shop-close')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    buyItem(index: number) {
        const item = this.settings.shopItems[index];
        
        if (this.settings.character.gold < item.cost) {
            new Notice('❌ Gold insuficiente!');
            return;
        }

        this.settings.character.gold -= item.cost;
        this.settings.character.inventory.push(item);

        // Apply bonuses
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
        new Notice('🔄 Personagem resetado!');
    }

    refreshView() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GAMIFICATION);
        leaves.forEach(leaf => {
            if (leaf.view instanceof GamificationView) {
                leaf.view.draw();
            }
        });
    }

    getWeekNumber(date: Date): number {
        const onejan = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .gamification-view { padding: 20px; }
            .gamification-header { margin-bottom: 20px; }
            .gamification-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 10px;
                margin: 15px 0;
            }
            .stat-item {
                background: var(--background-secondary);
                padding: 10px;
                border-radius: 5px;
                text-align: center;
                font-weight: bold;
            }
            .gamification-xp { margin: 20px 0; }
            .progress-bar {
                width: 100%;
                height: 20px;
                background: var(--background-secondary);
                border-radius: 10px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                transition: width 0.3s;
            }
            .gamification-section {
                margin: 20px 0;
                padding: 15px;
                background: var(--background-secondary);
                border-radius: 5px;
            }
            .gamification-actions {
                display: flex;
                gap: 10px;
                margin: 20px 0;
            }
            .gamification-actions button {
                flex: 1;
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {}
}

class GamificationSettingTab extends PluginSettingTab {
    plugin: GamificationPlugin;

    constructor(app: App, plugin: GamificationPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: '⚙️ Configurações do RPG' });

        new Setting(containerEl)
            .setName('Nome do Personagem')
            .setDesc('Como você quer ser chamado?')
            .addText(text => text
                .setPlaceholder('Herói')
                .setValue(this.plugin.settings.character.name)
                .onChange(async (value) => {
                    this.plugin.settings.character.name = value || 'Herói';
                    await this.plugin.saveSettings();
                    this.plugin.refreshView();
                }));

        new Setting(containerEl)
            .setName('Gênero')
            .addDropdown(dropdown => dropdown
                .addOption('male', '🧔 Masculino')
                .addOption('female', '👩 Feminino')
                .setValue(this.plugin.settings.character.gender)
                .onChange(async (value) => {
                    this.plugin.settings.character.gender = value as 'male' | 'female';
                    await this.plugin.saveSettings();
                    this.plugin.refreshView();
                }));

        new Setting(containerEl)
            .setName('Classe')
            .addDropdown(dropdown => dropdown
                .addOption('warrior', '⚔️ Guerreiro(a)')
                .addOption('archer', '🏹 Arqueiro(a)')
                .addOption('mage', '🔮 Mago(a)')
                .setValue(this.plugin.settings.character.class)
                .onChange(async (value) => {
                    this.plugin.settings.character.class = value as 'warrior' | 'archer' | 'mage';
                    await this.plugin.saveSettings();
                    this.plugin.refreshView();
                }));
    }
}