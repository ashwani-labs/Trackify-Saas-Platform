package com.trackify.project.service;

import java.io.InputStream;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    
    /**
     * Stores a file and returns its storage key/path.
     */
    String store(MultipartFile file);
    
    /**
     * Loads a file as a Resource for downloading.
     */
    Resource loadAsResource(String fileKey);
    
    /**
     * Deletes a file.
     */
    void delete(String fileKey);
}
