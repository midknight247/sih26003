import os
import sys

# Ensure backend root is in the Python search path execution layout
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models.patient import Activity, ContentItem


def seed_localized_content():
    db: Session = SessionLocal()
    try:
        print("Initializing Smriti Core Data Seeding Pipeline...")

        # ==========================================
        # 1. POPULATE THE CORE MVP ACTIVITIES
        # ==========================================
        activities_data = [
            {
                "id": "act_cat_001",
                "activity_type": "OBJECT_CATEGORIZATION",
                "name": "Familiar Object Grouping",
                "description": "Sort everyday cultural items into correct categorical environments.",
                "is_active": True,
            },
            {
                "id": "act_rem_002",
                "activity_type": "REMINISCENCE",
                "name": "Cultural Memory Echoes",
                "description": "Engage with familiar regional sights and sensory triggers.",
                "is_active": True,
            },
        ]

        for act_info in activities_data:
            existing = (
                db.query(Activity)
                .filter(Activity.activity_type == act_info["activity_type"])
                .first()
            )
            if not existing:
                new_act = Activity(**act_info)
                db.add(new_act)
                print(f"✅ Activity Registered: {act_info['name']}")

        db.commit()

        # ==========================================
        # 2. POPULATE NORTH-EASTERN REGION CONTENT ITEMS
        # ==========================================
        content_items_data = [
            # Object Categorization Tasks (Assam/General NER Utensils vs Textiles)
            {
                "id": "item_cat_001",
                "activity_id": "act_cat_001",
                "title": "Xorai (Traditional Brass Tray)",
                "language": "as",
                "community": "Assamese",
                "content_type": "TEXT_EMOJI",
                "asset_url": "盤",  # Falling back gracefully to accessible indicators
                "audio_url": None,
                "is_active": True,
                "is_hidden": False,
                "emotional_risk_level": "low",
            },
            {
                "id": "item_cat_002",
                "activity_id": "act_cat_001",
                "title": "Gamosa (Woven Textile fabric)",
                "language": "as",
                "community": "Assamese",
                "content_type": "TEXT_EMOJI",
                "asset_url": "🧣",
                "audio_url": None,
                "is_active": True,
                "is_hidden": False,
                "emotional_risk_level": "low",
            },
            {
                "id": "item_cat_003",
                "activity_id": "act_cat_001",
                "title": "Jaapi (Traditional Bamboo Hat)",
                "language": "as",
                "community": "Assamese",
                "content_type": "TEXT_EMOJI",
                "asset_url": "👒",
                "audio_url": None,
                "is_active": True,
                "is_hidden": False,
                "emotional_risk_level": "low",
            },
            # Reminiscence Content Tasks (Regional Landmark Landmarks triggers)
            {
                "id": "item_rem_001",
                "activity_id": "act_rem_002",
                "title": "Majuli River Island Sunset View",
                "language": "en",
                "community": "General NER",
                "content_type": "IMAGE_STUB",
                "asset_url": "🌅",
                "audio_url": None,
                "is_active": True,
                "is_hidden": False,
                "emotional_risk_level": "low",
            },
        ]

        for item_info in content_items_data:
            existing_item = (
                db.query(ContentItem)
                .filter(ContentItem.id == item_info["id"])
                .first()
            )
            if not existing_item:
                new_item = ContentItem(**item_info)
                db.add(new_item)
                print(f"   ➔ Localized Item Loaded: {item_info['title']}")

        db.commit()
        print("\n🏆 Database Seeding Executed Successfully! NER Foundations Loaded.")

    except Exception as e:
        db.rollback()
        print(f"❌ Critical Error During Data Seeding Execution Loop: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_localized_content()
