from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import subprocess

from ..config import MINECRAFT_CONTAINER, MINECRAFT_DATA_PATH

def server_control_routes(app):
    @app.get("/status", response_class=JSONResponse)
    async def get_status():
        try:
            result = subprocess.run(
                ["docker", "inspect", "-f", "{{.State.Running}}", MINECRAFT_CONTAINER],
                capture_output=True, text=True, check=True
            )
            is_running = result.stdout.strip() == "true"
            return {"status": "running" if is_running else "stopped"}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Erro ao obter status do servidor.")
        
    @app.post("/restart", response_class=JSONResponse)
    async def restart_server():
        try:
            subprocess.run(["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c", "restart"], check=True)
            return {"status": "restarted"}
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=500, detail="Erro ao reiniciar o servidor.")