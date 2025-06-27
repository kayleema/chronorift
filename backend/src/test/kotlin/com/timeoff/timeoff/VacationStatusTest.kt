package com.timeoff.timeoff

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.Assertions.*

class VacationStatusTest {

    @Test
    fun `VacationStatus should contain all required statuses`() {
        val statuses = VacationStatus.values()
        
        assertTrue(statuses.contains(VacationStatus.PENDING))
        assertTrue(statuses.contains(VacationStatus.APPROVED))
        assertTrue(statuses.contains(VacationStatus.REJECTED))
        assertTrue(statuses.contains(VacationStatus.PENDING_DELETION))
        assertTrue(statuses.contains(VacationStatus.DELETION_REJECTED))
        assertTrue(statuses.contains(VacationStatus.DELETED))
    }

    @Test
    fun `should validate status transitions for PENDING vacation`() {
        assertTrue(VacationStatus.canTransitionTo(VacationStatus.PENDING, VacationStatus.APPROVED))
        assertTrue(VacationStatus.canTransitionTo(VacationStatus.PENDING, VacationStatus.REJECTED))
        assertTrue(VacationStatus.canTransitionTo(VacationStatus.PENDING, VacationStatus.DELETED))
        
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.PENDING, VacationStatus.PENDING_DELETION))
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.PENDING, VacationStatus.DELETION_REJECTED))
    }

    @Test
    fun `should validate status transitions for APPROVED vacation`() {
        assertTrue(VacationStatus.canTransitionTo(VacationStatus.APPROVED, VacationStatus.PENDING_DELETION))
        
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.APPROVED, VacationStatus.PENDING))
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.APPROVED, VacationStatus.REJECTED))
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.APPROVED, VacationStatus.DELETED))
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.APPROVED, VacationStatus.DELETION_REJECTED))
    }

    @Test
    fun `should validate status transitions for PENDING_DELETION vacation`() {
        assertTrue(VacationStatus.canTransitionTo(VacationStatus.PENDING_DELETION, VacationStatus.DELETED))
        assertTrue(VacationStatus.canTransitionTo(VacationStatus.PENDING_DELETION, VacationStatus.DELETION_REJECTED))
        
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.PENDING_DELETION, VacationStatus.PENDING))
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.PENDING_DELETION, VacationStatus.APPROVED))
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.PENDING_DELETION, VacationStatus.REJECTED))
    }

    @Test
    fun `should validate status transitions for DELETION_REJECTED vacation`() {
        assertTrue(VacationStatus.canTransitionTo(VacationStatus.DELETION_REJECTED, VacationStatus.PENDING_DELETION))
        
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.DELETION_REJECTED, VacationStatus.PENDING))
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.DELETION_REJECTED, VacationStatus.APPROVED))
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.DELETION_REJECTED, VacationStatus.REJECTED))
        assertFalse(VacationStatus.canTransitionTo(VacationStatus.DELETION_REJECTED, VacationStatus.DELETED))
    }

    @Test
    fun `should not allow transitions from DELETED or REJECTED statuses`() {
        VacationStatus.values().forEach { targetStatus ->
            assertFalse(VacationStatus.canTransitionTo(VacationStatus.DELETED, targetStatus))
            if (targetStatus != VacationStatus.DELETED) {
                assertFalse(VacationStatus.canTransitionTo(VacationStatus.REJECTED, targetStatus))
            }
        }
    }

    @Test
    fun `should identify modifiable statuses correctly`() {
        assertTrue(VacationStatus.PENDING.isModifiable())
        
        assertFalse(VacationStatus.APPROVED.isModifiable())
        assertFalse(VacationStatus.REJECTED.isModifiable())
        assertFalse(VacationStatus.PENDING_DELETION.isModifiable())
        assertFalse(VacationStatus.DELETION_REJECTED.isModifiable())
        assertFalse(VacationStatus.DELETED.isModifiable())
    }

    @Test
    fun `should identify deletable statuses correctly`() {
        assertTrue(VacationStatus.PENDING.isDeletable())
        assertTrue(VacationStatus.APPROVED.isDeletable())
        
        assertFalse(VacationStatus.REJECTED.isDeletable())
        assertFalse(VacationStatus.PENDING_DELETION.isDeletable())
        assertFalse(VacationStatus.DELETION_REJECTED.isDeletable())
        assertFalse(VacationStatus.DELETED.isDeletable())
    }
}