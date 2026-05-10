package com.miscast.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RatingTransformService {

    @Value("${rating.transform.center:7.0}")
    private double center;

    @Value("${rating.transform.amplitude:3.0}")
    private double amplitude;

    @Value("${rating.transform.steepness:0.1}")
    private double steepness;

    // y = x + a * tanh(b * (x - c))
    // Ratings at center stay unchanged; above-center rise, below-center fall.
    public double transform(double raw) {
        double adjusted = raw + amplitude * Math.tanh(steepness * (raw - center));
        return Math.max(1.0, Math.min(10.0, adjusted));
    }
}
