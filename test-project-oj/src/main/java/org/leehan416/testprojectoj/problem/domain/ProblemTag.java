package org.leehan416.testprojectoj.problem.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "problem_tag")
public class ProblemTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Django가 PK를 별도 지정하지 않으면 id 자동 생성

    @Column(columnDefinition = "TEXT")
    private String name;

    // 게터/세터 생략
}