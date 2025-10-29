from bookish.controllers.bookish import bookish_routes
from bookish.controllers.auth import auth_routes


def register_controllers(app):
    bookish_routes(app)
    auth_routes(app)
