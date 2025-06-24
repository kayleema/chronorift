package com.timeoff.timeoff

import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import org.springframework.http.ResponseEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface VacationRepository : JpaRepository<Vacation, Long> {
    fun findByEmployeeId(employeeId: String): List<Vacation>
}

@RestController
@RequestMapping("/api/vacation")
class VacationController(private val vacationRepository: VacationRepository) {

    @PostMapping
    fun createVacation(@RequestBody request: VacationRequest, authentication: org.springframework.security.core.Authentication?): ResponseEntity<Vacation> {
        val employeeId = authentication?.name ?: "test-employee" // Fallback for testing
        val vacation = Vacation(
            employeeId = employeeId,
            startDate = request.startDate,
            endDate = request.endDate,
            status = "PENDING"
        )
        val savedVacation = vacationRepository.save(vacation)
        return ResponseEntity.ok(savedVacation)
    }

    @GetMapping("/{employeeId}")
    fun getVacationsByEmployeeId(@PathVariable employeeId: String): List<Vacation> {
        return vacationRepository.findByEmployeeId(employeeId)
    }

    @PutMapping("/{id}")
    fun updateVacation(@PathVariable id: Long, @RequestBody updatedVacation: Vacation): ResponseEntity<Vacation> {
        return vacationRepository.findById(id).map { existingVacation ->
            val newVacation = existingVacation.copy(
                employeeId = updatedVacation.employeeId,
                startDate = updatedVacation.startDate,
                endDate = updatedVacation.endDate,
                status = updatedVacation.status
            )
            ResponseEntity.ok(vacationRepository.save(newVacation))
        }.orElse(ResponseEntity.notFound().build())
    }

    @DeleteMapping("/{id}")
    fun deleteVacation(@PathVariable id: Long): ResponseEntity<Void> {
        vacationRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }
}
