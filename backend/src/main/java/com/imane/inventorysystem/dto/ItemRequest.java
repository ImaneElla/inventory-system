package com.imane.inventorysystem.dto;

import lombok.Data;

@Data
public class ItemRequest {

    private Long productId;

    private Integer quantity;
}