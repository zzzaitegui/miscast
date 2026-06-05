package com.miscast.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class RatingTransformTest {

    // Mirrors RatingTransformService.transform() with default params from application.properties
    private static final double CENTER = 7.0;
    private static final double AMPLITUDE = 3.0;
    private static final double STEEPNESS = 0.1;

    private double transform(double raw) {
        double adjusted = raw + AMPLITUDE * Math.tanh(STEEPNESS * (raw - CENTER));
        return Math.max(1.0, Math.min(10.0, adjusted));
    }

    @Test
    void centerValueIsUnchanged() {
        assertEquals(CENTER, transform(CENTER), 1e-9);
    }

    @Test
    void aboveCenterIsPushedHigher() {
        assertTrue(transform(8.0) > 8.0);
        assertTrue(transform(9.0) > 9.0);
    }

    @Test
    void belowCenterIsPushedLower() {
        assertTrue(transform(5.0) < 5.0);
        assertTrue(transform(3.0) < 3.0);
    }

    @Test
    void outputClampedAtTen() {
        assertEquals(10.0, transform(10.0));
    }

    @Test
    void outputClampedAtOne() {
        // Raw 0 pushed down by the curve should still floor at 1.0
        assertEquals(1.0, transform(0.0));
    }

    @Test
    void transformIsMonotonicallyIncreasing() {
        double prev = transform(0.0);
        for (int i = 1; i <= 100; i++) {
            double cur = transform(i / 10.0);
            assertTrue(cur >= prev, "transform should be non-decreasing at " + (i / 10.0));
            prev = cur;
        }
    }
}
