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

    @MockBean
    private lateinit var userRepository: UserRepository

    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setup() {
        objectMapper = ObjectMapper()
        objectMapper.registerModule(JavaTimeModule())
    }

    @Test
    fun `createVacation should return created vacation`() {
        val vacation = Vacation(employeeId = "test-employee", startDate = LocalDate.of(2024, 7, 1), endDate = LocalDate.of(2024, 7, 5), status = VacationStatus.PENDING)
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
            v.status == VacationStatus.PENDING
        })
    }

    @Test
    fun `createVacation should always set status to PENDING`() {
        val vacation = Vacation(employeeId = "test-employee", startDate = LocalDate.of(2024, 8, 1), endDate = LocalDate.of(2024, 8, 5), status = VacationStatus.PENDING)
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
            v.status == VacationStatus.PENDING
        })
    }

    @Test
    fun `getVacationsForCurrentUser should return list of vacations`() {
        val vacation1 = Vacation(id = 1L, employeeId = "test-employee", startDate = LocalDate.of(2024, 7, 1), endDate = LocalDate.of(2024, 7, 5), status = VacationStatus.PENDING)
        val vacation2 = Vacation(id = 2L, employeeId = "test-employee", startDate = LocalDate.of(2024, 8, 1), endDate = LocalDate.of(2024, 8, 5), status = VacationStatus.APPROVED)
        `when`(vacationRepository.findByEmployeeId("test-employee")).thenReturn(listOf(vacation1, vacation2))

        mockMvc.perform(get("/api/vacation")
            .with(user("test-employee").roles("USER")))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].id").value(1L))
            .andExpect(jsonPath("$[0].employeeId").value("test-employee"))
            .andExpect(jsonPath("$[0].startDate").value("2024-07-01"))
            .andExpect(jsonPath("$[0].endDate").value("2024-07-05"))
            .andExpect(jsonPath("$[0].status").value("PENDING"))
            .andExpect(jsonPath("$[1].id").value(2L))
            .andExpect(jsonPath("$[1].employeeId").value("test-employee"))
            .andExpect(jsonPath("$[1].startDate").value("2024-08-01"))
            .andExpect(jsonPath("$[1].endDate").value("2024-08-05"))
            .andExpect(jsonPath("$[1].status").value("APPROVED"))
    }

    @Test
    fun `updateVacation should return updated vacation`() {
        val existingVacation = Vacation(id = 1L, employeeId = "test-employee", startDate = LocalDate.of(2024, 7, 1), endDate = LocalDate.of(2024, 7, 5), status = VacationStatus.PENDING)
        val updatedVacation = existingVacation.copy(status = VacationStatus.APPROVED)

        `when`(vacationRepository.findById(1L)).thenReturn(Optional.of(existingVacation))
        `when`(vacationRepository.save(any(Vacation::class.java))).thenReturn(updatedVacation)

        mockMvc.perform(put("/api/vacation/1")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updatedVacation)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.employeeId").value("test-employee"))
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

    @Test
    fun `createVacation should save assignedTo field when provided`() {
        val vacation = Vacation(employeeId = "test-employee", startDate = LocalDate.of(2024, 9, 1), endDate = LocalDate.of(2024, 9, 5), status = VacationStatus.PENDING, assignedTo = "user1")
        val expectedVacation = vacation.copy(id = 3L)
        `when`(vacationRepository.save(any(Vacation::class.java))).thenReturn(expectedVacation)

        val requestPayload = mapOf(
            "startDate" to "2024-09-01",
            "endDate" to "2024-09-05",
            "assignedTo" to "user1"
        )

        mockMvc.perform(post("/api/vacation")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestPayload)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(3L))
            .andExpect(jsonPath("$.employeeId").value("test-employee"))
            .andExpect(jsonPath("$.startDate").value("2024-09-01"))
            .andExpect(jsonPath("$.endDate").value("2024-09-05"))
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.assignedTo").value("user1"))

        verify(vacationRepository).save(argThat { v: Vacation -> 
            v.employeeId == "test-employee" &&
            v.startDate == LocalDate.of(2024, 9, 1) &&
            v.endDate == LocalDate.of(2024, 9, 5) &&
            v.status == VacationStatus.PENDING &&
            v.assignedTo == "user1"
        })
    }

    @Test
    fun `createVacation should handle null assignedTo field`() {
        val vacation = Vacation(employeeId = "test-employee", startDate = LocalDate.of(2024, 10, 1), endDate = LocalDate.of(2024, 10, 5), status = VacationStatus.PENDING, assignedTo = null)
        val expectedVacation = vacation.copy(id = 4L)
        `when`(vacationRepository.save(any(Vacation::class.java))).thenReturn(expectedVacation)

        val requestPayload = mapOf(
            "startDate" to "2024-10-01",
            "endDate" to "2024-10-05"
        )

        mockMvc.perform(post("/api/vacation")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestPayload)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(4L))
            .andExpect(jsonPath("$.employeeId").value("test-employee"))
            .andExpect(jsonPath("$.startDate").value("2024-10-01"))
            .andExpect(jsonPath("$.endDate").value("2024-10-05"))
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.assignedTo").doesNotExist())

        verify(vacationRepository).save(argThat { v: Vacation -> 
            v.employeeId == "test-employee" &&
            v.startDate == LocalDate.of(2024, 10, 1) &&
            v.endDate == LocalDate.of(2024, 10, 5) &&
            v.status == VacationStatus.PENDING &&
            v.assignedTo == null
        })
    }

    @Test
    fun `requestDeletion should create deletion request for approved vacation`() {
        val existingVacation = Vacation(id = 5L, employeeId = "test-employee", startDate = LocalDate.of(2024, 11, 1), endDate = LocalDate.of(2024, 11, 5), status = VacationStatus.APPROVED, assignedTo = "user1")
        val updatedVacation = existingVacation.copy(status = VacationStatus.PENDING_DELETION)

        `when`(vacationRepository.findById(5L)).thenReturn(Optional.of(existingVacation))
        `when`(vacationRepository.save(any(Vacation::class.java))).thenReturn(updatedVacation)

        val requestPayload = mapOf(
            "reason" to "Family emergency"
        )

        mockMvc.perform(post("/api/vacation/5/request-deletion")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestPayload)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(5L))
            .andExpect(jsonPath("$.status").value("PENDING_DELETION"))

        verify(vacationRepository).save(argThat { v: Vacation -> 
            v.id == 5L &&
            v.status == VacationStatus.PENDING_DELETION
        })
    }

    @Test
    fun `requestDeletion should fail for non-approved vacation`() {
        val existingVacation = Vacation(id = 6L, employeeId = "test-employee", startDate = LocalDate.of(2024, 12, 1), endDate = LocalDate.of(2024, 12, 5), status = VacationStatus.PENDING, assignedTo = "user1")

        `when`(vacationRepository.findById(6L)).thenReturn(Optional.of(existingVacation))

        val requestPayload = mapOf(
            "reason" to "Changed plans"
        )

        mockMvc.perform(post("/api/vacation/6/request-deletion")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestPayload)))
            .andExpect(status().isBadRequest)

        verify(vacationRepository, never()).save(any(Vacation::class.java))
    }

    @Test
    fun `requestDeletion should fail when vacation not found`() {
        `when`(vacationRepository.findById(999L)).thenReturn(Optional.empty())

        val requestPayload = mapOf(
            "reason" to "Test reason"
        )

        mockMvc.perform(post("/api/vacation/999/request-deletion")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestPayload)))
            .andExpect(status().isNotFound)

        verify(vacationRepository, never()).save(any(Vacation::class.java))
    }

    @Test
    fun `requestDeletion should fail when user is not vacation owner`() {
        val existingVacation = Vacation(id = 7L, employeeId = "other-employee", startDate = LocalDate.of(2024, 11, 1), endDate = LocalDate.of(2024, 11, 5), status = VacationStatus.APPROVED, assignedTo = "user1")

        `when`(vacationRepository.findById(7L)).thenReturn(Optional.of(existingVacation))

        val requestPayload = mapOf(
            "reason" to "Family emergency"
        )

        mockMvc.perform(post("/api/vacation/7/request-deletion")
            .with(user("test-employee").roles("USER"))
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(requestPayload)))
            .andExpect(status().isForbidden)

        verify(vacationRepository, never()).save(any(Vacation::class.java))
    }
}
