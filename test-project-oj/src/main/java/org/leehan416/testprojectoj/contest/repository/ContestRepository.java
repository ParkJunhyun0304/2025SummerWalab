package org.leehan416.testprojectoj.contest.repository;

import org.leehan416.testprojectoj.contest.domain.Contest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContestRepository extends JpaRepository<Contest, Long> {
}
