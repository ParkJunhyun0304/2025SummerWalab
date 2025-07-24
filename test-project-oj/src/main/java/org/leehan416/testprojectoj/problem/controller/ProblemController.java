package org.leehan416.testprojectoj.problem.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.leehan416.testprojectoj.problem.domain.Problem;
import org.leehan416.testprojectoj.problem.dto.ProblemDetailDTO;
import org.leehan416.testprojectoj.problem.repository.ProblemRepository;
import org.leehan416.testprojectoj.problem.service.ProblemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/problem")
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping("")
    public ResponseEntity<List<ProblemDetailDTO>> getAll() {
        return ResponseEntity.ok(problemService.getAllProblem());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemDetailDTO> getById(@PathVariable final Long id) {
        final ProblemDetailDTO problemDetailDTO = problemService.getProblemById(id);
        if (problemDetailDTO == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(problemDetailDTO);
    }

}
