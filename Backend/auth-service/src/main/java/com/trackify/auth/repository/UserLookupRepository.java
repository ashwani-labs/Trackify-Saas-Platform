package com.trackify.auth.repository;

import com.trackify.auth.entity.UserLookup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserLookupRepository extends JpaRepository<UserLookup, Long> {
  List<UserLookup> findAllByEmail(String email);

  Optional<UserLookup> findByEmail(String email);
}
