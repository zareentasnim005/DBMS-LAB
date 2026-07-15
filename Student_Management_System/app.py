import os
from flask import Flask, request, redirect, render_template, url_for, flash
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key")

# ---------------- MongoDB connection ----------------
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.environ.get("DB_NAME", "student_db")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db["students"]


@app.route("/")
def home():
    query = request.args.get("q", "").strip()

    if query:
        # simple case-insensitive search on name or department
        mongo_filter = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"dept": {"$regex": query, "$options": "i"}},
            ]
        }
    else:
        mongo_filter = {}

    students_cursor = collection.find(mongo_filter).sort("name", 1)

    students = []
    for s in students_cursor:
        students.append({
            "id": str(s["_id"]),
            "name": s.get("name", ""),
            "age": s.get("age", ""),
            "dept": s.get("dept", ""),
        })

    total = collection.count_documents({})

    return render_template("index.html", students=students, query=query, total=total)


@app.route("/add", methods=["POST"])
def add_student():
    name = request.form.get("name", "").strip()
    age = request.form.get("age", "").strip()
    dept = request.form.get("dept", "").strip()

    if not name or not age or not dept:
        flash("সব ফিল্ড পূরণ করা আবশ্যক (All fields are required)", "error")
        return redirect(url_for("home"))

    try:
        age = int(age)
    except ValueError:
        flash("Age অবশ্যই একটি সংখ্যা হতে হবে", "error")
        return redirect(url_for("home"))

    collection.insert_one({
        "name": name,
        "age": age,
        "dept": dept
    })
    flash(f"'{name}' যোগ করা হয়েছে", "success")
    return redirect(url_for("home"))


@app.route("/delete/<student_id>")
def delete_student(student_id):
    try:
        collection.delete_one({"_id": ObjectId(student_id)})
        flash("Student deleted", "success")
    except Exception:
        flash("Invalid student id", "error")
    return redirect(url_for("home"))


@app.route("/update/<student_id>", methods=["POST"])
def update_student(student_id):
    name = request.form.get("name", "").strip()
    age = request.form.get("age", "").strip()
    dept = request.form.get("dept", "").strip()

    update_fields = {}
    if name:
        update_fields["name"] = name
    if dept:
        update_fields["dept"] = dept
    if age:
        try:
            update_fields["age"] = int(age)
        except ValueError:
            flash("Age অবশ্যই একটি সংখ্যা হতে হবে", "error")
            return redirect(url_for("home"))

    if update_fields:
        try:
            collection.update_one(
                {"_id": ObjectId(student_id)},
                {"$set": update_fields}
            )
            flash("Student updated", "success")
        except Exception:
            flash("Invalid student id", "error")

    return redirect(url_for("home"))


if __name__ == "__main__":
    app.run(debug=True)
