from app.organization.models import Organization
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy import exists


async def check_user_exists_by_organization_name(organization_name: str, db: AsyncSession) -> bool:
    stmt = select(exists().where(Organization.name == organization_name))
    result = await db.execute(stmt)
    return result.scalar()

async def save(entity: Organization, db: AsyncSession) -> Organization:
    stmt = (
        insert(Organization)
        .values(
            id=entity.id,
            name=entity.name,
            description=entity.description,
            user_id=entity.user_id,
        )
        .on_conflict_do_update(
            index_elements=["id"],
            set_={
                "name": entity.name,
                "description": entity.description,
                "user_id": entity.user_id,
            },
        )
        .returning(Organization)
    )
    result = await db.execute(stmt)
    return result.scalar_one()

async def find_by_id(organization_id: int, db: AsyncSession) -> Organization | None:
    stmt = select(Organization).where(Organization.id == organization_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()



async def delete_by_id(organization_id: int, db: AsyncSession) -> None:
    stmt = delete(Organization).where(Organization.id == organization_id)
    await db.execute(stmt)