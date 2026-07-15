const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ================= BOOKS =================

// Get all books
app.get('/api/books', (req, res) => {
    db.all('SELECT * FROM books ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a book
app.post('/api/books', (req, res) => {
    const { title, author, isbn, category, total_copies } = req.body;
    if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }
    const copies = total_copies ? parseInt(total_copies) : 1;
    db.run(
        `INSERT INTO books (title, author, isbn, category, total_copies, available_copies)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, author, isbn || null, category || null, copies, copies],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// Update a book
app.put('/api/books/:id', (req, res) => {
    const { title, author, isbn, category, total_copies } = req.body;
    db.run(
        `UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, total_copies = ?
         WHERE id = ?`,
        [title, author, isbn, category, total_copies, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        }
    );
});

// Delete a book
app.delete('/api/books/:id', (req, res) => {
    db.run('DELETE FROM books WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ================= MEMBERS =================

app.get('/api/members', (req, res) => {
    db.all('SELECT * FROM members ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/members', (req, res) => {
    const { name, email, phone, address } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    db.run(
        `INSERT INTO members (name, email, phone, address) VALUES (?, ?, ?, ?)`,
        [name, email, phone || null, address || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

app.delete('/api/members/:id', (req, res) => {
    db.run('DELETE FROM members WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ================= TRANSACTIONS (Issue / Return) =================

// Get all transactions (with book & member info)
app.get('/api/transactions', (req, res) => {
    const sql = `
        SELECT t.id, t.issue_date, t.due_date, t.return_date, t.status,
               b.title AS book_title, m.name AS member_name,
               t.book_id, t.member_id
        FROM transactions t
        JOIN books b ON t.book_id = b.id
        JOIN members m ON t.member_id = m.id
        ORDER BY t.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Issue a book
app.post('/api/transactions/issue', (req, res) => {
    const { book_id, member_id, days } = req.body;
    if (!book_id || !member_id) {
        return res.status(400).json({ error: 'book_id and member_id are required' });
    }
    const loanDays = days ? parseInt(days) : 14;

    db.get('SELECT available_copies FROM books WHERE id = ?', [book_id], (err, book) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        if (book.available_copies < 1) {
            return res.status(400).json({ error: 'No available copies for this book' });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + loanDays);

        db.run(
            `INSERT INTO transactions (book_id, member_id, due_date, status)
             VALUES (?, ?, ?, 'issued')`,
            [book_id, member_id, dueDate.toISOString()],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                db.run(
                    'UPDATE books SET available_copies = available_copies - 1 WHERE id = ?',
                    [book_id]
                );
                res.json({ id: this.lastID, due_date: dueDate.toISOString() });
            }
        );
    });
});

// Return a book
app.post('/api/transactions/:id/return', (req, res) => {
    const txId = req.params.id;
    db.get('SELECT * FROM transactions WHERE id = ?', [txId], (err, tx) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!tx) return res.status(404).json({ error: 'Transaction not found' });
        if (tx.status === 'returned') {
            return res.status(400).json({ error: 'Book already returned' });
        }

        db.run(
            `UPDATE transactions SET status = 'returned', return_date = ? WHERE id = ?`,
            [new Date().toISOString(), txId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                db.run(
                    'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?',
                    [tx.book_id]
                );
                res.json({ returned: true });
            }
        );
    });
});

// ================= DASHBOARD STATS =================
app.get('/api/stats', (req, res) => {
    const stats = {};
    db.get('SELECT COUNT(*) AS total FROM books', [], (err, r1) => {
        stats.totalBooks = r1 ? r1.total : 0;
        db.get('SELECT COUNT(*) AS total FROM members', [], (err, r2) => {
            stats.totalMembers = r2 ? r2.total : 0;
            db.get(
                `SELECT COUNT(*) AS total FROM transactions WHERE status = 'issued'`,
                [],
                (err, r3) => {
                    stats.booksIssued = r3 ? r3.total : 0;
                    res.json(stats);
                }
            );
        });
    });
});

app.listen(PORT, () => {
    console.log(`Library Management System running at http://localhost:${PORT}`);
});
