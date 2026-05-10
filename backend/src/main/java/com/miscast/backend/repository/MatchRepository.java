package com.miscast.backend.repository;

import com.miscast.backend.entity.AppUser;
import com.miscast.backend.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByUserOrderByCompletedAtDesc(AppUser user);
}
