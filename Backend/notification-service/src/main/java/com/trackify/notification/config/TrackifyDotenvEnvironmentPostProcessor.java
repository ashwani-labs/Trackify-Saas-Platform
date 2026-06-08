package com.trackify.notification.config;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Loads the repo-root {@code .env} by walking up from {@code user.dir}, so SMTP works regardless of
 * IntelliJ/Maven working directory (repo root, {@code Backend}, or {@code notification-service}).
 */
public class TrackifyDotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

  private static final Logger LOGGER =
      Logger.getLogger(TrackifyDotenvEnvironmentPostProcessor.class.getName());

  private static final String ENV_FILE = ".env";
  private static final String PROPERTY_SOURCE_NAME = "trackifyDotenv";

  @Override
  public void postProcessEnvironment(
      ConfigurableEnvironment environment, SpringApplication application) {
    Path envFile = findEnvFile(Path.of(System.getProperty("user.dir")));
    if (envFile == null) {
      return;
    }

    Properties properties = new Properties();
    try (var reader =
        new InputStreamReader(Files.newInputStream(envFile), StandardCharsets.UTF_8)) {
      properties.load(reader);
    } catch (IOException e) {
      throw new IllegalStateException("Failed to load " + envFile, e);
    }

    Map<String, Object> source = new LinkedHashMap<>();
    properties.forEach((key, value) -> source.put(key.toString(), value.toString()));
    if (source.isEmpty()) {
      return;
    }

    environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, source));

    boolean mailConfigured =
        source.containsKey("MAIL_USERNAME") && source.containsKey("MAIL_PASSWORD");
    LOGGER.info(
        () ->
            "Loaded "
                + envFile
                + " ("
                + source.size()
                + " entries, SMTP credentials present: "
                + mailConfigured
                + ")");
  }

  private static Path findEnvFile(Path start) {
    Path current = start.toAbsolutePath().normalize();
    for (int depth = 0; depth < 6 && current != null; depth++) {
      Path candidate = current.resolve(ENV_FILE);
      if (Files.isRegularFile(candidate)) {
        return candidate;
      }
      current = current.getParent();
    }
    return null;
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }
}
