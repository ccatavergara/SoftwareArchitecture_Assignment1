-- init_keyspace.cql
CREATE KEYSPACE IF NOT EXISTS book_app
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};