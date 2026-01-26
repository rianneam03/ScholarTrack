# Email Function
from django.core.mail import send_mail
from django.conf import settings

def send_activation_email(to_email, token):
    activation_link = f"https://yourfrontend.com/activate?token={token}"
    subject = "Activate your ScholarTrack account"
    message = f"Hello!\n\nClick the link below to set your password and activate your account:\n\n{activation_link}\n\nIf you didn't request this, ignore this email."
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
        fail_silently=False,
    )
