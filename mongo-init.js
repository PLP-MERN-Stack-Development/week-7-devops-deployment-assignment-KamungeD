// MongoDB initialization script
db = db.getSiblingDB('chatapp');

// Create collections
db.createCollection('users');
db.createCollection('messages');
db.createCollection('rooms');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.messages.createIndex({ createdAt: -1 });
db.messages.createIndex({ room: 1, createdAt: -1 });

print('Database initialized successfully');
