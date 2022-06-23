import os

basedir = os.path.abspath(os.path.dirname(__file__))
database = '/your/path/here/fetchlinks.db'

class Config(object):
    SQLALCHEMY_DATABASE_URI = f'sqlite:////{database}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    POSTS_PER_PAGE = 50
