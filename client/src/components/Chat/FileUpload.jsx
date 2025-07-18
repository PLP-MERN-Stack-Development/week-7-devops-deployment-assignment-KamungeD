import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onFileUpload, disabled }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'audio/*': ['.mp3', '.wav'],
      'video/*': ['.mp4']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  async function handleFileDrop(acceptedFiles) {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    await uploadFile(file);
  }

  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const fileData = await response.json();
      
      // Call the parent component's callback
      onFileUpload({
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize
      });

      setUploadProgress(100);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            uploadFile(e.target.files[0]);
          }
        }}
        style={{ display: 'none' }}
        accept="image/*,application/pdf,.doc,.docx,.txt,audio/*,video/*"
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        title="Upload file"
      >
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        )}
      </button>

      {/* Drag and drop area (optional, can be activated) */}
      {isDragActive && (
        <div className="absolute inset-0 bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-blue-500 font-medium">Drop file here to upload</p>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="absolute bottom-full left-0 right-0 mb-2">
          <div className="bg-white border rounded-lg p-3 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">Uploading...</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
