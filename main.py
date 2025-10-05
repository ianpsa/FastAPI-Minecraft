from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess

from components.router import setup_routes
from components.config import MINECRAFT_CONTAINER
from components.models import CommandRequest

app = FastAPI(title="Bora um minezin?", description="API para sacanear o mine")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar todas as rotas
setup_routes(app)

    
# Endpoint genérico para executar comandos customizados
@app.post("/command", response_class=JSONResponse)
async def run_command(request: CommandRequest):
    try:
        subprocess.run(
            ["docker", "exec", MINECRAFT_CONTAINER, "bash", "-c",
             f'echo "{request.command}" | rcon-cli'],
            check=True
        )
        return {"status": f"Command executed: {request.command}"}
    except subprocess.CalledProcessError:
        raise HTTPException(status_code=500, detail="Erro ao executar o comando.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
