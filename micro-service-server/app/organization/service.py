from app.utils.databse import transactional
from sqlalchemy.ext.asyncio import AsyncSession
from app.organization.schemas import OrganizationCreateData, OrganizationUpdateData

import app.organization.repository as organization_repo


@transactional
async def create_organization(data: OrganizationCreateData, db: AsyncSession):
    pass


async def get_organization(organization_id: int, db: AsyncSession):
    pass


@transactional
async def update_organization(organization_id: int, data: OrganizationUpdateData, db: AsyncSession):
    pass


@transactional
async def delete_organization(organization_id: int, db: AsyncSession):
    pass


async def list_organizations(page: int, size: int, db: AsyncSession):
    pass


@transactional
async def add_organization_user(organization_id: int, user_id: int, db: AsyncSession):
    pass


@transactional
async def delete_organization_user(organization_id: int, user_id: int, db: AsyncSession):
    pass
