// Configuração da API
export const API_CONFIG = {
  baseURL: 'http://localhost:8080',
  endpoints: {
    // Server Control
    status: '/status',
    restart: '/restart',
    
    // Players
    players: '/players',
    op: '/op',
    deop: '/deop',
    trollar: '/trollar',
    
    // Game Commands
    command: '/command',
    say: '/say',
    enderDragon: '/ender-dragon',
    killall: '/killall',
    kit: '/kit'
  }
}

// Classe utilitária para fazer requisições à API
export class MinecraftAPI {
  private baseURL: string

  constructor() {
    this.baseURL = API_CONFIG.baseURL
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    }

    try {
      const response = await fetch(url, defaultOptions)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Server Control
  async getStatus() {
    return this.request(API_CONFIG.endpoints.status)
  }

  async restartServer() {
    return this.request(API_CONFIG.endpoints.restart, { method: 'POST' })
  }

  // Players
  async getPlayers() {
    return this.request(API_CONFIG.endpoints.players)
  }

  async setOperator(player: string) {
    return this.request(API_CONFIG.endpoints.op, {
      method: 'POST',
      body: JSON.stringify({ player })
    })
  }

  async removeOperator(player: string) {
    return this.request(API_CONFIG.endpoints.deop, {
      method: 'POST',
      body: JSON.stringify({ player })
    })
  }

  async trollPlayer(player: string) {
    return this.request(API_CONFIG.endpoints.trollar, {
      method: 'POST',
      body: JSON.stringify({ player })
    })
  }

  // Game Commands
  async executeCommand(command: string) {
    return this.request(API_CONFIG.endpoints.command, {
      method: 'POST',
      body: JSON.stringify({ command })
    })
  }

  async sayMessage(message: string) {
    return this.request(API_CONFIG.endpoints.say, {
      method: 'POST',
      body: JSON.stringify({ command: message })
    })
  }

  async summonEnderDragon() {
    return this.request(API_CONFIG.endpoints.enderDragon, { method: 'POST' })
  }

  async killAllEntities() {
    return this.request(API_CONFIG.endpoints.killall, { method: 'POST' })
  }

  async giveKit(player: string, kitType: string) {
    return this.request(API_CONFIG.endpoints.kit, {
      method: 'POST',
      body: JSON.stringify({ player, k_type: kitType })
    })
  }
}
