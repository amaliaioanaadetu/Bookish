from datetime import datetime

from bookish.app import db
from datetime import datetime


class Books(db.Model):
    # This sets the name of the table in the database
    __tablename__ = 'Books'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    isbn = db.Column(db.String(), nullable=False)
    title = db.Column(db.String(), nullable=False)
    total_copies = db.Column(db.Integer, nullable=False, default=1)
    available_copies = db.Column(db.Integer, nullable=False, default=1)
    inserted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, isbn, title, total_copies=1, available_copies=1):
        elf.isbn = isbn
        self.title = title
        self.total_copies = total_copies
        self.available_copies = available_copies

    def __repr__(self):
        return f'<Book id={self.id} title={self.title}>'

    def serialize(self):
        return {
            'id': self.id,
            'isbn': self.isbn,
            'title': self.title,
            'total_copies': self.total_copies,
            'available_copies': self.available_copies,
            'inserted_at': self.inserted_at.isoformat() if self.inserted_at else None
        }
