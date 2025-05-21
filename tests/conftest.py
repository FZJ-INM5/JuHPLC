import os
import sys
import django

# Ensure that the project root is part of the import path so that the
# WebApp Django settings module can be imported when tests are executed
# from within the ``tests`` directory.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WebApp.settings')
django.setup()
