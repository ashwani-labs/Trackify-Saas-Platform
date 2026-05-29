package com.trackify.project.repository;

import com.trackify.project.entity.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

  Page<Notification> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

  Page<Notification> findAllByUserIdAndReadAtIsNullOrderByCreatedAtDesc(
      Long userId, Pageable pageable);

  long countByUserIdAndReadAtIsNull(Long userId);

  List<Notification> findAllByUserIdAndReadAtIsNull(Long userId);

  Optional<Notification> findByIdAndUserId(Long id, Long userId);
}
