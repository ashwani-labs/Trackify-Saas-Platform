package com.trackify.tenant.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trackify.common.enums.Plan;
import com.trackify.common.enums.TenantStatus;
import com.trackify.tenant.dto.CreateTenantRequest;
import com.trackify.tenant.dto.TenantResponse;
import com.trackify.tenant.service.TenantService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = TenantController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for unit test
class TenantControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private TenantService tenantService;

  @Autowired private ObjectMapper objectMapper;

  @Test
  void testCreateTenant_Success() throws Exception {
    CreateTenantRequest request = new CreateTenantRequest();
    request.setName("Acme Corp");
    request.setCode("acme");
    request.setAdminEmail("admin@acme.com");
    request.setPlan(Plan.PRO);

    TenantResponse response = TenantResponse.builder()
        .id(1L)
        .name("Acme Corp")
        .domain("acme")
        .status(TenantStatus.ACTIVE)
        .build();

    when(tenantService.createTenant(any(CreateTenantRequest.class))).thenReturn(response);

    mockMvc.perform(post("/tenants")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.id").value(1L))
        .andExpect(jsonPath("$.data.name").value("Acme Corp"))
        .andExpect(jsonPath("$.data.domain").value("acme"));
  }
}
