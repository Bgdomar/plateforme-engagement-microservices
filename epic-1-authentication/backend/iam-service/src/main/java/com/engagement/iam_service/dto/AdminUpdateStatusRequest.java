package com.engagement.iam_service.dto;

import com.engagement.iam_service.model.UserStatus;
import lombok.Data;

@Data
public class AdminUpdateStatusRequest {
    private UserStatus status;
}
