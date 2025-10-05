# endpoints de controle

from .server_control import server_control_routes
from .game_control import game_commands_routes

__all__ = ["server_control_routes", "game_commands_routes"]