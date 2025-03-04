from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from models import db, List, Item, generate_uuid

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

# Create all tables if they don't exist
with app.app_context():
    db.create_all()

@app.route("/")
def index():
    return jsonify({"message": "Hello, World!"})

@app.route("/api/lists", methods=["GET"])
def get_lists():
    """
    Returns all lists with their hierarchical items.
    """
    lists = List.query.all()
    response = {}
    for lst in lists:
        response[lst.id] = {
            "id": lst.id,
            "title": lst.title,
            "items": build_items_hierarchy(lst.items)
        }
    return jsonify(response), 200

def build_items_hierarchy(items):
    """
    Build a nested list of items (only those whose parent_item_id is NULL).
    """
    top_level_items = [i for i in items if i.parent_item_id is None]
    return [build_item_dict(item) for item in top_level_items]

def build_item_dict(item):
    """
    Recursively build sub-items structure.
    """
    return {
        "id": item.id,
        "content": item.content,
        "subItems": [build_item_dict(sub) for sub in item.sub_items]
    }

@app.route("/api/lists", methods=["POST"])
def create_list():
    data = request.json
    title = data.get("title", "Untitled List")
    new_list = List(title=title)
    db.session.add(new_list)
    db.session.commit()
    return jsonify({
        "id": new_list.id,
        "title": new_list.title,
        "items": []
    }), 201

@app.route("/api/lists/<list_id>", methods=["PUT"])
def update_list(list_id):
    data = request.json
    lst = List.query.get(list_id)
    if not lst:
        return jsonify({"error": "List not found"}), 404
    lst.title = data.get("title", lst.title)
    db.session.commit()
    return jsonify({"id": lst.id, "title": lst.title}), 200

@app.route("/api/lists/<list_id>", methods=["DELETE"])
def delete_list(list_id):
    lst = List.query.get(list_id)
    if not lst:
        return jsonify({"error": "List not found"}), 404
    db.session.delete(lst)
    db.session.commit()
    return jsonify({"message": "List deleted"}), 200

@app.route("/api/items", methods=["POST"])
def create_item():
    """
    Creates a new item under a list or under another item.
    JSON:
    {
      "parentType": "list" or "item",
      "parentId": "...",
      "content": "Task content"
    }
    """
    data = request.json
    parent_type = data.get("parentType")
    parent_id = data.get("parentId")
    content = data.get("content", "")

    new_item = Item(content=content)
    if parent_type == "list":
        parent_list = List.query.get(parent_id)
        if not parent_list:
            return jsonify({"error": "List not found"}), 404
        new_item.parent_list_id = parent_list.id
    elif parent_type == "item":
        parent_item = Item.query.get(parent_id)
        if not parent_item:
            return jsonify({"error": "Item not found"}), 404
        new_item.parent_item_id = parent_item.id
    else:
        return jsonify({"error": "Invalid parentType"}), 400

    db.session.add(new_item)
    db.session.commit()
    return jsonify({"id": new_item.id, "content": new_item.content, "subItems": []}), 201

@app.route("/api/items/<item_id>", methods=["PUT"])
def update_item(item_id):
    data = request.json
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    item.content = data.get("content", item.content)
    db.session.commit()
    return jsonify({"id": item.id, "content": item.content}), 200

@app.route("/api/items/<item_id>", methods=["DELETE"])
def delete_item(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200

@app.route("/api/items/move", methods=["POST"])
def move_item():
    """
    Move an item from its current parent to a new parent.
    JSON:
    {
      "itemId": "...",
      "targetParentType": "list" or "item",
      "targetParentId": "...",
      "targetIndex": int (optional)
    }
    """
    data = request.json
    item_id = data.get("itemId")
    target_type = data.get("targetParentType")
    target_id = data.get("targetParentId")
    target_index = data.get("targetIndex")  # Not fully used here

    item = Item.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    if target_type == "list":
        list_obj = List.query.get(target_id)
        if not list_obj:
            return jsonify({"error": "Target list not found"}), 404
        item.parent_list_id = list_obj.id
        item.parent_item_id = None
    elif target_type == "item":
        parent_item = Item.query.get(target_id)
        if not parent_item:
            return jsonify({"error": "Target item not found"}), 404
        item.parent_list_id = None
        item.parent_item_id = parent_item.id
    else:
        return jsonify({"error": "Invalid target parent type"}), 400

    db.session.commit()

    # If you want precise ordering, you'd store an "order" or "position" column.
    return jsonify({"message": "Item moved successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)
