package com.example.full_stack.dto;

import java.util.ArrayList;
import java.util.List;

public class ReviewSummaryResponse {
    private Double averageRating = 0.0;
    private Long totalReviews = 0L;
    private Long count5 = 0L;
    private Long count4 = 0L;
    private Long count3 = 0L;
    private Long count2 = 0L;
    private Long count1 = 0L;
    private Double percent5 = 0.0;
    private Double percent4 = 0.0;
    private Double percent3 = 0.0;
    private Double percent2 = 0.0;
    private Double percent1 = 0.0;
    private List<ReviewDTO> reviews = new ArrayList<>();

    public ReviewSummaryResponse() {}

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Long totalReviews) { this.totalReviews = totalReviews; }

    public Long getCount5() { return count5; }
    public void setCount5(Long count5) { this.count5 = count5; }

    public Long getCount4() { return count4; }
    public void setCount4(Long count4) { this.count4 = count4; }

    public Long getCount3() { return count3; }
    public void setCount3(Long count3) { this.count3 = count3; }

    public Long getCount2() { return count2; }
    public void setCount2(Long count2) { this.count2 = count2; }

    public Long getCount1() { return count1; }
    public void setCount1(Long count1) { this.count1 = count1; }

    public Double getPercent5() { return percent5; }
    public void setPercent5(Double percent5) { this.percent5 = percent5; }

    public Double getPercent4() { return percent4; }
    public void setPercent4(Double percent4) { this.percent4 = percent4; }

    public Double getPercent3() { return percent3; }
    public void setPercent3(Double percent3) { this.percent3 = percent3; }

    public Double getPercent2() { return percent2; }
    public void setPercent2(Double percent2) { this.percent2 = percent2; }

    public Double getPercent1() { return percent1; }
    public void setPercent1(Double percent1) { this.percent1 = percent1; }

    public List<ReviewDTO> getReviews() { return reviews; }
    public void setReviews(List<ReviewDTO> reviews) { this.reviews = reviews; }
}

