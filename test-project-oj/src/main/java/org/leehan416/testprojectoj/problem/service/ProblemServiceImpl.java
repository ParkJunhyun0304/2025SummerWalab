package org.leehan416.testprojectoj.problem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.leehan416.testprojectoj.problem.dto.ProblemDetailDTO;
import org.leehan416.testprojectoj.problem.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProblemServiceImpl implements ProblemService {
    private final ProblemRepository problemRepository;

    @Override
    public List<ProblemDetailDTO> getAllProblem() {
        return problemRepository.findAll().stream().map(ProblemDetailDTO::from).toList();
    }

    @Override
    public ProblemDetailDTO getProblemById(final Long id) {
        return ProblemDetailDTO.from(problemRepository.findById(id).orElse(null));
    }
}
