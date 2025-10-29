from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate(db)

from .authors import Authors
from .bookAuthors import BookAuthors
from .books import Books
from .borrowedBooks import BorrowedBooks
from .users import Users
