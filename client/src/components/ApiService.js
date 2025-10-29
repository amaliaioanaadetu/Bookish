export class ApiService {
  constructor() {
    this.tokenKey = 'token';
  }

  get token() {
    return window.localStorage.getItem(this.tokenKey) || '';
  }

  set token(value) {
    if (value) window.localStorage.setItem(this.tokenKey, value);
    else window.localStorage.removeItem(this.tokenKey);
  }

  authHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  healthCheck() {
    return fetch('/healthcheck', { method: 'GET', headers: this.authHeaders() })
      .then(checkResponse)
      .then((r) => r.json());
  }

  // Auth
  register(payload) {
    return fetch('/auth/register', { method: 'POST', headers: this.authHeaders(), body: JSON.stringify(payload) })
      .then(checkResponse)
      .then((r) => r.json())
      .then((data) => { this.token = data.token; return data; });
  }

  login(payload) {
    return fetch('/auth/login', { method: 'POST', headers: this.authHeaders(), body: JSON.stringify(payload) })
      .then(checkResponse)
      .then((r) => r.json())
      .then((data) => { this.token = data.token; return data; });
  }

  logout() { this.token = ''; }

  // Books
  getBooks({ search = '', page = 1, page_size = 10 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('page_size', page_size);
    return fetch(`/books?${params.toString()}`, { method: 'GET', headers: this.authHeaders() })
      .then(checkResponse)
      .then((r) => r.json());
  }

  getBook(id) {
    return fetch(`/books/${id}`, { method: 'GET', headers: this.authHeaders() })
      .then(checkResponse)
      .then((r) => r.json());
  }

  addBook(payload) {
    return fetch('/books', { method: 'POST', headers: this.authHeaders(), body: JSON.stringify(payload) })
      .then(checkResponse)
      .then((r) => r.json());
  }

  // Borrowing
  getMyBorrowed() {
    return fetch('/me/borrowed', { method: 'GET', headers: this.authHeaders() })
      .then(checkResponse)
      .then((r) => r.json());
  }

  borrow({ book_id, dueDate }) {
    return fetch('/borrow', { method: 'POST', headers: this.authHeaders(), body: JSON.stringify({ book_id, dueDate }) })
      .then(checkResponse)
      .then((r) => r.json());
  }

  returnBook(payload) {
    return fetch('/return', { method: 'POST', headers: this.authHeaders(), body: JSON.stringify(payload) })
      .then(checkResponse)
      .then((r) => r.json());
  }
}

const checkResponse = (response) => {
  if (response.ok) return response;
  return response.text().then((e) => { throw new Error(e || 'Request failed'); });
};
