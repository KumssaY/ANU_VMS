import secrets

# Generate a strong random secret key
print ("Generate a strong random secret key:")
print(secrets.token_hex(32))  # 64-character hex string

print("Generate a strong jwt secret key:")
print(secrets.token_urlsafe(64))  # Generates a secure key safe for JWT signing
