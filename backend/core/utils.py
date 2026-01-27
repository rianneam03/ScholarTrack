# utils.py
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_activation_email(to_email, token):
    from_email = os.environ.get("DEFAULT_FROM_EMAIL")  # your verified SendGrid email
    activation_link = f"https://scholartrack-frontend.onrender.com/activate?token={token}"

    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject="Activate Your ScholarTrack Account",
        html_content=f"""
        <p>Hello!</p>
        <p>Click the link below to set your password and activate your account:</p>
        <p><a href="{activation_link}">{activation_link}</a></p>
        <p>If you didn't request this, ignore this email.</p>
        """
    )

    try:
        sg = SendGridAPIClient(os.environ.get("SENDGRID_API_KEY"))
        response = sg.send(message)
        print("Email sent with status code:", response.status_code)
    except Exception as e:
        print("Failed to send email:", e)
