from datetime import datetime

from pydantic import BaseModel
from typing import Optional, Literal


class ContestDTO(BaseModel):
    contest_id: int
    title: str
    start_time: datetime
    end_time: datetime
