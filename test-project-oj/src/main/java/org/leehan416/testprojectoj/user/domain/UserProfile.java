package org.leehan416.testprojectoj.user.domain;
import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

import java.math.BigInteger;

@Entity
@Immutable
@Table(name = "user_profile")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "acm_problems_status", columnDefinition = "jsonb", nullable = false)
    private String acmProblemsStatus;

    @Column(name = "oi_problems_status", columnDefinition = "jsonb", nullable = false)
    private String oiProblemsStatus;

    @Column(name = "real_name")
    private String realName;

    @Column(nullable = false)
    private String avatar;

    @Column(length = 200)
    private String blog;

    private String mood;

    private String github;

    private String school;

    private String major;

    private String language;

    @Column(name = "accepted_number", nullable = false)
    private Integer acceptedNumber;

    @Column(name = "total_score", nullable = false)
    private BigInteger totalScore; // 특별한 이유 없으면 Long으로 변경 권장

    @Column(name = "submission_number", nullable = false)
    private Integer submissionNumber;

    // --- Getter/Setter (실제 서비스에서 필요하다면 Lombok @Getter, @Setter 추천) ---
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getAcmProblemsStatus() {
        return acmProblemsStatus;
    }

    public String getOiProblemsStatus() {
        return oiProblemsStatus;
    }

    public String getRealName() {
        return realName;
    }

    public String getAvatar() {
        return avatar;
    }

    public String getBlog() {
        return blog;
    }

    public String getMood() {
        return mood;
    }

    public String getGithub() {
        return github;
    }

    public String getSchool() {
        return school;
    }

    public String getMajor() {
        return major;
    }

    public String getLanguage() {
        return language;
    }

    public Integer getAcceptedNumber() {
        return acceptedNumber;
    }

    public BigInteger getTotalScore() {
        return totalScore;
    }

    public Integer getSubmissionNumber() {
        return submissionNumber;
    }
}
