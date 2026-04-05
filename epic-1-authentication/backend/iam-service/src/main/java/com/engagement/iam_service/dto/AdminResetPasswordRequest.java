package com.engagement.iam_service.dto;

import lombok.Data;

@Data
public class AdminResetPasswordRequest {
    private String newPassword;
}
