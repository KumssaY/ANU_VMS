# utils/biometric.py - Utilities for image storage and facial recognition

import os
import uuid
import base64
from datetime import datetime
import numpy as np
import cv2
from deepface import DeepFace
from flask import current_app
import requests
from tqdm import tqdm

def download_vgg_face_weights():
    """Download VGG Face weights if not already downloaded"""
    weights_dir = os.path.expanduser('~/.deepface/weights')
    weights_file = os.path.join(weights_dir, 'vgg_face_weights.h5')
    
    # Check if the file already exists
    if os.path.exists(weights_file):
        print("VGG Face weights already downloaded.")
        return weights_file
    
    # Create directory if it doesn't exist
    os.makedirs(weights_dir, exist_ok=True)
    
    # Download URL
    url = "https://github.com/serengil/deepface_models/releases/download/v1.0/vgg_face_weights.h5"
    print("Downloading VGG Face weights...")
    
    # Download with progress bar and more reliable connection
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    block_size = 1024 * 1024  # 1MB
    
    with open(weights_file, 'wb') as file, tqdm(
            total=total_size,
            unit='B',
            unit_scale=True,
            desc="VGG Face Weights") as bar:
        for data in response.iter_content(block_size):
            bar.update(len(data))
            file.write(data)
    
    print("Download complete!")
    return weights_file

def save_image(image_data):
    """
    Save base64 encoded image data to the filesystem
    
    Args:
        image_data (str): Base64 encoded image data
        
    Returns:
        str: Path to the saved image
    """
    try:
        # Remove header from base64 string if present
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # Decode base64 string
        image_bytes = base64.b64decode(image_data)
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(current_app.config['IMAGES_DIR'], filename)
        
        # Write image to file
        with open(file_path, 'wb') as f:
            f.write(image_bytes)
        
        return os.path.join('images', filename)  # Return relative path
    except Exception as e:
        print(f"Error saving image: {str(e)}")
        return None

def verify_face(stored_image_path, new_image_path, tolerance=0.4):
    """
    Compare a stored image with a new image and return if they match
    
    Args:
        stored_image_path (str): Path to the stored image
        new_image_path (str): Path to the new image
        tolerance (float): Similarity threshold (lower is stricter)
        
    Returns:
        tuple: (bool, float) - whether the faces match and the similarity score
    """
    try:
        # Ensure the full path is used
        full_stored_path = os.path.join(current_app.static_folder, stored_image_path)
        full_new_path = os.path.join(current_app.static_folder, new_image_path)
        
        # Use DeepFace for face comparison
        result = DeepFace.verify(
            img1_path=full_new_path,
            img2_path=full_stored_path,
            model_name='VGG-Face',
            distance_metric='cosine',
            detector_backend='opencv'
        )
        
        # Log the verification result for debugging
        print(f"Face verification result: {result}")
        
        # Return match status and distance
        return result['verified'], result['distance']
    except Exception as e:
        print(f"Error verifying face: {str(e)}")
        return False, float('inf')

def find_matching_visitor(new_image_path, visitors):
    """
    Find the best matching visitor from a list of visitors
    
    Args:
        new_image_path (str): Path to the new image
        visitors (list): List of Visitor objects
        
    Returns:
        tuple: (Visitor, float) - best matching visitor and similarity score
    """
    best_match = None
    best_distance = float('inf')
    
    for visitor in visitors:
        if not visitor.image_path:
            continue
            
        verified, distance = verify_face(visitor.image_path, new_image_path)
        
        # Update best match if this one is better
        if verified and distance < best_distance:
            best_match = visitor
            best_distance = distance
    
    return best_match, best_distance