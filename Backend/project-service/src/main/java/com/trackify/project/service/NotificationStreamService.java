package com.trackify.project.service;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Service
public class NotificationStreamService {

  private final Map<Long, Set<SseEmitter>> emittersByUser = new ConcurrentHashMap<>();

  public SseEmitter subscribe(Long userId) {
    SseEmitter emitter = new SseEmitter(0L);
    emittersByUser.computeIfAbsent(userId, id -> new CopyOnWriteArraySet<>()).add(emitter);

    emitter.onCompletion(() -> removeEmitter(userId, emitter));
    emitter.onTimeout(() -> removeEmitter(userId, emitter));
    emitter.onError(ex -> removeEmitter(userId, emitter));

    try {
      emitter.send(SseEmitter.event().name("connected").data("ok"));
    } catch (IOException e) {
      removeEmitter(userId, emitter);
    }

    return emitter;
  }

  public void publishUnreadCount(Long userId, long unreadCount) {
    Set<SseEmitter> emitters = emittersByUser.get(userId);
    if (emitters == null || emitters.isEmpty()) {
      return;
    }

    for (SseEmitter emitter : emitters) {
      try {
        emitter.send(SseEmitter.event().name("unread-count").data(unreadCount));
      } catch (IOException e) {
        removeEmitter(userId, emitter);
      }
    }
  }

  private void removeEmitter(Long userId, SseEmitter emitter) {
    Set<SseEmitter> emitters = emittersByUser.get(userId);
    if (emitters != null) {
      emitters.remove(emitter);
      if (emitters.isEmpty()) {
        emittersByUser.remove(userId);
      }
    }
    emitter.complete();
  }
}
