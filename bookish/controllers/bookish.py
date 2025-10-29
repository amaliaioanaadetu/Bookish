from flask import request, jsonify, g
from datetime import datetime, timedelta
from bookish.models.example import Example
from bookish.models.books import Books
from bookish.models.authors import Authors
from bookish.models.bookAuthors import BookAuthors
from bookish.models.borrowedBooks import BorrowedBooks
from bookish.models.users import Users
from bookish.models import db
from bookish.auth import require_auth, verify_token


def bookish_routes(app):
    @app.route('/healthcheck')
    def health_check():
        return {"status": "OK"}

    @app.route('/example', methods=['POST', 'GET'])
    def handle_example():
        if request.method == 'POST':
            if request.is_json:
                data = request.get_json()
                new_example = Example(data1=data['data1'], data2=data['data2'])
                db.session.add(new_example)
                db.session.commit()
                return {"message": "New example has been created successfully."}
            else:
                return {"error": "The request payload is not in JSON format"}

        elif request.method == 'GET':
            examples = Example.query.all()
            results = [
                {
                    'id': example.id,
                    'data1': example.data1,
                    'data2': example.data2
                } for example in examples]
            return {"examples": results}

    @app.route('/books', methods=['POST', 'GET'])
    def handle_books():
        if request.method == 'POST':
            if request.is_json:
                data = request.get_json()
                auth_header = request.headers.get('Authorization', '')
                if not auth_header.startswith('Bearer '):
                    return jsonify({'error': 'Missing or invalid Authorization header'}), 401
                token = auth_header.split(' ', 1)[1].strip()
                user = verify_token(token)
                if not user:
                    return jsonify({'error': 'Invalid token'}), 401
                g.current_user = user
                title = data.get('title')
                isbn = data.get('isbn')
                total_copies = data.get('total_copies', 1)
                authors = data.get('authors', [])  # list of {first_name, last_name}
                if not title or not isbn:
                    return jsonify({"error": "Missing title or isbn"}), 400

                new_book = Books(title=title, isbn=isbn, total_copies=total_copies, available_copies=total_copies)
                db.session.add(new_book)
                db.session.flush()

                for a in authors:
                    fn = (a.get('first_name') or '').strip()
                    ln = (a.get('last_name') or '').strip()
                    if not fn and not ln:
                        continue
                    existing = Authors.query.filter(Authors.first_name == fn, Authors.last_name == ln).first()
                    if not existing:
                        existing = Authors(first_name=fn, last_name=ln)
                        db.session.add(existing)
                        db.session.flush()
                    db.session.add(BookAuthors(book_id=new_book.id, author_id=existing.id))

                db.session.commit()
                return {"message": "New book has been added successfully.", "book": new_book.serialize()}
            else:
                return {"error": "The request payload is not in JSON format"}

        elif request.method == 'GET':
            search = (request.args.get('search') or '').strip()
            try:
                page = int(request.args.get('page', 1))
                page_size = int(request.args.get('page_size', 10))
            except ValueError:
                return jsonify({"error": "Invalid page or page_size"}), 400

            q = Books.query
            if search:
                # join to authors for search
                q = q.outerjoin(BookAuthors, BookAuthors.book_id == Books.id).outerjoin(Authors, Authors.id == BookAuthors.author_id)
                like = f"%{search}%"
                q = q.filter((Books.title.ilike(like)) | (Authors.first_name.ilike(like)) | (Authors.last_name.ilike(like)))
            q = q.order_by(Books.title.asc()).distinct()

            total = q.count()
            items = q.offset((page - 1) * page_size).limit(page_size).all()

            def serialize_book(b: Books):
                links = BookAuthors.query.filter_by(book_id=b.id).all()
                auth_ids = [l.author_id for l in links]
                auths = Authors.query.filter(Authors.id.in_(auth_ids)).all() if auth_ids else []
                return {
                    'id': b.id,
                    'title': b.title,
                    'isbn': b.isbn,
                    'total_copies': b.total_copies,
                    'available_copies': b.available_copies,
                    'authors': [
                        {'id': a.id, 'first_name': a.first_name, 'last_name': a.last_name}
                        for a in auths
                    ]
                }

            return {"items": [serialize_book(b) for b in items], "page": page, "page_size": page_size, "total": total}

    @app.route('/books/<int:book_id>', methods=['GET'])
    def book_detail(book_id):
        b = Books.query.get_or_404(book_id)
        links = BookAuthors.query.filter_by(book_id=b.id).all()
        auth_ids = [l.author_id for l in links]
        auths = Authors.query.filter(Authors.id.in_(auth_ids)).all() if auth_ids else []

        borrowers_q = BorrowedBooks.query.filter_by(book_id=b.id, returnedAt=None).all()
        borrowers = []
        for br in borrowers_q:
            u = Users.query.get(br.user_id)
            borrowers.append({
                'user': {'id': u.id, 'username': u.username} if u else None,
                'dueDate': br.dueDate.isoformat()
            })

        return {
            'id': b.id,
            'title': b.title,
            'isbn': b.isbn,
            'total_copies': b.total_copies,
            'available_copies': b.available_copies,
            'authors': [{'id': a.id, 'first_name': a.first_name, 'last_name': a.last_name} for a in auths],
            'borrowers': borrowers
        }

    @app.route('/me/borrowed', methods=['GET'])
    @require_auth
    def my_borrowed():
        user_id = g.current_user.id
        rows = BorrowedBooks.query.filter_by(user_id=user_id, returnedAt=None).all()
        result = []
        for r in rows:
            b = Books.query.get(r.book_id)
            if b:
                result.append({
                    'borrow_id': r.id,
                    'book': {'id': b.id, 'title': b.title, 'isbn': b.isbn},
                    'dueDate': r.dueDate.isoformat()
                })
        return {"borrowed": result}

    @app.route('/borrow', methods=['POST'])
    @require_auth
    def borrow_book():
        if not request.is_json:
            return jsonify({'error': 'The request payload is not in JSON format'}), 400
        data = request.get_json()
        try:
            book_id = int(data.get('book_id'))
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid book_id'}), 400
        due = data.get('dueDate')
        if not due:
            return jsonify({'error': 'dueDate is required'}), 400
        try:
            due_dt = datetime.fromisoformat(due)
        except ValueError:
            return jsonify({'error': 'Invalid dueDate format'}), 400
        now = datetime.utcnow()
        if not (now < due_dt <= now + timedelta(days=31)):
            return jsonify({'error': 'dueDate must be in the future and no later than one month'}), 400

        b = Books.query.get_or_404(book_id)
        if b.available_copies <= 0:
            return jsonify({'error': 'Book is not available'}), 409

        b.available_copies -= 1
        br = BorrowedBooks(book_id=b.id, user_id=g.current_user.id, dueDate=due_dt)
        db.session.add(br)
        db.session.add(b)
        db.session.commit()
        return jsonify({'message': 'Book borrowed', 'borrow_id': br.id})

    @app.route('/return', methods=['POST'])
    @require_auth
    def return_book():
        if not request.is_json:
            return jsonify({'error': 'The request payload is not in JSON format'}), 400
        data = request.get_json()
        borrow_id = data.get('borrow_id')
        record = None
        if borrow_id:
            try:
                bid = int(borrow_id)
            except (TypeError, ValueError):
                return jsonify({'error': 'Invalid borrow_id'}), 400
            record = BorrowedBooks.query.get(bid)
        else:
            # fallback by book_id: return the earliest unreturned borrow for this user
            try:
                book_id = int(data.get('book_id'))
            except (TypeError, ValueError):
                return jsonify({'error': 'Invalid book_id'}), 400
            record = BorrowedBooks.query.filter_by(user_id=g.current_user.id, book_id=book_id, returnedAt=None).order_by(BorrowedBooks.borrowedAt.asc()).first()

        if not record or record.user_id != g.current_user.id or record.returnedAt is not None:
            return jsonify({'error': 'Borrow record not found'}), 404

        record.returnedAt = datetime.utcnow()
        b = Books.query.get(record.book_id)
        if b:
            b.available_copies += 1
            db.session.add(b)
        db.session.add(record)
        db.session.commit()
        return jsonify({'message': 'Book returned'})

