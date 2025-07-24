package org.leehan416.testprojectoj.contest_team.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.leehan416.testprojectoj.contest.domain.Contest;
import org.leehan416.testprojectoj.problem.domain.Problem;
import org.leehan416.testprojectoj.user.domain.User;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ContestTeam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teamname;

    @ManyToMany
    @JoinTable(
            name = "contest_team_member",
            joinColumns = @JoinColumn(name = "contest_team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members;

    @ManyToOne
    @JoinColumn(name = "contest_id")
    private Contest contest;

    private Integer totalScore;

    @ManyToMany
    @JoinTable(
            name = "contest_team_solved_problem",
            joinColumns = @JoinColumn(name = "contest_team_id"),
            inverseJoinColumns = @JoinColumn(name = "problem_id")
    )
    private List<Problem> solvedProblem;


    protected ContestTeam(String teamname, List<User> members, Contest contest) {
        this.teamname = teamname;
        this.members = members;
        this.contest = contest;
        this.totalScore = 0;
        this.solvedProblem = List.of();
    }

}