package org.leehan416.testprojectoj.contest_team.repository;

import org.leehan416.testprojectoj.contest_team.domain.ContestTeam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContestTeamRepository extends JpaRepository<ContestTeam, Long> {
    boolean existsByTeamname(String teamname);
    List<ContestTeam> findAllByContestIdOrderByTotalScore(Long contestId);
}

