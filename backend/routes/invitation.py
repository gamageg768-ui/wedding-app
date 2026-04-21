from flask import Blueprint, request, jsonify
from models import get_db

invitation_bp = Blueprint('invitation', __name__)

@invitation_bp.route('/', methods=['GET'])
def get_invitation():
    db = get_db()
    inv = db.execute('SELECT * FROM invitation ORDER BY id DESC LIMIT 1').fetchone()
    db.close()
    if inv:
        return jsonify(dict(inv))
    return jsonify({}), 200

@invitation_bp.route('/', methods=['POST'])
def save_invitation():
    data = request.json
    db = get_db()
    existing = db.execute('SELECT id FROM invitation LIMIT 1').fetchone()
    if existing:
        db.execute('''UPDATE invitation SET couple_names=?, wedding_date=?, venue=?, venue_address=?,
                      ceremony_time=?, reception_time=?, message=?, theme=?, background_color=?,
                      accent_color=?, font_style=?, rsvp_deadline=? WHERE id=?''',
                   (data.get('couple_names'), data.get('wedding_date'), data.get('venue'),
                    data.get('venue_address'), data.get('ceremony_time'), data.get('reception_time'),
                    data.get('message'), data.get('theme', 'classic'),
                    data.get('background_color', '#fff8f0'), data.get('accent_color', '#c9a96e'),
                    data.get('font_style', 'serif'), data.get('rsvp_deadline'), existing['id']))
    else:
        db.execute('''INSERT INTO invitation (couple_names, wedding_date, venue, venue_address,
                      ceremony_time, reception_time, message, theme, background_color, accent_color,
                      font_style, rsvp_deadline) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
                   (data.get('couple_names'), data.get('wedding_date'), data.get('venue'),
                    data.get('venue_address'), data.get('ceremony_time'), data.get('reception_time'),
                    data.get('message'), data.get('theme', 'classic'),
                    data.get('background_color', '#fff8f0'), data.get('accent_color', '#c9a96e'),
                    data.get('font_style', 'serif'), data.get('rsvp_deadline')))
    db.commit()
    db.close()
    return jsonify({"message": "Invitation saved"}), 200
