""" server.py """
from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient

import json


MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017

app = Flask(__name__)
app.config.from_object(__name__)
app.config['MONGO_DBNAME'] = "mainAPP"

#connection = MongoClient('localhost', 27017)
connection = MongoClient(app.config['MONGODB_HOST'], app.config['MONGODB_PORT'])

@app.route('/', methods=['GET'])
def index():
    db = connection['mainAPP']
    collection = db.urls
    urls = collection.find()
    existing_urls = []

    for url in urls:
        usr = {'name': str(url['name']),
               'url': str(url['url'])}
        existing_urls.append(usr)

    return render_template("index.html", existing=json.dumps(existing_urls))


@app.route('/login')
def login():
    return render_template("login.html")

@app.route('/users/', methods=['GET'])
def show_users():
    db = connection['mainAPP']
    collection = db.users
    users = collection.find()
    existing_users = []
    
    for user in users:
        usr = {'username': str(user['username']),
               'email': str(user['email']),
               'skills': user['skills']}
        existing_users.append(usr)

    return render_template("users.html", existingUsers=json.dumps(existing_users))

@app.route('/add_for_review', methods=['GET', 'POST'])
def add_for_review():
    db = connection['mainAPP']
    collection = db.urls

    if request.method == 'POST':
        collection.insert(json.loads(request.data))

    return "test"

@app.route('/remove_from_list', methods=['GET', 'POST'])
def remove_user_skill():
    req_data = json.loads(request.data)

    db = connection['mainAPP']
    collection = db.urls
    urls = collection.find({'name': req_data['name'], 'url': req_data['url']})

    if request.method == 'POST':
        for url in urls:
            collection.remove(url)
    return "aa"

if __name__ == '__main__':
    #remove debug=True for production!
    app.run(host='0.0.0.0', port=8080, debug=True)
