/**
 * Script de migración de usuarios a Supabase Auth
 *
 * INSTRUCCIONES:
 * 1. Primero ejecuta supabase-auth-migration.sql en el SQL Editor de Supabase
 * 2. Obtén tu SERVICE_ROLE_KEY desde Supabase Dashboard > Settings > API
 * 3. Reemplaza los valores de SUPABASE_URL y SERVICE_ROLE_KEY abajo
 * 4. Agrega todos los usuarios de tu tabla 'usuarios' al array 'users'
 * 5. Ejecuta: node migrate-users.mjs
 *
 * IMPORTANTE: NO commitear este archivo con las credenciales reales
 */

import { createClient } from '@supabase/supabase-js'

// ⚠️ REEMPLAZAR CON TUS VALORES REALES
const SUPABASE_URL = 'https://ebliqlpbxfjpelqdgapp.supabase.co'
const SERVICE_ROLE_KEY = 'TU_SERVICE_ROLE_KEY_AQUI' // Obtener de Supabase Dashboard > Settings > API

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ⚠️ AGREGAR TODOS LOS USUARIOS ACTIVOS DE TU TABLA 'usuarios'
// Puedes obtenerlos con: SELECT email, password, nombre, rol FROM usuarios WHERE activo = true;
const users = [
  {
    email: 'alopez@buildingme.cl',
    password: 'Mirusita968!',
    nombre: 'Alonso López',
    rol: 'admin'
  },
  {
    email: 'paula@buildingme.cl',
    password: 'Tegula175',
    nombre: 'Paula Ross',
    rol: 'admin'
  }
  // Agregar más usuarios aquí...
]

async function migrateUsers() {
  console.log('=== Migración de usuarios a Supabase Auth ===\n')

  let exitosos = 0
  let errores = 0

  for (const u of users) {
    console.log(`Procesando: ${u.email}`)

    // 1. Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.rol, nombre: u.nombre }
    })

    if (error) {
      console.error(`  ERROR creando auth user: ${error.message}`)
      errores++
      continue
    }

    console.log(`  Auth user creado: ${data.user.id}`)

    // 2. Vincular con perfil existente en tabla usuarios
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ auth_id: data.user.id })
      .eq('email', u.email)

    if (updateError) {
      console.error(`  ERROR vinculando perfil: ${updateError.message}`)
      errores++
    } else {
      console.log(`  Perfil vinculado correctamente`)
      exitosos++
    }

    console.log('')
  }

  console.log('=== Resumen ===')
  console.log(`Exitosos: ${exitosos}`)
  console.log(`Errores: ${errores}`)
  console.log(`Total: ${users.length}`)

  // 3. Verificar migración
  console.log('\n=== Verificación ===')
  const { data: perfiles, error: verifyError } = await supabase
    .from('usuarios')
    .select('email, auth_id, rol, activo')
    .eq('activo', true)

  if (verifyError) {
    console.error('Error verificando:', verifyError.message)
  } else {
    for (const p of perfiles) {
      const status = p.auth_id ? '✅' : '❌ SIN auth_id'
      console.log(`  ${status} ${p.email} (${p.rol})`)
    }
  }
}

migrateUsers().catch(console.error)
