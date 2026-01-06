#!/usr/bin/env python3
"""
Test script to verify database setup works
"""
import os
import sys
import sqlite3

# Simulate the database.py logic
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

print(f"BASE_DIR: {BASE_DIR}")
print(f"DATA_DIR: {DATA_DIR}")
print(f"DATA_DIR exists: {os.path.exists(DATA_DIR)}")

# Create directory if it doesn't exist
try:
    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"✓ Created/verified data directory")
    print(f"✓ DATA_DIR is writable: {os.access(DATA_DIR, os.W_OK)}")
except Exception as e:
    print(f"✗ Failed to create data directory: {e}")
    sys.exit(1)

# Try to create database
DB_PATH = os.path.join(DATA_DIR, 'test_edupy.db')
print(f"DB_PATH: {DB_PATH}")

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)")
    cursor.execute("INSERT INTO test (name) VALUES ('test')")
    conn.commit()

    cursor.execute("SELECT * FROM test")
    result = cursor.fetchone()
    print(f"✓ Database connection successful!")
    print(f"✓ Test data: {result}")

    conn.close()

    # Clean up test database
    os.remove(DB_PATH)
    print(f"✓ Test completed successfully - database setup is working!")

except Exception as e:
    print(f"✗ Database error: {e}")
    sys.exit(1)
