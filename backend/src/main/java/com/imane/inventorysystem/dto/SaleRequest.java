package com.imane.inventorysystem.dto;

import lombok.Data;

import java.util.List;

@Data
public class SaleRequest {

    private List<ItemRequest> items;

    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }
}