package com.example.full_stack.dto;

public class ReviewReplyRequest {
    private String reply;

    public ReviewReplyRequest() {}

    public ReviewReplyRequest(String reply) {
        this.reply = reply;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
}

