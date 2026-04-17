package com.engagement.identity.service.interfaces;

import com.engagement.identity.dto.LoginRequest;
import com.engagement.identity.dto.LoginResponse;
import com.engagement.identity.dto.ResetPasswordRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse facialLogin(String userId);
    void resetPassword(ResetPasswordRequest request);
}
