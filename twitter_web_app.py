from app import app, db
from app.models import Posts, Urls, Twitter


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Posts': Posts, 'Urls': Urls, 'Twitter': Twitter}
