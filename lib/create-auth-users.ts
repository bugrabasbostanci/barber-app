import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ROLE_KEY!; // Service role key needed

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function createAuthUsers() {
  try {
    console.log("🔐 Creating Supabase auth users...");

    // Staff members (can login to admin panel)
    const staffUsers = [
      {
        email: "michael.johnson@barberapp.com",
        password: "barber123",
        name: "Michael Johnson",
      },
      {
        email: "david.smith@barberapp.com",
        password: "barber123",
        name: "David Smith",
      },
      {
        email: "alex.brown@barberapp.com",
        password: "employee123",
        name: "Alex Brown",
      },
    ];

    // Customers (can make appointments)
    const customerUsers = [
      {
        email: "john.wilson@gmail.com",
        password: "customer123",
        name: "John Wilson",
      },
      {
        email: "robert.davis@outlook.com",
        password: "customer123",
        name: "Robert Davis",
      },
      {
        email: "james.miller@yahoo.com",
        password: "customer123",
        name: "James Miller",
      },
      {
        email: "william.garcia@hotmail.com",
        password: "customer123",
        name: "William Garcia",
      },
    ];

    const allUsers = [...staffUsers, ...customerUsers];

    for (const user of allUsers) {
      try {
        const { error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name: user.name,
          },
        });

        if (error) {
          console.warn(
            `⚠️ Could not create auth user ${user.email}:`,
            error.message
          );
        } else {
          console.log(`✓ Created auth user: ${user.name} (${user.email})`);
        }
      } catch (err) {
        console.warn(`⚠️ Error creating ${user.email}:`, err);
      }
    }

    console.log("✅ Auth users creation completed!");
    return { success: true };
  } catch (error) {
    console.error("❌ Error creating auth users:", error);
    return { success: false, error };
  }
}
