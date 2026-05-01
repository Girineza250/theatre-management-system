package com.thms.controller.api;

import com.thms.dto.ApiResponse;
import com.thms.dto.BookingDTO;
import com.thms.exception.ResourceNotFoundException;
import com.thms.model.Booking;
import com.thms.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Admin Booking Management
 * Used by React admin dashboard
 */
@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminBookingRestController {

    private final BookingService bookingService;

    public AdminBookingRestController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Get all bookings with optional filtering
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getAllBookings(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long theatreId,
            @RequestParam(required = false) String bookingNumber,
            @RequestParam(required = false) Booking.PaymentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {

        List<BookingDTO> bookings;

        try {
            // Apply filters
            if (userId != null) {
                bookings = bookingService.getBookingsByUser(userId);
            } else if (movieId != null) {
                bookings = bookingService.getBookingsByMovie(movieId);
            } else if (theatreId != null) {
                bookings = bookingService.getBookingsByTheatre(theatreId);
            } else if (bookingNumber != null && !bookingNumber.isEmpty()) {
                bookingService.getBookingByNumber(bookingNumber)
                        .ifPresent(booking -> {
                            // Return single booking as list
                        });
                bookings = bookingService.getAllBookings();
            } else if (status != null) {
                bookings = bookingService.getBookingsByStatus(status);
            } else if (fromDate != null && toDate != null) {
                bookings = bookingService.getBookingsByDateRange(fromDate, toDate);
            } else {
                // Default - show all bookings
                bookings = bookingService.getAllBookings();
            }

            return ResponseEntity.ok(ApiResponse.success(bookings));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching bookings: " + e.getMessage()));
        }
    }

    /**
     * Get a single booking by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDTO>> getBookingById(@PathVariable Long id) {
        BookingDTO booking = bookingService.getBookingById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    /**
     * Update booking payment status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingDTO>> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        try {
            // Check if booking exists
            bookingService.getBookingById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

            // Get status from payload
            String statusString = payload.get("status");
            if (statusString == null || statusString.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Status is required"));
            }

            Booking.PaymentStatus status = Booking.PaymentStatus.valueOf(statusString.toUpperCase());

            // Update status
            bookingService.updateBookingStatus(id, status);

            // Return updated booking
            BookingDTO updatedBooking = bookingService.getBookingById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

            return ResponseEntity.ok(ApiResponse.success(updatedBooking, "Booking status updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid status value"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating booking status: " + e.getMessage()));
        }
    }

    /**
     * Delete a booking
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable Long id) {
        try {
            // Check if booking exists
            bookingService.getBookingById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

            // Delete booking
            bookingService.deleteBooking(id);

            return ResponseEntity.ok(ApiResponse.success(null, "Booking deleted successfully"));
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting booking: " + e.getMessage()));
        }
    }

    /**
     * Get booking statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookingStats() {
        try {
            List<BookingDTO> allBookings = bookingService.getAllBookings();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBookings", allBookings.size());

            // Count by status
            long completedCount = allBookings.stream()
                    .filter(b -> b.getPaymentStatus() == Booking.PaymentStatus.COMPLETED)
                    .count();
            long pendingCount = allBookings.stream()
                    .filter(b -> b.getPaymentStatus() == Booking.PaymentStatus.PENDING)
                    .count();
            long cancelledCount = allBookings.stream()
                    .filter(b -> b.getPaymentStatus() == Booking.PaymentStatus.CANCELLED)
                    .count();

            stats.put("completed", completedCount);
            stats.put("pending", pendingCount);
            stats.put("cancelled", cancelledCount);

            // Total revenue
            double totalRevenue = allBookings.stream()
                    .filter(b -> b.getPaymentStatus() == Booking.PaymentStatus.COMPLETED)
                    .mapToDouble(BookingDTO::getTotalAmount)
                    .sum();

            stats.put("totalRevenue", totalRevenue);

            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching booking statistics: " + e.getMessage()));
        }
    }

    /**
     * Get bookings for a specific screening
     */
    @GetMapping("/screening/{screeningId}")
    public ResponseEntity<ApiResponse<List<BookingDTO>>> getBookingsByScreening(
            @PathVariable Long screeningId) {

        try {
            List<BookingDTO> bookings = bookingService.getBookingsByScreeningId(screeningId);
            return ResponseEntity.ok(ApiResponse.success(bookings));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching bookings: " + e.getMessage()));
        }
    }
}