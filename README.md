# Gerenciador de servidores minecraft:Remote Console (RCON) + FastAPI

## Componentes


O sistema tem duas partes principais, e utiliza uma imagem pronta do docker para facilitar a build do minecraft estruturada dessa forma:
 
### Imagem do mine

``` docker
  mc:
    image: itzg/minecraft-server
    tty: true
    stdin_open: true
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      TYPE: "VANILLA"
      VERSION: "LATEST"
      RCON: "true"
      RCON_PASSWORD: "minecraft"
      MEMORY: "2G"
      ONLINE_MODE: "FALSE"
    volumes:
      - ./data:/data
    container_name: mc

```

Aqui são definidas algumas configurações que se fariam no arquivo de configuração do servidor, como: quantidade máxima de memória, porta, se o remote console está ligado ou não e se o servidor suporta players de launchers não originais (`online mode`).

### Dockerfile e Docker-compose da api

`docker-compose` 
``` docker
  endpoint:
    build:
      context: components
      dockerfile: dockerfile.api
    ports:
      - "8080:8080"
    volumes:
      - ./:/app
      - /var/run/docker.sock:/var/run/docker.sock
    command: ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
    depends_on:
      - mc
    restart: unless-stopped
    container_name: fastapi-mc

```

Aqui são definidos os comandos de incialização, nome do container, dependência e principalmente a montagem do volume: `/var/run/docker.sock:/var/run/docker.sock` que nos dará permissão para enviar e receber comandos do servidor com os nossos endpoints através do gerenciamento dos containers.

Agora, para nosso dockerfile do api:

`dockerfile`
``` docker
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    docker.io \
    docker-compose \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
```

Nesse dockerfile definimos comandos para primeiro definimos a versão de python utilizada, definimos o nome do workdir para colocar nossos arquivos, copiamos os arquivos de requirements para dentro do container, depois instalamos os pacotes e copiamos toda a estrutura de arquivos para dentro do contâiner tbm, expondo a porta e executando o comando para inicialização.

### Dockerfile e Docker-compose do Front-end

`docker-compose` 
``` docker
  frontend:
    build:
      context: ./frontend
      dockerfile: ./dockerfile.front
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
    command: ["npm", "run", "dev", "--", "--host"]
    depends_on:
      - endpoint
    container_name: front-mc
```

Aqui defino no docker compose o contexto da pasta do frontend com o dockerfile do front e as portas necessárias abertas por default no vite, além dos volumes, comando de inicialização e dependências.

Agora, para nosso dockerfile do front-end:

`dockerfile`
``` docker
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

No dockerfile, definimos a versão do node que será utilizada, o diretório de trabalho dentro do contâiner, copiamos os arquivos de pacote, rodamos a intalação desses pacotes, copiamos todos os arquivos do frontend para o contâiner e expô-mos a porta necessária e padrão utilizada pelo vite, depois disso definimos o comando de inicialização.

### ENDPOINTS

Certo agora que definimos o funcionamento do dos contâiners vamos falar da estrutura feita para os endpoints:

```
components/
├── __init__.py
├── config.py
├── dockerfile.api
├── models.py
├── requirements.txt
├── router.py
└── commands/
    ├── __init__.py
    ├── game_control.py
    └── server_control.py
```

A pasta components contém os endpoints:

| Endpoint | Método | Descrição | Parâmetros |
|----------|--------|-----------|------------|
| `/status` | GET | Verifica o status do servidor (running/stopped) | - |
| `/restart` | POST | Reinicia o servidor Minecraft | - |
| `/ender-dragon` | POST | Invoca o Ender Dragon no servidor | - |
| `/killall` | POST | Mata todas as entidades (exceto jogadores) | - |
| `/op` | POST | Torna um jogador operador/admin | `player` (body) |
| `/deop` | POST | Remove privilégios de operador de um jogador | `player` (body) |
| `/kit` | POST | Dá um kit de itens a um jogador | `player`, `k_type` (body) |
| `/players` | GET | Lista todos os jogadores online no servidor | - |
| `/say` | POST | Envia uma mensagem no chat do servidor | `command` (body) |
| `/trollar` | POST | Teleporta um jogador 100 blocos para cima | `player` (body) |
| `/command` | POST | Executa um comando RCON customizado | `command` (body) |

**Kits:** `lixo`, `noob`, `intermediario`, `god`


Os endpoints utilizam a função de rcon definida por servidores de minecraft java para fazer a comunicação de consoles remotos, assim, envio o comando bash diretamente a partir disso para a execução do comando diretamente no servidor através do docker exec, possibilitado neste contâiner a partir da configuração do volume: `/var/run/docker.sock:/var/run/docker.sock
`.

**Arquivos:**
- **Controle do Servidor:** `server_control.py` (endpoints `/status`, `/restart`)
- **Controle do Jogo:** `game_control.py` (demais endpoints exceto `/command`)
- **Endpoint Genérico:** `main.py` (endpoint `/command`)