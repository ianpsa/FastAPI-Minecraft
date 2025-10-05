from pydantic import BaseModel


class PlayerRequest(BaseModel):
    player: str


class KitRequest(BaseModel):
    player: str
    k_type: str


class CommandRequest(BaseModel):
    command: str
