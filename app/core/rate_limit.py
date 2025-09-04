from slowapi import Limiter
from slowapi.util import get_remote_address

# Global rate limiter instance to be reused across the app
limiter = Limiter(key_func=get_remote_address)
