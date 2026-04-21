from flask import Blueprint, request, jsonify
from models import get_db

guests_bp = Blueprint('guests', __name__)

@guests_bp.route('/', methods=['GET'])
def get_guests():
    db = get_db()
    guests = db.execute('SELECT * FROM guests ORDER BY name').fetchall()
    db.close()
    return jsonify([dict(g) for g in guests])

@guests_bp.route('/', methods=['POST'])
def add_guest():
    data = request.json
    db = get_db()
    db.execute('''INSERT INTO guests (name, email, phone, group_name, rsvp_status, dietary, plus_one, plus_one_name, notes)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
               (data.get('name'), data.get('email'), data.get('phone'),
                data.get('group_name', 'General'), data.get('rsvp_status', 'pending'),
                data.get('dietary', 'none'), data.get('plus_one', 0),
                data.get('plus_one_name'), data.get('notes')))
    db.commit()
    db.close()
    return jsonify({"message": "Guest added"}), 201

@guests_bp.route('/<int:guest_id>', methods=['PUT'])
def update_guest(guest_id):
    data = request.json
    db = get_db()
    db.execute('''UPDATE guests SET name=?, email=?, phone=?, group_name=?, rsvp_status=?,
                  dietary=?, plus_one=?, plus_one_name=?, table_number=?, seat_number=?, notes=?
                  WHERE id=?''',
               (data.get('name'), data.get('email'), data.get('phone'),
                data.get('group_name'), data.get('rsvp_status'), data.get('dietary'),
                data.get('plus_one'), data.get('plus_one_name'),
                data.get('table_number'), data.get('seat_number'),
                data.get('notes'), guest_id))
    db.commit()
    db.close()
    return jsonify({"message": "Guest updated"})

@guests_bp.route('/<int:guest_id>', methods=['DELETE'])
def delete_guest(guest_id):
    db = get_db()
    db.execute('DELETE FROM guests WHERE id=?', (guest_id,))
    db.commit()
    db.close()
    return jsonify({"message": "Guest deleted"})

@guests_bp.route('/stats', methods=['GET'])
def guest_stats():
    db = get_db()
    total = db.execute('SELECT COUNT(*) as c FROM guests').fetchone()['c']
    confirmed = db.execute("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='confirmed'").fetchone()['c']
    declined = db.execute("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='declined'").fetchone()['c']
    pending = db.execute("SELECT COUNT(*) as c FROM guests WHERE rsvp_status='pending'").fetchone()['c']
    plus_ones = db.execute("SELECT SUM(plus_one) as s FROM guests WHERE rsvp_status='confirmed'").fetchone()['s'] or 0
    db.close()
    return jsonify({
        "total": total, "confirmed": confirmed,
        "declined": declined, "pending": pending,
        "total_attending": confirmed + int(plus_ones)
    })

@guests_bp.route('/rsvp/<string:token>', methods=['POST'])
def rsvp_guest(token):
    data = request.json
    db = get_db()
    db.execute("UPDATE guests SET rsvp_status=?, dietary=?, plus_one_name=? WHERE id=?",
               (data.get('rsvp_status'), data.get('dietary'), data.get('plus_one_name'), data.get('id')))
    db.commit()
    db.close()
    return jsonify({"message": "RSVP submitted successfully"})
