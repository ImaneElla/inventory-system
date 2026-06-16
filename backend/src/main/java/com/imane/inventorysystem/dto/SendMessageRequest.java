package com.imane.inventorysystem.dto;

public class SendMessageRequest {
    private String text;

    public SendMessageRequest() {}
    public SendMessageRequest(String text) { this.text = text; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
