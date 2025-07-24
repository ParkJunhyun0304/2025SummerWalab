package org.leehan416.testprojectoj.contest_team.dto;

import lombok.*;
import org.leehan416.testprojectoj.contest_team.domain.ContestTeam;
import org.leehan416.testprojectoj.user.domain.User;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContestTeamDetailDTO {
    private Long id;
    private String teamname;
    private List<String> usernames;
    private Long contestId;

    public static ContestTeamDetailDTO from(final ContestTeam contestTeam) {
        return ContestTeamDetailDTO.builder()
                .id(contestTeam.getId())
                .teamname(contestTeam.getTeamname())
                .usernames(contestTeam.getMembers().stream().map(User::getUsername).toList())
                .contestId(contestTeam.getContest().getId())
                .build();
    }
}
