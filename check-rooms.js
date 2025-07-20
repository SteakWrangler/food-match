import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// You'll need to add these to your .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ahfytcfndbnwrabryjnz.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

console.log('Checking Supabase rooms...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRooms() {
  try {
    // Count total rooms
    const { count, error: countError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting rooms:', countError)
      return
    }

    console.log(`\n📊 Total rooms in database: ${count}`)

    // Get recent rooms with details
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id, host_id, location, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching rooms:', error)
      return
    }

    if (rooms && rooms.length > 0) {
      console.log('\n📋 Recent rooms:')
      rooms.forEach((room, index) => {
        console.log(`${index + 1}. Room ID: ${room.id}`)
        console.log(`   Host: ${room.host_id}`)
        console.log(`   Location: ${room.location || 'Not set'}`)
        console.log(`   Created: ${new Date(room.created_at).toLocaleString()}`)
        console.log(`   Updated: ${new Date(room.updated_at).toLocaleString()}`)
        console.log('')
      })
    } else {
      console.log('\n❌ No rooms found in database')
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkRooms() 