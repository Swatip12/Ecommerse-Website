#!/bin/bash

# Script to generate self-signed SSL certificates for development/testing
# For production, use certificates from a trusted CA

CERT_DIR="nginx/ssl"
DOMAIN="localhost"

# Create SSL directory if it doesn't exist
mkdir -p $CERT_DIR

# Generate private key
openssl genrsa -out $CERT_DIR/key.pem 2048

# Generate certificate signing request
openssl req -new -key $CERT_DIR/key.pem -out $CERT_DIR/cert.csr -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=$DOMAIN"

# Generate self-signed certificate
openssl x509 -req -days 365 -in $CERT_DIR/cert.csr -signkey $CERT_DIR/key.pem -out $CERT_DIR/cert.pem

# Set proper permissions
chmod 600 $CERT_DIR/key.pem
chmod 644 $CERT_DIR/cert.pem

# Clean up CSR file
rm $CERT_DIR/cert.csr

echo "SSL certificates generated in $CERT_DIR/"
echo "Note: These are self-signed certificates for development/testing only."
echo "For production, obtain certificates from a trusted Certificate Authority."