
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
    const { data, error } = await supabase.from('payment_settings').select('*');
    if (error) {
        console.log("Error or table doesn't exist:", error.message);
    } else {
        console.log("Data from payment_settings:", data);
    }
}

checkTables();
