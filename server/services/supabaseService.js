const { createClient } = require('@supabase/supabase-js')
const ws = require('ws')

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: {
      transport: ws
    }
  }
)

module.exports = { supabaseAdmin }