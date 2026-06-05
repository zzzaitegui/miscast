package com.miscast.backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires a running PostgreSQL instance, run manually, not in CI")
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
