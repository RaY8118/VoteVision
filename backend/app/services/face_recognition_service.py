import face_recognition
import numpy as np
import base64
from io import BytesIO
from PIL import Image

def verify_face(registered_face: str, current_face: str) -> bool:
    """
    Verify if the current face matches the registered face
    Args:
        registered_face: Base64 encoded registered face image
        current_face: Base64 encoded current face image
    Returns:
        bool: True if faces match, False otherwise
    """
    try:
        # Decode base64 images
        registered_img = Image.open(BytesIO(base64.b64decode(registered_face)))
        current_img = Image.open(BytesIO(base64.b64decode(current_face)))
        
        # Convert to numpy arrays
        registered_array = np.array(registered_img)
        current_array = np.array(current_img)
        
        # Get face encodings
        registered_encoding = face_recognition.face_encodings(registered_array)[0]
        current_encoding = face_recognition.face_encodings(current_array)[0]
        
        # Compare faces
        results = face_recognition.compare_faces([registered_encoding], current_encoding, tolerance=0.6)
        return results[0]
    except Exception as e:
        print(f"Face verification error: {str(e)}")
        return False 