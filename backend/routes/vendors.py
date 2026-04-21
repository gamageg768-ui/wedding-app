from flask import Blueprint, request, jsonify
from models import get_db

vendors_bp = Blueprint('vendors', __name__)

@vendors_bp.route('/', methods=['GET'])
def get_vendors():
    db = get_db()
    vendors = db.execute('SELECT * FROM vendors ORDER BY category, name').fetchall()
    db.close()
    return jsonify([dict(v) for v in vendors])

@vendors_bp.route('/', methods=['POST'])
def add_vendor():
    data = request.json
    db = get_db()
    db.execute('''INSERT INTO vendors (name, category, contact_name, email, phone, website,
                  price, deposit_paid, status, contract_signed, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
               (data.get('name'), data.get('category'), data.get('contact_name'),
                data.get('email'), data.get('phone'), data.get('website'),
                data.get('price', 0), data.get('deposit_paid', 0),
                data.get('status', 'considering'), data.get('contract_signed', 0),
                data.get('notes')))
    db.commit()
    db.close()
    return jsonify({"message": "Vendor added"}), 201

@vendors_bp.route('/<int:vendor_id>', methods=['PUT'])
def update_vendor(vendor_id):
    data = request.json
    db = get_db()
    db.execute('''UPDATE vendors SET name=?, category=?, contact_name=?, email=?, phone=?, website=?,
                  price=?, deposit_paid=?, status=?, contract_signed=?, notes=? WHERE id=?''',
               (data.get('name'), data.get('category'), data.get('contact_name'),
                data.get('email'), data.get('phone'), data.get('website'),
                data.get('price'), data.get('deposit_paid'), data.get('status'),
                data.get('contract_signed'), data.get('notes'), vendor_id))
    db.commit()
    db.close()
    return jsonify({"message": "Vendor updated"})

@vendors_bp.route('/<int:vendor_id>', methods=['DELETE'])
def delete_vendor(vendor_id):
    db = get_db()
    db.execute('DELETE FROM vendors WHERE id=?', (vendor_id,))
    db.commit()
    db.close()
    return jsonify({"message": "Vendor deleted"})
