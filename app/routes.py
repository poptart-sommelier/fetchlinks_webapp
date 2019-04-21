from flask import render_template, flash, redirect, url_for, request
from app import app, db
from app.models import Posts, Urls


# TODO: route for all posts, route filtered by user
def fetch_urls(post):
    url_list = []

    all_unique_id_strings = post.unique_id_string.split(',')

    for u_id in all_unique_id_strings:
        url = Urls.query.filter_by(unique_id=u_id).first()
        url_list.append(url.url)

    post.urls = url_list


@app.route('/')
@app.route('/index')
def index():
    page = request.args.get('page', 1, type=int)
    posts = Posts.query.order_by(Posts.date_created.desc()).paginate(
        page, app.config['POSTS_PER_PAGE'], False)

    next_url = url_for('index', page=posts.next_num) if posts.has_next else None
    prev_url = url_for('index', page=posts.prev_num) if posts.has_prev else None
    return render_template('index.html', title='Home', posts=posts.items, next_url=next_url, prev_url=prev_url)


# @app.route('/user/<screen_name>')
# def user(screen_name):
#     page = request.args.get('page', 1, type=int)
#     posts = Posts.query.order_by(Posts.id.desc()).filter_by(screen_name=screen_name).paginate(
#         page, app.config['POSTS_PER_PAGE'], False)
#     next_url = url_for('user', page=posts.next_num) if posts.has_next else None
#     prev_url = url_for('user', page=posts.prev_num) if posts.has_prev else None
#     return render_template('user.html', title='User Posts', screen_name=screen_name, posts=posts.items,
#                            next_url=next_url, prev_url=prev_url)