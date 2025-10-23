from bookish.app import db

class BookAuthors(db.Model):
    __tablename__ = 'BookAuthor'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    book_id = db.Column(db.Integer, db.ForeignKey('Books.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('Authors.id'), nullable=False)

    def __init__(self, book_id, author_id):
        self.book_id = book_id
        self.author_id = author_id

    def __repr__(self):
        return f'<BookAuthor id={self.id} book_id={self.book_id} author_id={self.author_id}>'

    def serialize(self):
        return {
            'id': self.id,
            'book_id': self.book_id,
            'author_id': self.author_id
        }
