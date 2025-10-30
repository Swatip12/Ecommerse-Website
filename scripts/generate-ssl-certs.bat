@echo off
REM Script to generate self-signed SSL certificates for development/testing
REM For production, use certificates from a trusted CA

set CERT_DIR=nginx\ssl
set DOMAIN=localhost

REM Create SSL directory if it doesn't exist
if not exist %CERT_DIR% mkdir %CERT_DIR%

REM Generate private key
openssl genrsa -out %CERT_DIR%\key.pem 2048

REM Generate certificate signing request
openssl req -new -key %CERT_DIR%\key.pem -out %CERT_DIR%\cert.csr -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=%DOMAIN%"

REM Generate self-signed certificate
openssl x509 -req -days 365 -in %CERT_DIR%\cert.csr -signkey %CERT_DIR%\key.pem -out %CERT_DIR%\cert.pem

REM Clean up CSR file
del %CERT_DIR%\cert.csr

echo SSL certificates generated in %CERT_DIR%\
echo Note: These are self-signed certificates for development/testing only.
echo For production, obtain certificates from a trusted Certificate Authority.