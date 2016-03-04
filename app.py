import json
import os

from sqlalchemy import and_
from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_oauthlib.client import OAuth

from gitRoulette import models
from gitRoulette.utils import request_utils


POSTGRES_HOST = 'localhost'

app = Flask(__name__)
log = app.logger.debug
#TODO: handle secret_keys. This tags the session.
app.secret_key = os.urandom(24)
app.config.from_object(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://' + app.config['POSTGRES_HOST'] + '/mainAPP'

db = models.db
db.init_app(app)

@app.before_first_request
def create_database():
    db.create_all()

# oauth for github connections
oauth = OAuth(app)
github = oauth.remote_app(
    'github',
    consumer_key=os.getenv('CLIENT_ID'),
    consumer_secret=os.getenv('CLIENT_SECRET'),
    request_token_params={'scope': 'user:email,repo,notifications'},
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
        log(request.args['error'])
        log(request.args['error_description'])
        return 'Access denied: reason=%s error=%s' % (
            request.args['error'],
            request.args['error_description']
        )
    session['github_token'] = (resp['access_token'], '')
    me = github.get('user')
    session['github_user'] = me.data['login']

    github_user = models.GitUser.query.filter_by(
        github_user=session['github_user']).first()

    if github_user is None:
        return redirect(url_for('new_user'), code=302)
        # languages = utils.get_languages_from_repos(session['github_user'],
        #                                            session['github_token'])

    #TODO: Redirect to page where we get skills from all the repos
    #      that he has and select to add to his acc.
    #      In case no repo keep a list of skills somewhere & select from that.
    return redirect(url_for('index'))
    #return jsonify(me.data)


@app.route('/', methods=['GET'])
def index():
    if 'github_token' not in session:
        return redirect(url_for('login'))

    urls = models.Url.query.filter_by(github_user=session['github_user']).all()
    existing_urls = []
    for url in urls:
        entry = {'id': url.id,
                 'name': url.name,
                 'url': url.url,
                 'github_user': url.github_user}
        existing_urls.append(entry)

    return render_template("index.html", existing=json.dumps(existing_urls))


@app.route('/add_for_review', methods=['POST'])
def add_for_review():
    if request.method == 'POST':
        req_data = json.loads(request.data)
        #FIXME: fix
        language_list = request_utils.get_url_languages(
            req_data['url'], session['github_token'][0]).keys()

        #FIXME: change name to description in post request
        #FIXME: change time to be taken on the server
        entry = models.Url(name=req_data['name'],
                           url=req_data['url'],
                           github_user=req_data['github_user'])
        for l in language_list:
            language = models.Language(language=l, url=entry)
            db.session.add(language)

        db.session.add(entry)
        db.session.commit()

    return "OK"

@app.route('/remove_from_list', methods=['GET', 'POST'])
def remove_from_queue():
    req_data = json.loads(request.data)
    urls = models.Url.query.filter(
        and_(models.Url.github_user == session['github_user'],
             models.Url.name == req_data['name'])).all()

    if request.method == 'POST':
        for url in urls:
            db.session.delete(url)
        db.session.commit()
    return "test"


@app.route('/add_something', methods=['POST'])
def add_something():
    if request.method == 'POST':
        req_data = json.loads(request.data)

        github_user = models.GitUser.query.filter_by(
            github_user=req_data['github_user']).first()

        if github_user is not None:
            return "no user"
        else:
            something = github_user.somethings.filter_by(
                comment_id=req_data['comment_id']).first()

        if something is None:
            something = models.Something(comment_id=req_data['comment_id'],
                                         gituser=github_user)
            db.session.add(something)
            db.session.commit()

    return "test"

@app.route('/get_something_by_url/<url_id>', methods=['GET'])
def get_something_by_url(url_id):
    # TODO: maybe we need this for something
    url = models.Url.query.filter_by(id=url_id).first()
    s = url.somethings.all()
    log(s)
    return "text"


@app.route('/new_user', methods=['GET', 'POST'])
def new_user():
    # TODO: modify so that a user can add/remove/replace skills;
    # TODO: case: no skills on github..
    # TODO: add a dropdown with common skills.
    if request.method == 'POST':
        req_data = json.loads(request.data)

        gituser = models.GitUser.query.filter_by(
            github_user=session['github_user']).first()

        if gituser is None:
            gituser = models.GitUser(github_user=session['github_user'])
            db.session.add(gituser)
            for skill in req_data['skills']:
                _s = models.Skill(skill=skill, gituser=gituser)
                log(_s)
                db.session.add(_s)
            db.session.commit()

    return render_template("newUser.html")

if __name__ == '__main__':
    #remove debug=True for production!
    app.run(host='0.0.0.0', port=8080, debug=True)
