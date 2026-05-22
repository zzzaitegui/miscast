package com.miscast.backend.repository;

import com.miscast.backend.entity.AppUser;
import com.miscast.backend.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByUserOrderByCompletedAtDesc(AppUser user);

    @Query("SELECT MAX(m.swapsUsed) FROM Match m WHERE m.user = :user AND m.mode = 'faceoff'")
    Optional<Integer> findMaxFaceoffScore(@Param("user") AppUser user);
}
