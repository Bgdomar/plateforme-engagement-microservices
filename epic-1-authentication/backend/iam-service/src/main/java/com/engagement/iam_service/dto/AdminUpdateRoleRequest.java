package com.engagement.iam_service.dto;

import com.engagement.iam_service.model.Role;
import lombok.Data;

@Data
public class AdminUpdateRoleRequest {
    private Role role;
}
