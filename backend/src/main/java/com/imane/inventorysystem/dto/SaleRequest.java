package com.imane.inventorysystem.dto;

import lombok.Data;

import java.util.List;

@Data
public class SaleRequest {

    private List<ItemRequest> items;
}