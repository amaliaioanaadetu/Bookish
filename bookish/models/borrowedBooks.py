from datetime import datetime
from bookish.app import db

class BorrowedBooks(db.Model):
    __tablename__ = 'BorrowedBooks'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    book_id = db.Column(db.Integer, db.ForeignKey('Books.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    borrowedAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    dueDate = db.Column(db.DateTime, nullable=False)
    returnedAt = db.Column(db.DateTime, nullable=True)

    def __init__(self, book_id, user_id, dueDate, returnedAt=None):
        self.book_id = book_id
        self.user_id = user_id
        self.dueDate = dueDate
        self.returnedAt = returnedAt

    def __repr__(self):
        return f'<BorrowedBooks id={self.id} book_id={self.book_id} user_id={self.user_id}>'

    def serialize(self):
        return {
            'id': self.id,
            'book_id': self.book_id,
            'user_id': self.user_id,
            'borrowedAt': self.borrowedAt.isoformat(),
            'dueDate': self.dueDate.isoformat(),
            'returnedAt': self.returnedAt.isoformat() if self.returnedAt else None
        }
