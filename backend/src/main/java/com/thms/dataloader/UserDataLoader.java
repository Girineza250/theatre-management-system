package com.thms.dataloader;

import com.thms.model.User;
import com.thms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1) // Runs first
@RequiredArgsConstructor
@Slf4j
public class UserDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("================================================================================");
        log.info("🚀 STARTING USER DATA INITIALIZATION");
        log.info("================================================================================");

        createAdminUser();
        createTestUsers();

        // Verify admin exists
        userRepository.findByUsername("admin").ifPresentOrElse(
                user -> log.info("✅ Admin user verified in database: {}", user.getUsername()),
                () -> log.error("❌ CRITICAL: Admin user not found in database after creation!")
        );

        log.info("================================================================================");
        log.info("✅ USER DATA INITIALIZATION COMPLETE");
        log.info("================================================================================");
    }

    private void createAdminUser() {
        if (userRepository.existsByUsername("admin")) {
            log.info("ℹ️  Admin user already exists - skipping creation");
            return;
        }

        try {
            String rawPassword = "admin123";
            String encodedPassword = passwordEncoder.encode(rawPassword);

            log.info("🔐 Encoding admin password...");
            log.debug("   Raw password: {}", rawPassword);
            log.debug("   Encoded password starts with: {}...", encodedPassword.substring(0, 10));

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@theatre.com");
            admin.setPassword(encodedPassword);
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setPhoneNumber("+250788000000");
            admin.setRole(User.Role.ROLE_ADMIN);

            User savedAdmin = userRepository.save(admin);

            log.info("================================================================================");
            log.info("✅ ADMIN USER CREATED SUCCESSFULLY!");
            log.info("================================================================================");
            log.info("   Username:     admin");
            log.info("   Password:     admin123");
            log.info("   Role:         {}", savedAdmin.getRole());
            log.info("   Email:        {}", savedAdmin.getEmail());
            log.info("   User ID:      {}", savedAdmin.getId());
            log.info("================================================================================");
            log.info("🔗 Login URL: http://localhost:8084/auth/login");
            log.info("================================================================================");

        } catch (Exception e) {
            log.error("❌ FAILED TO CREATE ADMIN USER!", e);
            throw new RuntimeException("Failed to create admin user", e);
        }
    }

    private void createTestUsers() {
        // Create test regular user
        if (!userRepository.existsByUsername("user")) {
            try {
                User user = new User();
                user.setUsername("user");
                user.setEmail("user@theatre.com");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setFirstName("John");
                user.setLastName("Doe");
                user.setPhoneNumber("+250788111111");
                user.setRole(User.Role.ROLE_USER);

                userRepository.save(user);
                log.info("✅ Test USER created (username: user, password: user123)");
            } catch (Exception e) {
                log.error("❌ Failed to create test user", e);
            }
        }

        // Create test manager user
        if (!userRepository.existsByUsername("manager")) {
            try {
                User manager = new User();
                manager.setUsername("manager");
                manager.setEmail("manager@theatre.com");
                manager.setPassword(passwordEncoder.encode("manager123"));
                manager.setFirstName("Jane");
                manager.setLastName("Smith");
                manager.setPhoneNumber("+250788222222");
                manager.setRole(User.Role.ROLE_MANAGER);

                userRepository.save(manager);
                log.info("✅ Test MANAGER created (username: manager, password: manager123)");
            } catch (Exception e) {
                log.error("❌ Failed to create manager user", e);
            }
        }
    }
}