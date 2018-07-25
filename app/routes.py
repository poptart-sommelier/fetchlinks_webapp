from flask import render_template, flash, redirect, url_for, request
from app import app, db
from app.models import Tweets

# TODO: route for all posts, route filtered by user

@app.route('/')
@app.route('/index')
def index():
	posts = Tweets.query.all()
	return render_template('index.html', title='Home', posts=posts)


# @app.route('/user/<username>')
# def user(username):
# 	user = Users.query.filter_by(username=username).first_or_404()
# 	posts = [
# 		{'author': user, 'body': 'Test Post #1'},
# 		{'author': user, 'body': 'Test Post #2'}
# 	]
# 	return render_template('user.html', user=user, posts=posts)

