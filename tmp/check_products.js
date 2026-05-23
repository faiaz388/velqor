const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('title, stock_quantity, status');
    
    if (error) {
        console.error(error);
        return;
    }
    
    console.log(JSON.stringify(data, null, 2));
}

checkProducts();
