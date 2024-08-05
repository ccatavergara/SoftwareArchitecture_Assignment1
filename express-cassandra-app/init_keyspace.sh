#!/bin/bash

# Esperar a que Cassandra esté disponible
echo "Waiting for Cassandra to start..."
sleep 30

# Ejecutar el script CQL
echo "Creating keyspace..."
cqlsh -f /docker-entrypoint-initdb.d/init_keyspace.cql

echo "Keyspace created successfully!"
