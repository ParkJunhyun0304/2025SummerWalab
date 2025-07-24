package org.leehan416.testprojectoj.problem.service;

import org.leehan416.testprojectoj.problem.dto.ProblemDetailDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProblemService {
    List<ProblemDetailDTO> getAllProblem();
    ProblemDetailDTO getProblemById(Long id);
}
