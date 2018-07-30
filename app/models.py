from datetime import datetime
from app import db


class Tweets(db.Model):
	tweet_direct_link = db.Column(db.String(500))
	urls = db.Column(db.String(2000))
	full_text = db.Column(db.String(2000))
	id = db.Column(db.String(50), primary_key=True)
	user = db.Column(db.String(50))
	screen_name = db.Column(db.String(100))
	unshort_urls = db.Column(db.String(2000))
	tweet_type = db.Column(db.String(50))
	date_created = db.Column(db.String(100))

	def __repr__(self):
		return '<Tweets {}>'.format(self.body)

