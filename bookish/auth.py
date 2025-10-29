from functools import wraps
from flask import request, jsonify, g, current_app
from itsdangerous import URLSafeSerializer, BadSignature
from bookish.models.users import Users


def _get_serializer():
    secret = current_app.config['SECRET_KEY']
    return URLSafeSerializer(secret_key=secret, salt='auth-token')


def generate_token(user_id: int) -> str:
    s = _get_serializer()
    return s.dumps({'uid': user_id})


def verify_token(token: str):
    s = _get_serializer()
    try:
        data = s.loads(token)
        uid = data.get('uid')
        if not uid:
            return None
        return Users.query.get(uid)
    except BadSignature:
        return None


def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        token = auth.split(' ', 1)[1].strip()
        user = verify_token(token)
        if not user:
            return jsonify({'error': 'Invalid token'}), 401
        g.current_user = user
        return f(*args, **kwargs)
    return wrapper
