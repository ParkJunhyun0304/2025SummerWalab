package org.leehan416.testprojectoj.contest_team.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.leehan416.testprojectoj.contest_team.dto.ContestTeamCreateDTO;
import org.leehan416.testprojectoj.contest_team.dto.ContestTeamDetailDTO;
import org.leehan416.testprojectoj.contest_team.serivce.ContestTeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contest/team")
public class ContestTeamController {
    private final ContestTeamService contestTeamService;


    @GetMapping("/exists")
    public ResponseEntity<Boolean> existsByTeamname(@RequestParam final String teamname) {
        return ResponseEntity.ok(contestTeamService.existsByTeamname(teamname));
    }

    @PostMapping("")
    public ResponseEntity<Void> create(@RequestBody final ContestTeamCreateDTO dto) {
        contestTeamService.create(dto);
        return ResponseEntity.ok().build();
    }

//    @PutMapping("/{teamId}")
//    public ResponseEntity<Void> update(@PathVariable Long teamId,
//                                       @RequestBody ContestTeamUpdateDTO dto) {
//        contestTeamService.update(teamId, dto);
//        return ResponseEntity.ok().build();
//    }

    @GetMapping("/{teamId}")
    public ResponseEntity<ContestTeamDetailDTO> getById(@PathVariable final Long teamId) {
        return ResponseEntity.ok(contestTeamService.getById(teamId));
    }

    @GetMapping("")
    public ResponseEntity<List<ContestTeamDetailDTO>> getAll() {
        return ResponseEntity.ok(contestTeamService.getAll());
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteById(@PathVariable final Long teamId) {
        contestTeamService.deleteById(teamId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<Void> addMembers(@PathVariable final Long teamId,
                                           @RequestBody List<Long> memberIds) {
        contestTeamService.addMembers(teamId, memberIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{teamId}/members")
    public ResponseEntity<Void> removeMembers(@PathVariable final Long teamId,
                                              @RequestBody List<Long> memberIds) {
        contestTeamService.removeMembers(teamId, memberIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{teamId}/problems/{problemId}")
    public ResponseEntity<Void> addSolvedProblem(@PathVariable final Long teamId,
                                                 @PathVariable final Long problemId) {
        contestTeamService.addSolvedProblem(teamId, problemId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{teamId}/problems")
    public ResponseEntity<List<Long>> getSolvedProblemsByTeam(@PathVariable final Long teamId) {
        return ResponseEntity.ok(contestTeamService.getSolvedProblemsByTeam(teamId));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<ContestTeamDetailDTO>> getRankingByContest(@RequestParam final Long contestId) {
        return ResponseEntity.ok(contestTeamService.getRankingByContest(contestId));
    }
}
