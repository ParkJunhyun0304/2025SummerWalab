package org.leehan416.testprojectoj.user.domain;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "\"user\"", schema = "public")
@Immutable
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(nullable = false, length = 128)
    private String password;

    @Column(name = "last_login")
    private OffsetDateTime lastLogin;

    @Column(nullable = false, unique = true)
    private String username;

    @Column
    private String email;

    @CreationTimestamp  // 자동으로 생성 시간 설정
    @Column(name = "create_time")
    private OffsetDateTime createTime;

    @Column(name = "admin_type", nullable = false)
    private String adminType;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expire_time")
    private OffsetDateTime resetPasswordTokenExpireTime;

    @Column(name = "auth_token")
    private String authToken;

    @Column(name = "two_factor_auth", nullable = false)
    private Boolean twoFactorAuth = false;  // 기본값 설정

    @Column(name = "tfa_token")
    private String tfaToken;

    @Column(name = "open_api", nullable = false)
    private Boolean openApi = false;  // 기본값 설정

    @Column(name = "open_api_appkey")
    private String openApiAppkey;

    @Column(name = "is_disabled", nullable = false)
    private Boolean isDisabled = false;  // 기본값 설정

    @Column(name = "problem_permission", nullable = false)
    private String problemPermission;

    // JSONB를 JsonNode로 처리 (더 유연한 JSON 처리)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "session_keys", columnDefinition = "jsonb", nullable = false)
    private JsonNode sessionKeys;

    // 또는 Map으로 처리하고 싶다면:
    // @JdbcTypeCode(SqlTypes.JSON)
    // @Column(name = "session_keys", columnDefinition = "jsonb", nullable = false)
    // private Map<String, Object> sessionKeys = new HashMap<>();
}