package com.timeoff.timeoff

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.context.ActiveProfiles

@ExtendWith(SpringExtension::class)
@WebMvcTest(UserController::class)
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var userRepository: UserRepository

    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setup() {
        objectMapper = ObjectMapper()
    }

    @Test
    fun `getAllUsers should return list of users`() {
        val users = listOf(
            User(id = "user1", name = "John Doe"),
            User(id = "user2", name = "Jane Smith"),
            User(id = "user3", name = "Bob Johnson")
        )
        `when`(userRepository.findAll()).thenReturn(users)

        mockMvc.perform(get("/api/users")
            .with(user("test-employee").roles("USER")))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(3))
            .andExpect(jsonPath("$[0].id").value("user1"))
            .andExpect(jsonPath("$[0].name").value("John Doe"))
            .andExpect(jsonPath("$[1].id").value("user2"))
            .andExpect(jsonPath("$[1].name").value("Jane Smith"))
            .andExpect(jsonPath("$[2].id").value("user3"))
            .andExpect(jsonPath("$[2].name").value("Bob Johnson"))
    }

    @Test
    fun `getAllUsers should return empty list when no users exist`() {
        `when`(userRepository.findAll()).thenReturn(emptyList())

        mockMvc.perform(get("/api/users")
            .with(user("test-employee").roles("USER")))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }
}