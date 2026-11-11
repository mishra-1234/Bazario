package com.example.full_stack.controller;

import com.example.full_stack.dto.ReviewCreateRequest;
import com.example.full_stack.dto.ReviewDTO;
import com.example.full_stack.dto.ReviewSummaryResponse;
import com.example.full_stack.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        ReviewController controller = new ReviewController(reviewService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testGetVendorReviews_Success() throws Exception {
        ReviewSummaryResponse summary = new ReviewSummaryResponse();
        summary.setAverageRating(4.8);
        summary.setTotalReviews(10L);
        summary.setCount5(8L);
        summary.setCount4(2L);

        ReviewDTO r1 = new ReviewDTO();
        r1.setId(1L);
        r1.setCustomerName("Samar");
        r1.setRating(5);
        r1.setTitle("Excellent product");
        r1.setComment("Worked like a charm!");
        r1.setVerifiedPurchase(true);
        r1.setCreatedAt(LocalDateTime.now());
        summary.setReviews(List.of(r1));

        when(reviewService.getVendorReviews(eq(1L), any(), any(), any(), any()))
                .thenReturn(summary);

        mockMvc.perform(get("/api/reviews/vendor/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating").value(4.8))
                .andExpect(jsonPath("$.totalReviews").value(10))
                .andExpect(jsonPath("$.reviews[0].customerName").value("Samar"))
                .andExpect(jsonPath("$.reviews[0].verifiedPurchase").value(true));
    }

    @Test
    void testReplyToReview_Success() throws Exception {
        ReviewDTO updated = new ReviewDTO();
        updated.setId(1L);
        updated.setVendorReply("Thank you for your valuable feedback!");

        when(reviewService.replyToReview(eq(1L), eq(1L), anyString()))
                .thenReturn(updated);

        String json = "{\"reply\": \"Thank you for your valuable feedback!\"}";

        mockMvc.perform(post("/api/reviews/1/reply?vendorId=1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vendorReply").value("Thank you for your valuable feedback!"));
    }

    @Test
    void testCreateReview_Success() throws Exception {
        ReviewDTO created = new ReviewDTO();
        created.setId(5L);
        created.setCustomerName("Ananya");
        created.setRating(5);
        created.setTitle("Great buy");

        when(reviewService.createReview(any(ReviewCreateRequest.class)))
                .thenReturn(created);

        String json = """
                {
                    "productId": 16,
                    "vendorShopId": 9,
                    "customerName": "Ananya",
                    "customerEmail": "ananya@gmail.com",
                    "rating": 5,
                    "title": "Great buy",
                    "comment": "Very satisfied with this product!"
                }
                """;

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.customerName").value("Ananya"))
                .andExpect(jsonPath("$.rating").value(5));
    }
}

