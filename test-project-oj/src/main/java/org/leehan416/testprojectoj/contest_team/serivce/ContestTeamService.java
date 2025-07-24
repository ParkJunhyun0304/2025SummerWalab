package org.leehan416.testprojectoj.contest_team.serivce;

import org.leehan416.testprojectoj.contest_team.dto.ContestTeamCreateDTO;
import org.leehan416.testprojectoj.contest_team.dto.ContestTeamDetailDTO;
import org.leehan416.testprojectoj.contest_team.dto.ContestTeamUpdateDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ContestTeamService {
    boolean existsByTeamname(String teamname);

    void create(ContestTeamCreateDTO contestTeamCreateDTO);

    void update(Long teamId, ContestTeamUpdateDTO contestTeamUpdateDTO);

    ContestTeamDetailDTO getById(Long id);

    List<ContestTeamDetailDTO> getAll();

    void deleteById(Long id);

    void addMembers(Long contestTeamId, List<Long> member_ids);

    void removeMembers(Long contestTeamId, List<Long> member_ids);

    void addSolvedProblem(Long contestTeamId, Long problemId);

    List<Long> getSolvedProblemsByTeam(Long contestTeamId);

    List<ContestTeamDetailDTO> getRankingByContest(Long contestId);
}