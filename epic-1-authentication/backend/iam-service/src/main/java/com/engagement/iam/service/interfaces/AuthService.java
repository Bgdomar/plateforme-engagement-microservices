package com.engagement.iam.service.interfaces;

import com.engagement.iam.dto.LoginRequest;
import com.engagement.iam.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);
    LoginResponse facialLogin(Long userId);
}