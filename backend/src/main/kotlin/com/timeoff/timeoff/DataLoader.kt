package com.timeoff.timeoff

import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import org.springframework.context.annotation.Profile

@Component
@Profile("!test")
class DataLoader(
    private val userRepository: UserRepository
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        // Only create users if they don't exist
        if (userRepository.count() == 0L) {
            val users = listOf(
                User(id = "user1", name = "John Doe"),
                User(id = "user2", name = "Jane Smith"),
                User(id = "user3", name = "Bob Johnson"),
                User(id = "user4", name = "Alice Wilson"),
                User(id = "user5", name = "Charlie Brown")
            )
            userRepository.saveAll(users)
        }
    }
}