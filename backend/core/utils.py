# utils.py
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


def send_activation_email(to_email, token):
    from_email = os.environ.get("DEFAULT_FROM_EMAIL")  # verified SendGrid sender
    activation_link = f"https://scholartrack-frontend.onrender.com/activate?token={token}"

    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject="Activate your ScholarTrack account",
        html_content=f"""
        <p>Hello,</p>

        <p>Your ScholarTrack account has been created.</p>

        <p>
            Please choose a username and password to activate your account by clicking the link below:
        </p>

        <p>
            <a href="{activation_link}">{activation_link}</a>
        </p>

        <p>
            If you were not expecting this email, you can safely ignore it.
        </p>

        <p>
            — ScholarTrack Team
        </p>
        """
    )

    try:
        sg = SendGridAPIClient(os.environ.get("SENDGRID_API_KEY"))
        response = sg.send(message)
        print("Activation email sent. Status code:", response.status_code)
    except Exception as e:
        print("Failed to send activation email:", e)
