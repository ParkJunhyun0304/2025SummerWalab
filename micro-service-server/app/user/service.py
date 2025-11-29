from sqlalchemy.ext.asyncio import AsyncSession

from app.user.schemas import UserData, SubUserData


async def check_user_data(user_date: UserData, db: AsyncSession):
    pass


async def save_user_data(user_date: UserData, db: AsyncSession) -> SubUserData:
    pass


async def get_user_data(user_date: UserData, db: AsyncSession) -> SubUserData:
    pass


async def update_user_data(user_date: UserData, db: AsyncSession) -> SubUserData:
    pass
