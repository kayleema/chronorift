package com.timeoff.timeoff

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.core.Authentication
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDate
import java.util.*
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles

@ExtendWith(SpringExtension::class)
@WebMvcTest(VacationController::class)
@ActiveProfiles("test")
class VacationControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var vacationRepository: VacationRepository

    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setup() {
        objectMapper = ObjectMapper()
        objectMapper.registerModule(JavaTimeModule())
    }

    @Test
    fun `createVacation should return created vacation`() {
        val vacation = Vacation(employeeId = "test-employee", startDate = LocalDate.of(2024, 7, 1), endDate = LocalDate.of(2024, 7, 5), status = "PENDING")
        `when`(vacationRepository.save(any(Vacation::class.java))).thenReturn(vacation.copy(id = 1L))

        val requestPayload = mapOf(
            "startDate" to "2024-07-01",
            "endDate" to "2024-07-05"
        )

        mockMvc.perform(post("/api/vacation")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestPayload)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.employeeId").value("test-employee"))
            .andExpect(jsonPath("$.startDate").value("2024-07-01"))
            .andExpect(jsonPath("$.endDate").value("2024-07-05"))
            .andExpect(jsonPath("$.status").value("PENDING"))

        verify(vacationRepository).save(argThat { v: Vacation -> 
            v.employeeId == "test-employee" &&
            v.startDate == LocalDate.of(2024, 7, 1) &&
            v.endDate == LocalDate.of(2024, 7, 5) &&
            v.status == "PENDING"
        })
    }

    @Test
    fun `createVacation should always set status to PENDING`() {
        val vacation = Vacation(employeeId = "test-employee", startDate = LocalDate.of(2024, 8, 1), endDate = LocalDate.of(2024, 8, 5), status = "PENDING")
        val expectedVacation = vacation.copy(id = 2L)
        `when`(vacationRepository.save(any(Vacation::class.java))).thenReturn(expectedVacation)

        val requestPayload = mapOf(
            "startDate" to "2024-08-01",
            "endDate" to "2024-08-05"
        )

        mockMvc.perform(post("/api/vacation")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestPayload)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(2L))
            .andExpect(jsonPath("$.employeeId").value("test-employee"))
            .andExpect(jsonPath("$.startDate").value("2024-08-01"))
            .andExpect(jsonPath("$.endDate").value("2024-08-05"))
            .andExpect(jsonPath("$.status").value("PENDING"))

        verify(vacationRepository).save(argThat { v: Vacation -> 
            v.employeeId == "test-employee" &&
            v.startDate == LocalDate.of(2024, 8, 1) &&
            v.endDate == LocalDate.of(2024, 8, 5) &&
            v.status == "PENDING"
        })
    }

    @Test
    fun `getVacationsByEmployeeId should return list of vacations`() {
        val vacation1 = Vacation(id = 1L, employeeId = "emp1", startDate = LocalDate.of(2024, 7, 1), endDate = LocalDate.of(2024, 7, 5), status = "PENDING")
        val vacation2 = Vacation(id = 2L, employeeId = "emp1", startDate = LocalDate.of(2024, 8, 1), endDate = LocalDate.of(2024, 8, 5), status = "APPROVED")
        `when`(vacationRepository.findByEmployeeId("emp1")).thenReturn(listOf(vacation1, vacation2))

        mockMvc.perform(get("/api/vacation/emp1")
            .with(user("test-employee").roles("USER")))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].id").value(1L))
            .andExpect(jsonPath("$[0].employeeId").value("emp1"))
            .andExpect(jsonPath("$[0].startDate").value("2024-07-01"))
            .andExpect(jsonPath("$[0].endDate").value("2024-07-05"))
            .andExpect(jsonPath("$[0].status").value("PENDING"))
            .andExpect(jsonPath("$[1].id").value(2L))
            .andExpect(jsonPath("$[1].employeeId").value("emp1"))
            .andExpect(jsonPath("$[1].startDate").value("2024-08-01"))
            .andExpect(jsonPath("$[1].endDate").value("2024-08-05"))
            .andExpect(jsonPath("$[1].status").value("APPROVED"))
    }

    @Test
    fun `updateVacation should return updated vacation`() {
        val existingVacation = Vacation(id = 1L, employeeId = "emp1", startDate = LocalDate.of(2024, 7, 1), endDate = LocalDate.of(2024, 7, 5), status = "PENDING")
        val updatedVacation = existingVacation.copy(status = "APPROVED")

        `when`(vacationRepository.findById(1L)).thenReturn(Optional.of(existingVacation))
        `when`(vacationRepository.save(any(Vacation::class.java))).thenReturn(updatedVacation)

        mockMvc.perform(put("/api/vacation/1")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updatedVacation)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.employeeId").value("emp1"))
            .andExpect(jsonPath("$.startDate").value("2024-07-01"))
            .andExpect(jsonPath("$.endDate").value("2024-07-05"))
            .andExpect(jsonPath("$.status").value("APPROVED"))
    }

    @Test
    fun `deleteVacation should return no content`() {
        doNothing().`when`(vacationRepository).deleteById(1L)

        mockMvc.perform(delete("/api/vacation/1")
            .with(user("test-employee").roles("USER"))
            .with(csrf()))
            .andExpect(status().isNoContent)
    }
}
