#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
def main():
    """Run administrative tasks."""
    # Make sure Python can find your apps inside this backend folder
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholartrack.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available in your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
