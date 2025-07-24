package org.leehan416.testprojectoj.user.repository;

import org.leehan416.testprojectoj.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
//
//    // 모든 사용자 조회
//    @Query(value = "SELECT * FROM \"user\"", nativeQuery = true)
//    List<User> findAllUsers();
//
//    // ID로 사용자 조회
//    @Query(value = "SELECT * FROM \"user\" WHERE id = :id", nativeQuery = true)
//    Optional<User> findUserById(@Param("id") Long id);
//
//    // username으로 사용자 조회
//    @Query(value = "SELECT * FROM \"user\" WHERE username = :username", nativeQuery = true)
//    Optional<User> findByUsername(@Param("username") String username);
//
//    // email로 사용자 조회
//    @Query(value = "SELECT * FROM \"user\" WHERE email = :email", nativeQuery = true)
//    Optional<User> findByEmail(@Param("email") String email);
//
//    // 활성 사용자들만 조회 (is_disabled = false)
//    @Query(value = "SELECT * FROM \"user\" WHERE is_disabled = false", nativeQuery = true)
//    List<User> findActiveUsers();
//
//    // 관리자 타입별 사용자 조회
//    @Query(value = "SELECT * FROM \"user\" WHERE admin_type = :adminType", nativeQuery = true)
//    List<User> findByAdminType(@Param("adminType") String adminType);
//
//    // 2FA가 활성화된 사용자들
//    @Query(value = "SELECT * FROM \"user\" WHERE two_factor_auth = true", nativeQuery = true)
//    List<User> findUsersWithTwoFactorAuth();
//
//    // 사용자 생성
//    @Query(value = """
//        INSERT INTO "user" (username, email, password, admin_type, two_factor_auth, open_api, is_disabled, problem_permission, session_keys, create_time)
//        VALUES (:username, :email, :password, :adminType, :twoFactorAuth, :openApi, :isDisabled, :problemPermission, :sessionKeys::jsonb, CURRENT_TIMESTAMP)
//        """, nativeQuery = true)
//    void createUser(@Param("username") String username,
//                    @Param("email") String email,
//                    @Param("password") String password,
//                    @Param("adminType") String adminType,
//                    @Param("twoFactorAuth") boolean twoFactorAuth,
//                    @Param("openApi") boolean openApi,
//                    @Param("isDisabled") boolean isDisabled,
//                    @Param("problemPermission") String problemPermission,
//                    @Param("sessionKeys") String sessionKeys);
//
//    // 사용자 정보 업데이트
//    @Query(value = """
//        UPDATE "user"
//        SET email = :email, last_login = CURRENT_TIMESTAMP
//        WHERE id = :id
//        """, nativeQuery = true)
//    void updateUserLastLogin(@Param("id") Long id, @Param("email") String email);
//
//    // 비밀번호 재설정 토큰 업데이트
//    @Query(value = """
//        UPDATE "user"
//        SET reset_password_token = :token, reset_password_token_expire_time = :expireTime
//        WHERE id = :id
//        """, nativeQuery = true)
//    void updatePasswordResetToken(@Param("id") Long id,
//                                  @Param("token") String token,
//                                  @Param("expireTime") String expireTime);
}
