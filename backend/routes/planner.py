from flask import Blueprint, request, jsonify
from models import get_db

planner_bp = Blueprint('planner', __name__)

DEFAULT_TASKS = [
    ("Book the venue", "Venue", "high"),
    ("Hire a photographer", "Photography", "high"),
    ("Order wedding dress/suit", "Attire", "high"),
    ("Send save-the-dates", "Stationery", "high"),
    ("Book caterer", "Catering", "high"),
    ("Hire a DJ or band", "Entertainment", "medium"),
    ("Arrange florist", "Decor", "medium"),
    ("Book honeymoon travel", "Travel", "medium"),
    ("Create guest list", "Guests", "high"),
    ("Send invitations", "Stationery", "high"),
    ("Arrange hair & makeup", "Beauty", "medium"),
    ("Plan rehearsal dinner", "Events", "medium"),
    ("Order wedding cake", "Catering", "medium"),
    ("Arrange transportation", "Logistics", "low"),
    ("Assign seating chart", "Guests", "medium"),
    ("Write vows", "Ceremony", "high"),
    ("Get marriage license", "Legal", "high"),
    ("Create wedding timeline", "Logistics", "medium"),
    ("Buy wedding rings", "Jewelry", "high"),
    ("Plan bridal shower", "Events", "low"),
]

@planner_bp.route('/tasks', methods=['GET'])
def get_tasks():
    db = get_db()
    tasks = db.execute('SELECT * FROM checklist ORDER BY priority DESC, due_date').fetchall()
    db.close()
    return jsonify([dict(t) for t in tasks])

@planner_bp.route('/seed', methods=['POST'])
def seed_tasks():
    db = get_db()
    count = db.execute('SELECT COUNT(*) as c FROM checklist').fetchone()['c']
    if count == 0:
        for task, category, priority in DEFAULT_TASKS:
            db.execute('INSERT INTO checklist (task, category, priority) VALUES (?, ?, ?)',
                       (task, category, priority))
        db.commit()
    db.close()
    return jsonify({"message": "Tasks seeded"})

@planner_bp.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    db = get_db()
    db.execute('INSERT INTO checklist (task, category, due_date, priority, notes) VALUES (?,?,?,?,?)',
               (data.get('task'), data.get('category', 'General'),
                data.get('due_date'), data.get('priority', 'medium'), data.get('notes')))
    db.commit()
    db.close()
    return jsonify({"message": "Task added"}), 201

@planner_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    db = get_db()
    db.execute('''UPDATE checklist SET task=?, category=?, due_date=?, completed=?, priority=?, notes=?
                  WHERE id=?''',
               (data.get('task'), data.get('category'), data.get('due_date'),
                data.get('completed', 0), data.get('priority'), data.get('notes'), task_id))
    db.commit()
    db.close()
    return jsonify({"message": "Task updated"})

@planner_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    db = get_db()
    db.execute('DELETE FROM checklist WHERE id=?', (task_id,))
    db.commit()
    db.close()
    return jsonify({"message": "Task deleted"})

@planner_bp.route('/stats', methods=['GET'])
def planner_stats():
    db = get_db()
    total = db.execute('SELECT COUNT(*) as c FROM checklist').fetchone()['c']
    done = db.execute('SELECT COUNT(*) as c FROM checklist WHERE completed=1').fetchone()['c']
    db.close()
    return jsonify({"total": total, "completed": done, "remaining": total - done})
