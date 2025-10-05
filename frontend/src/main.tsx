// FRONT FEITO COM IA

import React, { useState, useEffect, useRef } from 'react';
import { Server, Users, Zap, Terminal, Send, Trash2, Menu, X, Activity, Power, RefreshCw, Shield, ShieldOff, MessageSquare, Skull } from 'lucide-react';
import { MinecraftAPI } from './config';

// Types
interface ConsoleLog {
  type: 'command' | 'success' | 'error' | 'warning' | 'system' | 'info';
  text: string;
  timestamp: Date;
}

interface ServerStatus {
  online: boolean;
  checking: boolean;
}

export default function MinecraftPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consoleLines, setConsoleLines] = useState<ConsoleLog[]>([
    { type: 'system', text: '[SYSTEM] Minecraft Console initialized', timestamp: new Date() }
  ]);
  const [customCommand, setCustomCommand] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [sayMessage, setSayMessage] = useState('');
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ online: false, checking: true });
  const [players, setPlayers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef(new MinecraftAPI());

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLines]);

  useEffect(() => {
    // Initial connection
    checkStatus();
    updatePlayersList();
    
    // Polling interval for players
    const interval = setInterval(updatePlayersList, 10000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (text: string, type: ConsoleLog['type'] = 'info') => {
    setConsoleLines(prev => [...prev, { type, text, timestamp: new Date() }]);
  };

  const updatePlayersList = async () => {
    try {
      const response = await apiRef.current.getPlayers();
      setPlayers(response.players || []);
    } catch (error) {
      addLog('[ERROR] Failed to fetch players', 'error');
    }
  };

  const checkStatus = async () => {
    setServerStatus({ online: false, checking: true });
    addLog('[SYSTEM] Checking server status...', 'info');
    
    try {
      const response = await apiRef.current.getStatus();
      const isOnline = response.status === 'running';
      setServerStatus({ online: isOnline, checking: false });
      setConnected(isOnline);
      addLog(`[SYSTEM] Server is ${isOnline ? 'ONLINE' : 'OFFLINE'}`, isOnline ? 'success' : 'error');
      
      if (isOnline) {
        await updatePlayersList();
      }
    } catch (error) {
      setServerStatus({ online: false, checking: false });
      setConnected(false);
      addLog('[ERROR] Failed to connect to server', 'error');
    }
  };

  const restartServer = async () => {
    addLog('[SYSTEM] Restarting server...', 'warning');
    try {
      await apiRef.current.restartServer();
      addLog('[SUCCESS] Server restarted successfully', 'success');
      setTimeout(checkStatus, 2000);
    } catch (error: any) {
      addLog(`[ERROR] Failed to restart: ${error.message}`, 'error');
    }
  };

  const opPlayer = async () => {
    if (!playerName.trim()) {
      addLog('[ERROR] Please enter a player name', 'error');
      return;
    }
    
    try {
      await apiRef.current.setOperator(playerName);
      addLog(`[SUCCESS] ${playerName} is now an operator`, 'success');
      setPlayerName('');
    } catch (error: any) {
      addLog(`[ERROR] Failed to OP player: ${error.message}`, 'error');
    }
  };

  const deopPlayer = async () => {
    if (!playerName.trim()) {
      addLog('[ERROR] Please enter a player name', 'error');
      return;
    }
    
    try {
      await apiRef.current.removeOperator(playerName);
      addLog(`[SUCCESS] ${playerName} is no longer an operator`, 'success');
      setPlayerName('');
    } catch (error: any) {
      addLog(`[ERROR] Failed to DeOP player: ${error.message}`, 'error');
    }
  };

  const summonDragon = async () => {
    try {
      await apiRef.current.summonEnderDragon();
      addLog('[SUCCESS] Ender Dragon summoned!', 'success');
    } catch (error: any) {
      addLog(`[ERROR] Failed to summon dragon: ${error.message}`, 'error');
    }
  };

  const killAll = async () => {
    try {
      await apiRef.current.killAllEntities();
      addLog('[SUCCESS] All entities killed', 'success');
    } catch (error: any) {
      addLog(`[ERROR] Failed to kill entities: ${error.message}`, 'error');
    }
  };
  
  const sendMessage = async () => {
    if (!sayMessage.trim()) {
      addLog('[ERROR] Please enter a message', 'error');
      return;
    }
    
    try {
      await apiRef.current.sayMessage(sayMessage);
      addLog(`[SUCCESS] Message sent: "${sayMessage}"`, 'success');
      setSayMessage('');
    } catch (error: any) {
      addLog(`[ERROR] Failed to send message: ${error.message}`, 'error');
    }
  };

  const handleCustomCommand = async () => {
    if (!customCommand.trim()) {
      addLog('[ERROR] Please enter a command', 'error');
      return;
    }
    
    addLog(`> ${customCommand}`, 'command');
    
    try {
      const response = await apiRef.current.executeCommand(customCommand);
      if (response.output) {
        addLog(`[SERVER] ${response.output}`, 'success');
      } else {
        addLog('[SUCCESS] Command executed successfully', 'success');
      }
      setCustomCommand('');
    } catch (error: any) {
      addLog(`[ERROR] ${error.message}`, 'error');
    }
  };

  const selectPlayer = (player: string) => {
    setPlayerName(player);
    addLog(`[INFO] Player selected: ${player}`, 'info');
  };

  const clearConsole = () => {
    setConsoleLines([{ type: 'info', text: 'Console cleared', timestamp: new Date() }]);
  };

  const getLogColor = (type: ConsoleLog['type']) => {
    switch(type) {
      case 'command': return 'text-cyan-400';
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'system': return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-900 border-r border-slate-800 transition-all duration-300 overflow-hidden flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Painel do server</h1>
                <p className="text-xs text-slate-400">Gerenciador de Minecraft</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Server Status */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Status do Servidor</h3>
            </div>
            
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${serverStatus.checking ? 'bg-yellow-500 animate-pulse' : serverStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {serverStatus.checking ? 'Checking...' : serverStatus.online ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={checkStatus}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Verificar Status
                </button>
                <button 
                  onClick={restartServer}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Power className="w-4 h-4" />
                  Reiniciar Servidor
                </button>
              </div>
            </div>
          </section>

          {/* Players */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Players Online</h3>
            </div>
            
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 mb-3">
              <div className="space-y-2 min-h-[60px]">
                {players.length > 0 ? (
                  players.map((player, i) => (
                    <div 
                      key={i} 
                      onClick={() => selectPlayer(player)}
                      className="flex items-center gap-2 text-sm bg-slate-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{player}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm">Nenhum player online</span>
                )}
              </div>
            </div>
            
            <input 
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && opPlayer()}
              placeholder="Player name"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition-colors mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={opPlayer}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                OP
              </button>
              <button 
                onClick={deopPlayer}
                className="p-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ShieldOff className="w-4 h-4" />
                DeOP
              </button>
              <button 
                onClick={() => playerName.trim() && apiRef.current.trollPlayer(playerName).then(() => addLog(`[SUCCESS] ${playerName} trollado`, 'success')).catch((e:any)=>addLog(`[ERROR] ${e.message}`,'error'))}
                className="col-span-2 p-2.5 bg-pink-600 hover:bg-pink-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Trollar
              </button>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Ações Rápidas</h3>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={summonDragon}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Summon Ender Dragon
              </button>
              <button 
                onClick={killAll}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Skull className="w-4 h-4" />
                Kill All Entities
              </button>
              
              {/* Kits */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {['lixo','noob','inter','god'].map(kit => (
                    <button
                      key={kit}
                      onClick={() => playerName.trim() && apiRef.current.giveKit(playerName, kit).then(()=>addLog(`[SUCCESS] Kit ${kit} dado para ${playerName}`,'success')).catch((e:any)=>addLog(`[ERROR] ${e.message}`,'error'))}
                      className="py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs capitalize"
                    >
                      {kit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <input 
                  type="text"
                  value={sayMessage}
                  onChange={(e) => setSayMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Broadcast message"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition-colors"
                />
                <button 
                  onClick={sendMessage}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          </section>
        </div>
      </aside>

      {/* Main Console */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="p-5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <Terminal className="w-7 h-7 text-slate-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Console do server</h1>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 bg-slate-800 border rounded-full ${connected ? 'border-green-600' : 'border-slate-700'}`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-slate-300">{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </header>

        {/* Console Body */}
        <div className="flex-1 flex flex-col p-5 gap-4 overflow-hidden">
          {/* Command Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input 
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomCommand()}
                placeholder="Enter command (e.g., give @a diamond 64)"
                className="w-full p-4 pl-12 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-600 transition-colors"
              />
              <Terminal className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <button 
              onClick={handleCustomCommand}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Execute
            </button>
          </div>

          {/* Console Output */}
          <div className="bg-black border border-slate-800 rounded-lg flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-3 font-semibold text-sm">Console Output</span>
              </div>
              <button 
                onClick={clearConsole}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1">
              {consoleLines.map((line, i) => (
                <div key={i} className={`${getLogColor(line.type)} leading-relaxed`}>
                  <span className="text-slate-600 mr-2">
                    [{line.timestamp.toLocaleTimeString()}]
                  </span>
                  {line.text}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
