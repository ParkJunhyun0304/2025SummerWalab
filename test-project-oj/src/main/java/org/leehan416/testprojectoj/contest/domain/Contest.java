package org.leehan416.testprojectoj.contest.domain;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.Immutable;
import org.leehan416.testprojectoj.user.domain.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "contest")
@Immutable
@Getter
public class Contest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "real_time_rank")
    private boolean realTimeRank;

    @Column(columnDefinition = "TEXT")
    private String password;

    @Column(name = "rule_type", columnDefinition = "TEXT")
    private String ruleType;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "last_update_time")
    private LocalDateTime lastUpdateTime;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    private boolean visible;

    @Column(name = "allowed_ip_ranges", columnDefinition = "json")
    private String allowedIpRanges; // JSON은 String으로 처리

    // 게터/세터 생략
}