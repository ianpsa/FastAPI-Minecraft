from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import subprocess

from ..config import MINECRAFT_CONTAINER
from ..models import PlayerRequest, KitRequest, CommandRequest


def game_commands_routes(app):

    # envia comando para o rcon para invocar o ender dragon
    @app.post("/ender-dragon", response_class=JSONResponse)
    async def summon_ender_dragon():
        try:
            subprocess.run(
                ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
                'echo "summon ender_dragon ~ ~ ~" | rcon-cli'],
                check=True
            )
            return {"status": "Ender Dragon summoned"}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Erro ao invocar o Ender Dragon.")

    # envia comando para o rcon para matar todas as entidades
    @app.post("/killall", response_class=JSONResponse)
    async def kill_all_entities():
        try:
            subprocess.run(
                ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
                'echo "kill @e[type=!player]" | rcon-cli'],
                check=True
            )
            return {"status": "Todas as entidades morreram"}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Erro ao matar todas as entidades.")

    # envia comando para o rcon para tornar um jogador admin
    @app.post("/op", response_class=JSONResponse)
    async def operator(request: PlayerRequest):
        try:
            subprocess.run(
                ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
                f'echo "op {request.player}" | rcon-cli'],
                check=True
            )
            return {"status": f"{request.player} agora é operador"}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Erro ao tornar-se operador.")
        
    # envia comando para o rcon para remover admin de um jogador
    @app.post('/deop', response_class=JSONResponse)
    async def deoperator(request: PlayerRequest):
        try:
            subprocess.run(
                ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
                f'echo "deop {request.player}" | rcon-cli'],
                check=True
            )
            return {"status": "You are no longer an operator"}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Erro ao remover o operador.")

    # envia comando para o rcon para dar um kit a um jogador
    @app.post('/kit', response_class=JSONResponse)
    async def kit(request: KitRequest):
        kits = {
            "lixo": "stone_pickaxe stone_shovel bread 5",
            "noob": "iron_pickaxe iron_sword bread 10",
            "intermediario": "diamond_pickaxe diamond_sword golden_apple 5",
            "god": "netherite_pickaxe netherite_sword enchanted_golden_apple 3"
        }
        
        if request.k_type not in kits:
            raise HTTPException(status_code=400, detail=f"Kit '{request.k_type}' não existe. Kits disponíveis: {list(kits.keys())}")
        
        try:
            items = kits[request.k_type].split()
            for item in items:
                if item.isdigit():
                    continue
                count = 1
                idx = items.index(item)
                if idx + 1 < len(items) and items[idx + 1].isdigit():
                    count = int(items[idx + 1])
                subprocess.run(
                    ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
                    f'echo "give {request.player} {item} {count}" | rcon-cli'],
                    check=True
                )
            return {"status": f"kit {request.k_type} foi dado para o usuário {request.player}"}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail=f"nao consegui dar o kit {request.k_type} para {request.player}")
        
    # envia comando para o rcon para listar jogadores online
    @app.get("/players", response_class=JSONResponse)
    async def listar_players():
        try:
            result = subprocess.run(
                ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
                'echo "list" | rcon-cli'],
                capture_output=True, text=True, check=True
            )
            output = result.stdout.strip()
            if "There are 0 of a max" in output:
                return {"players": []}

            partes = output.split(":")[1].strip()

            if partes:
                players = [player.strip() for player in partes.split(",")]
                players = [player for player in players if player]
            else:
                players = []
            
            return {"players": players}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Erro ao listar jogadores.")

    # envia comando para o rcon para enviar uma mensagem do servidor no chat
    @app.post("/say", response_class=JSONResponse)
    async def say_message(request: CommandRequest):
        try:
            subprocess.run(
                ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
                f'echo "say {request.command}" | rcon-cli'],
                check=True
            )
            return {"status": f"Message sent: {request.command}"}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Erro ao enviar a mensagem.")
        
    # envia comando para o rcon para sacanear um jogador (teleportar para cima)
    @app.post("/trollar", response_class=JSONResponse)
    async def troll_player(request: PlayerRequest):
        try:
            # Teleporta o jogador
            subprocess.run(
                ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
                f'echo "tp {request.player} ~ ~100 ~" | rcon-cli'],
                check=True
            )
            # Envia mensagem no chat
            subprocess.run(
                ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
                f'echo "say {request.player} foi trollado kkkk" | rcon-cli'],
                check=True
            )
            return {"status": f"{request.player} foi trollado"}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Erro ao trollar o jogador.")
        