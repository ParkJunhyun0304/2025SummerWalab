package org.leehan416.testprojectoj.contest_team.domain;

import org.leehan416.testprojectoj.contest.domain.Contest;
import org.leehan416.testprojectoj.user.domain.User;

import java.util.List;

public class ContestTeamFactory {
    public static ContestTeam create(final String teamname, final List<User> members, final Contest contest ) {
        return new ContestTeam(teamname, members, contest);
    }
}