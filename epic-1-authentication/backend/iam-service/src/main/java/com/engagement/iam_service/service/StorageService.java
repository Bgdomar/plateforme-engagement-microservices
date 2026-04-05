package com.engagement.iam_service.service;

import com.engagement.iam_service.config.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;

    private final MinioClient minioClient;
    private final MinioProperties properties;

    public String uploadProfileImage(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image too large (max 5MB)");
        }

        String contentType = file.getContentType();
        String extension = contentTypeToExtension(contentType);
        if (extension == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG/PNG images are allowed");
        }

        ensureBucketExists();

        String objectName = "users/" + userId + "/avatar-" + UUID.randomUUID() + extension;

        try (InputStream in = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(properties.getBucket())
                            .object(objectName)
                            .stream(in, file.getSize(), -1)
                            .contentType(contentType)
                            .build()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload image", e);
        }

        return buildPublicUrl(objectName);
    }

    private void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(properties.getBucket()).build()
            );
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(properties.getBucket()).build());
            }
        } catch (MinioException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "MinIO error", e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to initialize bucket", e);
        }
    }

    private String buildPublicUrl(String objectName) {
        String base = Objects.requireNonNullElse(properties.getPublicUrl(), "").replaceAll("/+$", "");
        String bucket = Objects.requireNonNullElse(properties.getBucket(), "").replaceAll("^/+|/+$", "");
        String obj = Objects.requireNonNullElse(objectName, "").replaceAll("^/+", "");
        return base + "/" + bucket + "/" + obj;
    }

    private String contentTypeToExtension(String contentType) {
        if (contentType == null) {
            return null;
        }
        return switch (contentType.toLowerCase()) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            default -> null;
        };
    }
}
