package com.trackify.common.config;

import com.trackify.common.security.JwtSecretSupport;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Loads repo-root {@code .env} and publishes {@code jwt.secret} with highest precedence so a short
 * {@code JWT_SECRET} in the IDE does not override the repo {@code .env} or the local dev default.
 */
public class TrackifyDotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

  private static final Logger LOGGER =
      Logger.getLogger(TrackifyDotenvEnvironmentPostProcessor.class.getName());

  private static final String ENV_FILE = ".env";
  private static final String PROPERTY_SOURCE_NAME = "trackifyDotenv";
  private static final String JWT_SECRET_KEY = "JWT_SECRET";

  @Override
  public void postProcessEnvironment(
      ConfigurableEnvironment environment, SpringApplication application) {
    if (environment.getPropertySources().contains(PROPERTY_SOURCE_NAME)) {
      return;
    }

    Map<String, Object> source = new LinkedHashMap<>();
    Path envFile = findEnvFile(Path.of(System.getProperty("user.dir")));
    if (envFile != null) {
      Properties properties = new Properties();
      try (var reader =
          new InputStreamReader(Files.newInputStream(envFile), StandardCharsets.UTF_8)) {
        properties.load(reader);
      } catch (IOException e) {
        throw new IllegalStateException("Failed to load " + envFile, e);
      }
      properties.forEach((key, value) -> source.put(key.toString(), value.toString()));
      if (LOGGER.isLoggable(Level.INFO)) {
        LOGGER.info(
            "Loaded "
                + envFile
                + " ("
                + source.size()
                + " entries, "
                + JWT_SECRET_KEY
                + " present: "
                + source.containsKey(JWT_SECRET_KEY)
                + ")");
      }
    }

    String jwtSecret = resolveJwtSecret(environment, source);
    source.put(JWT_SECRET_KEY, jwtSecret);
    source.put("jwt.secret", jwtSecret);

    environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, source));
  }

  private static String resolveJwtSecret(
      ConfigurableEnvironment environment, Map<String, Object> dotenv) {
    Object fromDotenv = dotenv.get(JWT_SECRET_KEY);
    if (fromDotenv != null && JwtSecretSupport.isStrongEnough(fromDotenv.toString())) {
      return fromDotenv.toString();
    }

    String fromOsEnv = environment.getProperty(JWT_SECRET_KEY);
    if (JwtSecretSupport.isStrongEnough(fromOsEnv)) {
      return fromOsEnv;
    }

    if (fromOsEnv != null && !fromOsEnv.isBlank() && LOGGER.isLoggable(Level.WARNING)) {
      LOGGER.warning(
          JWT_SECRET_KEY
              + " is too short ("
              + fromOsEnv.length()
              + " characters / "
              + (JwtSecretSupport.secretKeyByteLength(fromOsEnv) * 8)
              + " bits). Using local dev default. Remove "
              + JWT_SECRET_KEY
              + " from your IDE run configuration.");
    }

    return JwtSecretSupport.LOCAL_DEV_SECRET;
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
