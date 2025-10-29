from flask import request, jsonify
from bookish.models import db
from bookish.models.users import Users
from bookish.auth import generate_token


def auth_routes(app):
    @app.route('/auth/register', methods=['POST'])
    def register():
        if not request.is_json:
            return jsonify({'error': 'The request payload is not in JSON format'}), 400
        data = request.get_json()
        required = ['first_name', 'last_name', 'email', 'username', 'password']
        if any(k not in data or not data[k] for k in required):
            return jsonify({'error': 'Missing required fields'}), 400
        if Users.query.filter((Users.email == data['email']) | (Users.username == data['username'])).first():
            return jsonify({'error': 'User with provided email or username already exists'}), 409
        user = Users(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            username=data['username'],
            password=data['password']
        )
        db.session.add(user)
        db.session.commit()
        token = generate_token(user.id)
        return jsonify({'token': token, 'user': user.serialize()})

    @app.route('/auth/login', methods=['POST'])
    def login():
        if not request.is_json:
            return jsonify({'error': 'The request payload is not in JSON format'}), 400
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400
        user = Users.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        token = generate_token(user.id)
        return jsonify({'token': token, 'user': user.serialize()})
