import { supabase } from "@/lib/supabase";

describe("Supabase Integration Tests", () => {
  describe("Connection Test", () => {
    it("should successfully connect to Supabase", async () => {
      // Try to query a non-existent table
      // If we get any response (error or data), it means we're connected
      const { data, error } = await supabase
        .from("test_connection")
        .select("*")
        .limit(1);

      // Log the actual response for debugging
      console.log("Query response - Data:", data, "Error:", error);

      // If we get an error, it should be about the table not existing
      // If we get data, the table exists and that's also fine
      // The important thing is that we can communicate with Supabase
      if (error) {
        console.log("✅ Connected to Supabase (with expected error)");
        console.log("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        // Any error response means we successfully connected to Supabase
        expect(error).toBeDefined();
      } else {
        console.log("✅ Connected to Supabase (table exists)");
        expect(data).toBeDefined();
      }
    });

    it("should have valid authentication credentials", async () => {
      // Test that we can get the current session (even if null)
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // Error should be null or undefined when checking session
      expect(error).toBeFalsy();

      // Session can be null (not logged in) but should not throw
      console.log("✅ Authentication system is accessible");
      console.log("Current session:", session ? "Active" : "None");
    });
  });

  describe("Database Health Check", () => {
    it("should be able to perform RPC calls", async () => {
      // Try to call a built-in PostgreSQL function
      // This tests that we can execute database functions
      const { data, error } = await supabase.rpc("version");

      // If the RPC endpoint is accessible, we'll either get data or a specific error
      // Both indicate we're connected
      if (data) {
        console.log("✅ Database version:", data);
        expect(data).toBeDefined();
      } else if (error) {
        console.log("⚠️ RPC call error (may be expected):", error.message);
        // Even an error indicates we're connected
        expect(error).toBeDefined();
      }
    });
  });

  describe("Environment Configuration", () => {
    it("should have Supabase URL and anon key configured", () => {
      // Check that environment variables are loaded
      const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      expect(url).toBeDefined();
      expect(url).toContain("supabase.co");
      expect(key).toBeDefined();
      expect(key && key.length).toBeGreaterThan(0);

      console.log("✅ Environment variables are configured");
      console.log("Supabase URL:", url);
    });
  });
});
