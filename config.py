import os

basedir = os.path.abspath(os.path.dirname(__file__))
database = '/home/rich/Documents/PROJECTS/fetchlinks/db/fetchlinks.db'

class Config(object):
    SQLALCHEMY_DATABASE_URI = 'sqlite:////home/rich/Documents/PROJECTS/fetchlinks/db/fetchlinks.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    POSTS_PER_PAGE = 50
