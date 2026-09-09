import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "./apiClient";

// Mock the global fetch
global.fetch = vi.fn();

describe("ApiClient Network Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should dispatch network_error event when fetch throws TypeError", async () => {
    // 1. Setup the mock to simulate a network failure (Server down)
    fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    // 2. Setup event listener to catch the custom event
    const eventListener = vi.fn();
    window.addEventListener("network_error", eventListener);

    // 3. Call the API and expect it to throw
    await expect(apiClient.get("/tasks")).rejects.toThrow("Failed to fetch");

    // 4. Verify that our custom event was dispatched with the correct message
    expect(eventListener).toHaveBeenCalledTimes(1);
    const event = eventListener.mock.calls[0][0];
    expect(event.detail.message).toContain("mất kết nối mạng");

    // Cleanup
    window.removeEventListener("network_error", eventListener);
  });
});
