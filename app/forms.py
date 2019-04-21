from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo, Length
from app.models import Users


class LoginForm(FlaskForm):
	username = StringField('Username', validators=[DataRequired()])
	password = StringField('Password', validators=[DataRequired()])
	remember_me = BooleanField('Remember Me')
	submit = SubmitField('Sign In')


class RegistrationForm(FlaskForm):
	username = StringField('Username', validators=[DataRequired()])
	email = StringField('Email', validators=[DataRequired(), Email()])
	password = PasswordField('Password', validators=[DataRequired()])
	password2 = PasswordField(
		'Repeat Password', validators=[DataRequired(), EqualTo('password')])
	submit = SubmitField('Register')

	def validate_username(self, username):
		user = Users.query.filter_by(username=username.data).first()
		if user is not None:
			raise ValidationError('This username is already taken. Choose another.')

	def validate_email(self, email):
		user = Users.query.filter_by(email=email.data).first()
		if user is not None:
			raise ValidationError('Email address already in use. Use another')


class EditProfileForm(FlaskForm):
	username = StringField('Username', validators=[DataRequired()])
	about_me = StringField('About Me', validators=[Length(min=0, max=140)])
	submit = SubmitField('Submit')
