package org.leehan416.testprojectoj.problem.repository;

import org.leehan416.testprojectoj.problem.domain.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
//
//    // 모든 문제 조회
//    @Query(value = "SELECT * FROM problem", nativeQuery = true)
//    List<Problem> findAllProblems();
//
//    // ID로 문제 조회
//    @Query(value = "SELECT * FROM problem WHERE id = :id", nativeQuery = true)
//    Optional<Problem> findProblemById(@Param("id") Long id);
//
//    // 제목으로 문제 검색
//    @Query(value = "SELECT * FROM problem WHERE title ILIKE %:title%", nativeQuery = true)
//    List<Problem> findByTitleContaining(@Param("title") String title);
//
//    // 난이도별 문제 조회
//    @Query(value = "SELECT * FROM problem WHERE difficulty = :difficulty", nativeQuery = true)
//    List<Problem> findByDifficulty(@Param("difficulty") String difficulty);
//
//    // 활성화된 문제들만 조회
//    @Query(value = "SELECT * FROM problem WHERE visible = true", nativeQuery = true)
//    List<Problem> findVisibleProblems();
//
//    // 태그로 문제 검색 (JSONB 활용)
//    @Query(value = "SELECT * FROM problem WHERE tags @> :tag::jsonb", nativeQuery = true)
//    List<Problem> findByTag(@Param("tag") String tag);
//
//    // 시간 제한 범위로 문제 조회
//    @Query(value = "SELECT * FROM problem WHERE time_limit <= :timeLimit", nativeQuery = true)
//    List<Problem> findByTimeLimitLessThan(@Param("timeLimit") Integer timeLimit);
//
//    // 메모리 제한 범위로 문제 조회
//    @Query(value = "SELECT * FROM problem WHERE memory_limit <= :memoryLimit", nativeQuery = true)
//    List<Problem> findByMemoryLimitLessThan(@Param("memoryLimit") Integer memoryLimit);
//
//    // 생성일 기준 최신 문제들
//    @Query(value = "SELECT * FROM problem ORDER BY create_time DESC LIMIT :limit", nativeQuery = true)
//    List<Problem> findRecentProblems(@Param("limit") Integer limit);
//
//    // 특정 작성자의 문제들
//    @Query(value = "SELECT * FROM problem WHERE created_by_id = :authorId", nativeQuery = true)
//    List<Problem> findByAuthor(@Param("authorId") Long authorId);
//
//    // 문제 통계 - 총 개수
//    @Query(value = "SELECT COUNT(*) FROM problem WHERE visible = true", nativeQuery = true)
//    Long countVisibleProblems();
//
//    // 난이도별 문제 개수
//    @Query(value = "SELECT difficulty, COUNT(*) FROM problem WHERE visible = true GROUP BY difficulty", nativeQuery = true)
//    List<Object[]> countProblemsByDifficulty();
}