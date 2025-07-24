package org.leehan416.testprojectoj.contest_team.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContestTeamCreateDTO {
    private String teamname;
    private List<Long> memberIds;
    private Long contestId;
}
