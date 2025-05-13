import random
import string


def generate_id(length=6):
    """Generate a unique ID"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=length))
