const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath);

// ---------- SQL SCHEMA ----------
const createTables = `
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT,
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME NOT NULL,
    return_date DATETIME,
    status TEXT NOT NULL DEFAULT 'issued',
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);
`;

db.serialize(() => {
    db.exec(createTables, (err) => {
        if (err) {
            console.error('Error creating tables:', err.message);
        } else {
            console.log('Tables ready.');
            seedData();
        }
    });
});

// Insert a few sample rows only if the books table is empty
function seedData() {
    db.get('SELECT COUNT(*) AS count FROM books', (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
            const sampleBooks = [
                ['The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fantasy', 3, 3],
                ['Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 2, 2],
                ['A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', 4, 4]
            ];
            const stmt = db.prepare(
                `INSERT INTO books (title, author, isbn, category, total_copies, available_copies)
                 VALUES (?, ?, ?, ?, ?, ?)`
            );
            sampleBooks.forEach((b) => stmt.run(b));
            stmt.finalize();

            const sampleMembers = [
                ['Rahim Uddin', 'rahim@example.com', '01710000000', 'Dhaka'],
                ['Karim Islam', 'karim@example.com', '01820000000', 'Rajshahi']
            ];
            const stmt2 = db.prepare(
                `INSERT INTO members (name, email, phone, address) VALUES (?, ?, ?, ?)`
            );
            sampleMembers.forEach((m) => stmt2.run(m));
            stmt2.finalize();

            console.log('Sample data inserted.');
        }
    });
}

module.exports = db;
