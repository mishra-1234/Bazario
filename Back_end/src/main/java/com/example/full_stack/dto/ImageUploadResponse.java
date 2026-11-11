package com.example.full_stack.dto;

public class ImageUploadResponse {
    private String imageUrl;
    private String fileName;
    private String message;

    public ImageUploadResponse() {}

    public ImageUploadResponse(String imageUrl, String fileName, String message) {
        this.imageUrl = imageUrl;
        this.fileName = fileName;
        this.message = message;
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

