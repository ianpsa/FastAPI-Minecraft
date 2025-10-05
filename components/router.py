from fastapi import APIRouter

from .commands.server_control import server_control_routes
from .commands.game_control import game_commands_routes


def setup_routes(app):

    server_control_routes(app)
    
    game_commands_routes(app)
