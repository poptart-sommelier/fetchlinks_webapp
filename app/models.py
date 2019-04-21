from app import db


class Posts(db.Model):
    # tweet_direct_link = db.Column(db.String(500))
    # urls = db.Column(db.String(2000))
    # full_text = db.Column(db.String(2000))
    # id = db.Column(db.String(50), primary_key=True)
    # user = db.Column(db.String(50))
    # screen_name = db.Column(db.String(100))
    # unshort_urls = db.Column(db.String(2000))
    # tweet_type = db.Column(db.String(50))
    # date_created = db.Column(db.String(100))

    idx = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(100))
    author = db.Column(db.String(500))
    description = db.Column(db.String(1500))
    direct_link = db.Column(db.String(250))
    date_created = db.Column(db.DateTime)
    unique_id_string = db.Column(db.String(750))
    url_1 = db.Column(db.String(2200))
    url_2 = db.Column(db.String(2200))
    url_3 = db.Column(db.String(2200))
    url_4 = db.Column(db.String(2200))
    url_5 = db.Column(db.String(2200))
    url_6 = db.Column(db.String(2200))
    urls_missing = db.Column(db.Boolean)


class Twitter(db.Model):
    idx = db.Column(db.Integer, primary_key=True)
    last_accessed_id = db.Column(db.String(100))
    time_created = db.Column(db.DateTime)


class Urls(db.Model):
    idx = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(4000))
    unique_id = db.Column(db.String(100))


def __repr__(self):
    return '<Posts {}>'.format(self.body)

