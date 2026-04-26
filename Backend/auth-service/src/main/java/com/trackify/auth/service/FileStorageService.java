package com.trackify.auth.service;

import com.trackify.auth.config.StorageProperties;
import com.trackify.common.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path rootLocation;

    public FileStorageService(StorageProperties properties) {
        this.rootLocation = Paths.get(properties.getLocation());
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw AppException.internalError("Could not initialize storage location");
        }
    }

    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw AppException.badRequest("Failed to store empty file.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String fileName = UUID.randomUUID().toString() + (extension != null ? "." + extension : "");

        try {
            if (originalFilename.contains("..")) {
                throw AppException.badRequest("Cannot store file with relative path outside current directory");
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, this.rootLocation.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw AppException.internalError("Failed to store file");
        }

        return fileName;
    }
}
