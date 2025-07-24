package org.leehan416.testprojectoj.problem.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.leehan416.testprojectoj.contest.domain.Contest;
import org.leehan416.testprojectoj.user.domain.User;

import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(
        name = "problem",
        uniqueConstraints = @UniqueConstraint(columnNames = {"_id", "contest_id"})
)
@Getter
@Setter
@Immutable
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "problem_id_seq")
    @SequenceGenerator(name = "problem_id_seq", sequenceName = "problem_id_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "input_description", nullable = false, columnDefinition = "text")
    private String inputDescription;

    @Column(name = "output_description", nullable = false, columnDefinition = "text")
    private String outputDescription;

    @Column(nullable = false, columnDefinition = "json")
    private String samples;

    @Column(name = "test_case_id", nullable = false, length = 255)
    private String testCaseId;

    @Column(name = "test_case_score", nullable = false, columnDefinition = "json")
    private String testCaseScore;

    @Column(columnDefinition = "text")
    private String hint;

    @Column(nullable = false, columnDefinition = "json")
    private String languages;

    @Column(nullable = false, columnDefinition = "json")
    private String template;

    @Column(name = "create_time", nullable = false)
    private OffsetDateTime createTime;

    @Column(name = "last_update_time")
    private OffsetDateTime lastUpdateTime;

    @Column(name = "time_limit", nullable = false)
    private Integer timeLimit;

    @Column(name = "memory_limit", nullable = false)
    private Integer memoryLimit;

    @Column(nullable = false)
    private boolean spj;

    @Column(name = "spj_language", length = 255)
    private String spjLanguage;

    @Column(name = "spj_code", length = 255)
    private String spjCode;

    @Column(name = "spj_version", length = 255)
    private String spjVersion;

    @Column(name = "rule_type", nullable = false, length = 255)
    private String ruleType;

    @Column(nullable = false)
    private boolean visible;

    @Column(nullable = false, length = 255)
    private String difficulty;

    @Column(length = 255)
    private String source;

    @Column(name = "submission_number", nullable = false)
    private Long submissionNumber;

    @Column(name = "accepted_number", nullable = false)
    private Long acceptedNumber;

    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(name = "_id", nullable = false, length = 255)
    private String displayId;

    @Column(name = "statistic_info", nullable = false, columnDefinition = "json")
    private String statisticInfo;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore;

    @ManyToOne
    @JoinColumn(name = "contest_id")
    private Contest contest;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    @Column(name = "spj_compile_ok", nullable = false)
    private boolean spjCompileOk;

    @Column(name = "io_mode", nullable = false, columnDefinition = "json")
    private String ioMode;

    @Column(name = "share_submission", nullable = false)
    private boolean shareSubmission;

    @ManyToMany
    @JoinTable(
            name = "problem_tags",
            joinColumns = @JoinColumn(name = "problem_id"),
            inverseJoinColumns = @JoinColumn(name = "problemtag_id")
    )
    private Set<ProblemTag> tags;

    // Getter/Setter 생략
}