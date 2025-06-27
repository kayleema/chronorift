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

data class VacationWithUserInfo(
    val id: Long?,
    val employeeId: String,
    val employeeName: String?,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val status: VacationStatus,
    val assignedTo: String?,
    val assignedToName: String?,
    val deletionReason: String?
)

@RestController
@RequestMapping("/api/vacation")
class VacationController(
    private val vacationRepository: VacationRepository,
    private val userRepository: UserRepository
) {

    @PostMapping
    fun createVacation(@RequestBody request: VacationRequest, authentication: org.springframework.security.core.Authentication?): ResponseEntity<Vacation> {
        val employeeId = authentication?.name ?: "test-employee" // Fallback for testing
        val vacation = Vacation(
            employeeId = employeeId,
            startDate = request.startDate,
            endDate = request.endDate,
            status = VacationStatus.PENDING,
            assignedTo = request.assignedTo
        )
        val savedVacation = vacationRepository.save(vacation)
        return ResponseEntity.ok(savedVacation)
    }

    @GetMapping
    fun getVacationsForCurrentUser(authentication: org.springframework.security.core.Authentication?): List<Vacation> {
        val employeeId = authentication?.name ?: "test-employee" // Fallback for testing
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

    @PostMapping("/{id}/request-deletion")
    fun requestDeletion(
        @PathVariable id: Long, 
        @RequestBody request: DeletionRequest,
        authentication: org.springframework.security.core.Authentication?
    ): ResponseEntity<Vacation> {
        val employeeId = authentication?.name ?: "test-employee"
        
        val vacation = vacationRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        // Verify the user owns this vacation
        if (vacation.employeeId != employeeId) {
            return ResponseEntity.status(403).build()
        }
        
        // Only approved vacations can request deletion
        if (vacation.status != VacationStatus.APPROVED) {
            return ResponseEntity.badRequest().build()
        }
        
        val updatedVacation = vacation.copy(
            status = VacationStatus.PENDING_DELETION,
            deletionReason = request.reason
        )
        
        val savedVacation = vacationRepository.save(updatedVacation)
        return ResponseEntity.ok(savedVacation)
    }

    @PostMapping("/{id}/approve")
    fun approveVacation(
        @PathVariable id: Long,
        authentication: org.springframework.security.core.Authentication?
    ): ResponseEntity<Vacation> {
        val vacation = vacationRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        // Only pending requests can be approved
        if (vacation.status != VacationStatus.PENDING) {
            return ResponseEntity.badRequest().build()
        }
        
        val updatedVacation = vacation.copy(status = VacationStatus.APPROVED)
        val savedVacation = vacationRepository.save(updatedVacation)
        return ResponseEntity.ok(savedVacation)
    }

    @PostMapping("/{id}/reject")
    fun rejectVacation(
        @PathVariable id: Long,
        authentication: org.springframework.security.core.Authentication?
    ): ResponseEntity<Vacation> {
        val vacation = vacationRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        // Only pending requests can be rejected
        if (vacation.status != VacationStatus.PENDING) {
            return ResponseEntity.badRequest().build()
        }
        
        val updatedVacation = vacation.copy(status = VacationStatus.REJECTED)
        val savedVacation = vacationRepository.save(updatedVacation)
        return ResponseEntity.ok(savedVacation)
    }

    @PostMapping("/{id}/approve-deletion")
    fun approveDeletion(
        @PathVariable id: Long,
        authentication: org.springframework.security.core.Authentication?
    ): ResponseEntity<Vacation> {
        val vacation = vacationRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        // Only pending deletion requests can be approved
        if (vacation.status != VacationStatus.PENDING_DELETION) {
            return ResponseEntity.badRequest().build()
        }
        
        val updatedVacation = vacation.copy(status = VacationStatus.DELETED)
        val savedVacation = vacationRepository.save(updatedVacation)
        return ResponseEntity.ok(savedVacation)
    }

    @PostMapping("/{id}/reject-deletion")
    fun rejectDeletion(
        @PathVariable id: Long,
        authentication: org.springframework.security.core.Authentication?
    ): ResponseEntity<Vacation> {
        val vacation = vacationRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        
        // Only pending deletion requests can be rejected
        if (vacation.status != VacationStatus.PENDING_DELETION) {
            return ResponseEntity.badRequest().build()
        }
        
        val updatedVacation = vacation.copy(status = VacationStatus.DELETION_REJECTED)
        val savedVacation = vacationRepository.save(updatedVacation)
        return ResponseEntity.ok(savedVacation)
    }

    @GetMapping("/pending-approvals")
    fun getPendingApprovals(
        authentication: org.springframework.security.core.Authentication?
    ): List<VacationWithUserInfo> {
        // For now, return all pending requests and pending deletions
        // In a real app, you'd filter by role/permissions
        val pendingVacations = vacationRepository.findAll().filter { 
            it.status == VacationStatus.PENDING || it.status == VacationStatus.PENDING_DELETION 
        }
        
        return pendingVacations.map { vacation ->
            val employeeName = userRepository.findById(vacation.employeeId).orElse(null)?.name
            val assignedToName = vacation.assignedTo?.let { userRepository.findById(it).orElse(null)?.name }
            
            VacationWithUserInfo(
                id = vacation.id,
                employeeId = vacation.employeeId,
                employeeName = employeeName,
                startDate = vacation.startDate,
                endDate = vacation.endDate,
                status = vacation.status,
                assignedTo = vacation.assignedTo,
                assignedToName = assignedToName,
                deletionReason = vacation.deletionReason
            )
        }
    }
}
