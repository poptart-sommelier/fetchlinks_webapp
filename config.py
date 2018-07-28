import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
	SECRET_KEY = os.environ.get('SECRET_KEY') or 'you_will_never_guess'
	SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mysql+mysqldb://rich:testpassword@127.0.0.1:33600/twitter'
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	POSTS_PER_PAGE = 50
