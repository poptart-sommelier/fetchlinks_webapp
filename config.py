import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you_will_never_guess'
    # SQLALCHEMY_DATABASE_URI = 'mysql+mysqldb://root:thepassword@127.0.0.1:3306/fetchlinks'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:thepassword@127.0.0.1:3306/fetchlinks'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    POSTS_PER_PAGE = 50
