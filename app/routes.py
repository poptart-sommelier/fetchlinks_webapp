from flask import render_template, flash, redirect, url_for, request
from app import app, db
from app.models import Tweets

# TODO: route for all posts, route filtered by user

@app.route('/')
@app.route('/index')
def index():
	page = request.args.get('page', 1, type=int)
	posts = Tweets.query.order_by(Tweets.id.desc()).paginate(
		page, app.config['POSTS_PER_PAGE'], False)
	next_url = url_for('index', page=posts.next_num) if posts.has_next else None
	prev_url = url_for('index', page=posts.prev_num) if posts.has_prev else None
	return render_template('index.html', title='Home', posts=posts.items, next_url=next_url, prev_url=prev_url)

@app.route('/user/<screen_name>')
def user(screen_name):
	page = request.args.get('page', 1, type=int)
	posts = Tweets.query.order_by(Tweets.id.desc()).filter_by(screen_name=screen_name).paginate(
		page, app.config['POSTS_PER_PAGE'], False)
	next_url = url_for('user', page=posts.next_num) if posts.has_next else None
	prev_url = url_for('user', page=posts.prev_num) if posts.has_prev else None
	return render_template('user.html', title='User Posts', screen_name=screen_name, posts=posts.items, next_url=next_url, prev_url=prev_url)

