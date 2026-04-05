package com.engagement.iam_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class AddMembersRequest {
    private List<Long> userIds;
}
