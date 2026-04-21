from flask import Blueprint, request, jsonify
from models import get_db

budget_bp = Blueprint('budget', __name__)

@budget_bp.route('/', methods=['GET'])
def get_budget():
    db = get_db()
    items = db.execute('SELECT * FROM budget ORDER BY category, item').fetchall()
    db.close()
    return jsonify([dict(b) for b in items])

@budget_bp.route('/', methods=['POST'])
def add_item():
    data = request.json
    db = get_db()
    db.execute('INSERT INTO budget (category, item, estimated, actual, paid, vendor, notes) VALUES (?,?,?,?,?,?,?)',
               (data.get('category'), data.get('item'), data.get('estimated', 0),
                data.get('actual', 0), data.get('paid', 0), data.get('vendor'), data.get('notes')))
    db.commit()
    db.close()
    return jsonify({"message": "Budget item added"}), 201

@budget_bp.route('/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.json
    db = get_db()
    db.execute('''UPDATE budget SET category=?, item=?, estimated=?, actual=?, paid=?, vendor=?, notes=?
                  WHERE id=?''',
               (data.get('category'), data.get('item'), data.get('estimated'),
                data.get('actual'), data.get('paid'), data.get('vendor'), data.get('notes'), item_id))
    db.commit()
    db.close()
    return jsonify({"message": "Budget item updated"})

@budget_bp.route('/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    db = get_db()
    db.execute('DELETE FROM budget WHERE id=?', (item_id,))
    db.commit()
    db.close()
    return jsonify({"message": "Item deleted"})

@budget_bp.route('/summary', methods=['GET'])
def budget_summary():
    db = get_db()
    total_est = db.execute('SELECT SUM(estimated) as s FROM budget').fetchone()['s'] or 0
    total_actual = db.execute('SELECT SUM(actual) as s FROM budget').fetchone()['s'] or 0
    total_paid = db.execute('SELECT SUM(actual) as s FROM budget WHERE paid=1').fetchone()['s'] or 0
    categories = db.execute('''SELECT category, SUM(estimated) as est, SUM(actual) as act
                                FROM budget GROUP BY category''').fetchall()
    db.close()
    return jsonify({
        "total_estimated": total_est,
        "total_actual": total_actual,
        "total_paid": total_paid,
        "remaining": total_actual - total_paid,
        "categories": [dict(c) for c in categories]
    })
