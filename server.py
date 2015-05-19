""" server.py """
from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_oauthlib.client import OAuth
from pymongo import MongoClient

import json
import os

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017

app = Flask(__name__)
app.secret_key = 'development'
app.config.from_object(__name__)
app.config['MONGO_DBNAME'] = "mainAPP"

#connection = MongoClient('localhost', 27017)
connection = MongoClient(app.config['MONGODB_HOST'], app.config['MONGODB_PORT'])

#oauth for github connections
oauth = OAuth(app)
github = oauth.remote_app(
    'github',
    consumer_key=os.getenv('CLIENT_ID'),
    consumer_secret=os.getenv('CLIENT_SECRET'),
    request_token_params={'scope': 'user:email'},
    base_url='https://api.github.com/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize'
)

@github.tokengetter
def get_github_oauth_token():
    return session.get('github_token')

@app.route('/login')
def login():
    return github.authorize(callback=url_for('authorized', _external=True))


@app.route('/logout')
def logout():
    session.pop('github_token', None)
    return redirect(url_for('index'))


@app.route('/login/authorized')
def authorized():
    resp = github.authorized_response()
    if resp is None:
        return 'Access denied: reason=%s error=%s' % (
            request.args['error'],
            request.args['error_description']
        )
    session['github_token'] = (resp['access_token'], '')
    #TODO: If it's the first login, add to database so that we can keep track of everything
    me = github.get('user')
    return redirect(url_for('index'))
    #return jsonify(me.data)


@app.route('/', methods=['GET'])
def index():
    if 'github_token' not in session:
        return redirect(url_for('login'))

    app.logger.debug(session['github_token'])
    db = connection['mainAPP']
    collection = db.urls
    urls = collection.find()
    existing_urls = []

    for url in urls:
        usr = {'name': str(url['name']),
               'url': str(url['url'])}
        existing_urls.append(usr)

    return render_template("index.html", existing=json.dumps(existing_urls))


# @app.route('/users/', methods=['GET'])
# def show_users():
#     db = connection['mainAPP']
#     collection = db.users
#     users = collection.find()
#     existing_users = []
#
#     for user in users:
#         usr = {'username': str(user['username']),
#                'email': str(user['email']),
#                'skills': user['skills']}
#         existing_users.append(usr)
#
#     return render_template("users.html", existingUsers=json.dumps(existing_users))

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
