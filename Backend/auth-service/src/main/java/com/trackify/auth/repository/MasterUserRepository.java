package com.trackify.auth.repository;

import com.trackify.auth.entity.MasterUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MasterUserRepository extends JpaRepository<MasterUser, Long> {
    Optional<MasterUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
