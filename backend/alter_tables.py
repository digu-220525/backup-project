import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine

async def amend_tables():
    print("Altering projects and messages to add file columns...")
    try:
        async with engine.begin() as conn:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS submitted_files JSONB DEFAULT '[]'::jsonb;"))
            await conn.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;"))
            print("Successfully added JSONB columns!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(amend_tables())
