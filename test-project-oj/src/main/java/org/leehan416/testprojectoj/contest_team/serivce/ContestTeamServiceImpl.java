package org.leehan416.testprojectoj.contest_team.serivce;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.leehan416.testprojectoj.contest.domain.Contest;
import org.leehan416.testprojectoj.contest.repository.ContestRepository;
import org.leehan416.testprojectoj.contest_team.domain.ContestTeam;
import org.leehan416.testprojectoj.contest_team.domain.ContestTeamFactory;
import org.leehan416.testprojectoj.contest_team.dto.ContestTeamCreateDTO;
import org.leehan416.testprojectoj.contest_team.dto.ContestTeamDetailDTO;
import org.leehan416.testprojectoj.contest_team.dto.ContestTeamUpdateDTO;
import org.leehan416.testprojectoj.contest_team.repository.ContestTeamRepository;
import org.leehan416.testprojectoj.problem.domain.Problem;
import org.leehan416.testprojectoj.problem.repository.ProblemRepository;
import org.leehan416.testprojectoj.user.domain.User;
import org.leehan416.testprojectoj.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContestTeamServiceImpl implements ContestTeamService {
    private final ContestTeamRepository contestTeamRepository;
    private final UserRepository userRepository;
    private final ContestRepository contestRepository;
    private final ProblemRepository problemRepository;
    // TODO : Custom Exception 처리 필요

    @Override
    @Transactional(readOnly = true)
    public boolean existsByTeamname(final String teamname) {
        return contestTeamRepository.existsByTeamname(teamname);
    }

    @Override
    @Transactional
    public void create(final ContestTeamCreateDTO contestTeamCreateDTO) {
        final List<User> members = userRepository
                .findAllById(contestTeamCreateDTO
                        .getMemberIds());
        if (members.isEmpty()) {
            throw new RuntimeException();
        }
        final Contest contest = contestRepository
                .findById(contestTeamCreateDTO.getContestId())
                .orElseThrow(RuntimeException::new);
        final ContestTeam contestTeam = ContestTeamFactory
                .create(contestTeamCreateDTO.getTeamname(), members, contest);
        // TODO : 필요시 저장하여 return
        contestTeamRepository.save(contestTeam);
    }

    @Override
    @Transactional
    public void update(final Long teamId, final ContestTeamUpdateDTO contestTeamUpdateDTO) {

    }

    @Override
    @Transactional(readOnly = true)
    public ContestTeamDetailDTO getById(final Long id) {
        return ContestTeamDetailDTO
                .from(contestTeamRepository
                        .findById(id)
                        .orElseThrow(RuntimeException::new));

    }

    @Override
    @Transactional(readOnly = true)
    public List<ContestTeamDetailDTO> getAll() {
        return contestTeamRepository
                .findAll()
                .stream()
                .map(ContestTeamDetailDTO::from)
                .toList();
    }

    @Override
    @Transactional
    public void deleteById(final Long id) {
        if (!contestTeamRepository.existsById(id)) {
            throw new RuntimeException();
        }
        contestTeamRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void addMembers(final Long contestTeamId, final List<Long> member_ids) {
        final ContestTeam contestTeam = contestTeamRepository
                .findById(contestTeamId)
                .orElseThrow(RuntimeException::new);
        final List<User> members = userRepository
                .findAllById(member_ids);
        if (members.isEmpty()) {
            throw new RuntimeException();
        }
        contestTeam.getMembers().addAll(members);
    }

    @Override
    @Transactional
    public void removeMembers(final Long contestTeamId, final List<Long> member_ids) {
        final ContestTeam contestTeam = contestTeamRepository
                .findById(contestTeamId)
                .orElseThrow(RuntimeException::new);
        final List<User> members = userRepository
                .findAllById(member_ids);
        if (members.isEmpty()) {
            throw new RuntimeException();
        }
        contestTeam.getMembers().removeAll(members);
    }

    //
    @Override
    @Transactional
    public void addSolvedProblem(final Long contestTeamId, final Long problemId) {
        // TODO : DB 검사 로직 필요
        final Problem problem = problemRepository
                .findById(problemId)
                .orElseThrow(RuntimeException::new);
        final ContestTeam contestTeam = contestTeamRepository
                .findById(contestTeamId)
                .orElseThrow(RuntimeException::new);
        contestTeam
                .getSolvedProblem()
                .add(problem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getSolvedProblemsByTeam(final Long contestTeamId) {
        final ContestTeam contestTeam = contestTeamRepository
                .findById(contestTeamId)
                .orElseThrow(RuntimeException::new);
        return contestTeam.getSolvedProblem()
                .stream()
                .map(Problem::getId)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContestTeamDetailDTO> getRankingByContest(final Long contestId) {
        return contestTeamRepository
                .findAllByContestIdOrderByTotalScore(contestId)
                .stream()
                .map(ContestTeamDetailDTO::from).toList();
    }
}
