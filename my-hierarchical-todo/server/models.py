from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
import uuid

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class List(db.Model):
    __tablename__ = 'lists'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    title = db.Column(db.String(200), nullable=False)

    # Relationship to Item
    items = relationship(
        "Item",
        back_populates="parent_list",
        cascade="all, delete-orphan"
    )

class Item(db.Model):
    __tablename__ = 'items'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    content = db.Column(db.String(500), nullable=False)

    parent_list_id = db.Column(db.String(36), ForeignKey('lists.id'), nullable=True)
    parent_item_id = db.Column(db.String(36), ForeignKey('items.id'), nullable=True)

    # If parent_list_id is set, the item belongs to a list
    parent_list = relationship("List", back_populates="items", foreign_keys=[parent_list_id])

    # If parent_item_id is set, the item belongs to another item
    parent_item = relationship("Item", remote_side=[id], back_populates="sub_items")

    # Sub-items
    sub_items = relationship("Item", back_populates="parent_item", cascade="all, delete-orphan")
