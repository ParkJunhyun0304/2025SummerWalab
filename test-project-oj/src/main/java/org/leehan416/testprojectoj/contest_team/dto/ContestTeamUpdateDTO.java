package org.leehan416.testprojectoj.contest_team.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ContestTeamUpdateDTO {
    private String teamname;
    private List<Long> memberIds;
    private Long contestId;
}
