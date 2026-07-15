# 🎓 Student Management System (Flask + MongoDB)

আপনার আগের প্রজেক্টটাকে আপডেট করে দেওয়া হয়েছে। যা যা বদলানো হয়েছে তার লিস্ট নিচে দেওয়া আছে।

## নতুন কী কী যোগ হয়েছে (What's improved)
- **Bug fix:** আগে Delete/Update `name` দিয়ে হতো — দুইজন student এর নাম একই হলে সমস্যা হতো। এখন MongoDB এর নিজস্ব unique `_id` দিয়ে delete/update হয়, তাই একদম নির্ভুল।
- **Search box** — নাম বা ডিপার্টমেন্ট দিয়ে সার্চ করা যায়
- **Edit করা সহজ** — এখন popup (modal) এ student এর আগের তথ্য auto-fill হয়ে আসবে, শুধু বদলে Save করলেই হবে
- **Success/Error message** দেখাবে (flash message) — যেমন "Student added", "Invalid id" ইত্যাদি
- **HTML আলাদা ফাইলে** (`templates/index.html`) — কোড অনেক পরিষ্কার, আগে সব HTML `app.py` এর ভেতরেই ছিল
- **`.env` ফাইল দিয়ে MongoDB connection string** — কোডের ভেতরে hardcode করা নেই, তাই local MongoDB বা MongoDB Atlas (cloud) যেকোনোটা সহজে ব্যবহার করা যাবে
- **Input validation** — খালি ফিল্ড বা ভুল age (non-numeric) দিলে এখন error দেখাবে, crash করবে না

## Project Structure
```
student-management/
├── app.py                 # Flask app + সব routes
├── requirements.txt       # Python dependencies
├── .env.example            # MongoDB connection config এর নমুনা
├── templates/
│   └── index.html          # UI template
└── static/
    ├── style.css
    └── app.js               # Edit modal এর জন্য JS
```

## VS Code এ চালানোর নিয়ম

### ধাপ ১: MongoDB রেডি করুন
আপনার দুইটা অপশন আছে —

**Option A — Local MongoDB (নিজের কম্পিউটারে ইনস্টল করা)**
যদি আগে থেকেই local MongoDB চালানো থাকে, কিছু করার দরকার নেই। যদি install করা না থাকে:
- MongoDB Community Server ডাউনলোড করুন: https://www.mongodb.com/try/download/community
- Install করে MongoDB service চালু রাখুন

**Option B — MongoDB Atlas (Cloud, ফ্রি, ইনস্টল করা লাগবে না) — সহজ এবং recommended**
- https://www.mongodb.com/cloud/atlas/register এ গিয়ে ফ্রি অ্যাকাউন্ট বানান
- একটা ফ্রি cluster তৈরি করুন
- "Connect" → "Drivers" থেকে connection string কপি করুন (দেখতে এমন হবে: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)

### ধাপ ২: Project setup
1. zip extract করে VS Code এ folder open করুন
2. Terminal এ (Ctrl + `) virtual environment বানান (optional কিন্তু ভালো practice):
   ```
   python -m venv venv
   venv\Scripts\activate        # Windows
   source venv/bin/activate     # Mac/Linux
   ```
3. Dependencies install করুন:
   ```
   pip install -r requirements.txt
   ```

### ধাপ ৩: MongoDB connection সেট করুন
1. `.env.example` ফাইলের নাম কপি করে **`.env`** নামে একটা নতুন ফাইল বানান
2. `.env` ফাইলে আপনার MongoDB connection string বসান:
   ```
   MONGO_URI=mongodb://localhost:27017/
   DB_NAME=student_db
   ```
   (Atlas ব্যবহার করলে সেই connection string বসাবেন)

### ধাপ ৪: Run করুন
```
python app.py
```
Terminal এ দেখবেন:
```
* Running on http://127.0.0.1:5000
```
Browser এ `http://127.0.0.1:5000` খুলুন — কাজ শুরু!

## ডেটা কোথায় জমা হচ্ছে দেখবেন কীভাবে
- **MongoDB Compass** (ফ্রি GUI tool) ডাউনলোড করুন: https://www.mongodb.com/try/download/compass
- সেখানে আপনার connection string দিয়ে connect করলে `student_db` ডাটাবেস আর `students` কালেকশন দেখতে পাবেন
- অথবা VS Code এ **"MongoDB for VS Code"** extension install করেও দেখা যায়
