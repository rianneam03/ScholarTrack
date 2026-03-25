import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

sql = """
CREATE TABLE IF NOT EXISTS "needs" ("needid" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "title" varchar(100) NOT NULL, "description" text NULL, "amount_needed" decimal NOT NULL, "current_amount" decimal NOT NULL, "created_at" datetime NOT NULL, "urgency" varchar(20) NOT NULL);
CREATE TABLE IF NOT EXISTS "surveys" ("survey_id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "title" varchar(255) NOT NULL, "target_audience" varchar(50) NOT NULL, "created_at" datetime NOT NULL, "program_year_id" integer NOT NULL REFERENCES "program_years" ("program_year_id") DEFERRABLE INITIALLY DEFERRED);
CREATE TABLE IF NOT EXISTS "survey_responses" ("response_id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "response_data" jsonb NOT NULL, "submitted_at" datetime NOT NULL, "responder_user_id" integer NULL REFERENCES "users" ("userid") DEFERRABLE INITIALLY DEFERRED, "survey_id" integer NOT NULL REFERENCES "surveys" ("survey_id") DEFERRABLE INITIALLY DEFERRED);
"""
# Wait, PostgreSQL syntax uses SERIAL instead of AUTOINCREMENT!
