# 📚 Library Management System (Node.js + Express + SQLite)

VS Code এ সহজে রান করার জন্য তৈরি একটি সম্পূর্ণ Library Management System প্রজেক্ট।
Backend এ Node.js + Express + SQL (SQLite) ব্যবহার করা হয়েছে, আর একটা সিম্পল HTML/CSS/JS ফ্রন্টএন্ড আছে।

## Features
- Books add / update / delete
- Members add / delete
- Issue বই ও Return বই ট্র্যাকিং (transactions table)
- Dashboard এ total books, total members, currently issued বইয়ের সংখ্যা
- SQL schema (`database.js` ফাইলে) — books, members, transactions টেবিল সহ
- SQLite database file (`library.db`) অটোমেটিক তৈরি হয়ে যাবে প্রথমবার রান করলে, sample data সহ

## চালানোর নিয়ম (How to Run in VS Code)

1. এই zip ফাইলটা extract করে VS Code এ folder হিসেবে open করুন
   (File → Open Folder → `library-management`)

2. VS Code এর Terminal খুলুন (Ctrl + `) এবং নিচের কমান্ড দিন dependency install করার জন্য:
   ```
   npm install
   ```

3. তারপর প্রজেক্ট রান করুন:
   ```
   npm start
   ```

4. Terminal এ দেখবেন লেখা আসবে:
   ```
   Library Management System running at http://localhost:3000
   ```

5. Browser এ গিয়ে এই লিংক এ যান:
   ```
   http://localhost:3000
   ```

ব্যস, আপনার Library Management System রেডি!

## Project Structure
```
library-management/
├── server.js          # Express server + সব API routes
├── database.js        # SQL schema ও SQLite connection (এখানে সব SQL টেবিল আছে)
├── package.json
├── library.db          # প্রথমবার রান করলে অটো তৈরি হবে
└── public/
    ├── index.html      # UI
    ├── style.css
    └── app.js          # Frontend logic (fetch API calls)
```

## SQL Tables (database.js এ দেখুন)
- **books** — id, title, author, isbn, category, total_copies, available_copies
- **members** — id, name, email, phone, address
- **transactions** — id, book_id, member_id, issue_date, due_date, return_date, status

## Note
- Database হিসেবে SQLite ব্যবহার করা হয়েছে তাই আলাদা করে MySQL/PostgreSQL সার্ভার সেটআপ করার দরকার নেই — `npm install` করলেই সব রেডি হয়ে যাবে।
- যদি MySQL দিয়ে করতে চান, বলবেন — সেটার জন্য আলাদা ভার্সন বানিয়ে দিতে পারি।
