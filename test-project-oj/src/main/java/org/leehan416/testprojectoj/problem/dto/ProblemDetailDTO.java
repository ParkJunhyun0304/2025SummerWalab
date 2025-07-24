package org.leehan416.testprojectoj.problem.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.leehan416.testprojectoj.contest.domain.Contest;
import org.leehan416.testprojectoj.problem.domain.Problem;
import org.leehan416.testprojectoj.problem.domain.ProblemTag;
import org.leehan416.testprojectoj.user.domain.User;

import java.time.OffsetDateTime;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ProblemDetailDTO {
    private Long id;
    private String title;
    private String description;
    private String inputDescription;
    private String outputDescription;
    private String samples;
    private String testCaseId;
    private String testCaseScore;
    private String hint;
    private String languages;
    private String template;
    private OffsetDateTime createTime;
    private OffsetDateTime lastUpdateTime;
    private Integer timeLimit;
    private Integer memoryLimit;
    //    private User createdBy;
    private String displayId;


    public static ProblemDetailDTO from(final Problem problem) {
        if (problem == null) {
            return null;
        }
        return ProblemDetailDTO.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .inputDescription(problem.getInputDescription())
                .outputDescription(problem.getOutputDescription())
                .samples(problem.getSamples())
                .testCaseId(problem.getTestCaseId())
                .testCaseScore(problem.getTestCaseScore())
                .hint(problem.getHint())
                .languages(problem.getLanguages())
                .template(problem.getTemplate())
                .createTime(problem.getCreateTime())
                .lastUpdateTime(problem.getLastUpdateTime())
                .timeLimit(problem.getTimeLimit())
                .memoryLimit(problem.getMemoryLimit())
                .displayId(problem.getDisplayId())
                .build();
    }
}
