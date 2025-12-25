import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const bulkCreateSchema = z.object({
  users: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    role: z.enum(['super_admin', 'clinic_admin', 'staff', 'customer']),
    clinic_id: z.string().uuid().optional(),
    phone: z.string().optional(),
    status: z.enum(['pending', 'active', 'suspended']).default('active'),
  }))
})

const bulkUpdateSchema = z.object({
  userIds: z.array(z.string().uuid()),
  updates: z.object({
    role: z.enum(['super_admin', 'clinic_admin', 'staff', 'customer']).optional(),
    clinic_id: z.string().uuid().optional(),
    status: z.enum(['pending', 'active', 'suspended']).optional(),
    phone: z.string().optional(),
  })
})

// POST: Bulk create users
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const validation = bulkCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error },
        { status: 400 }
      )
    }

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { users } = validation.data
    const results = {
      success: [] as Array<{ email: string; id: string }>,
      failed: [] as Array<{ email: string; error: string }>
    }

    for (const userData of users) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('email')
          .eq('email', userData.email)
          .single()

        if (existingUser) {
          results.failed.push({
            email: userData.email,
            error: 'User already exists'
          })
          continue
        }

        // Validate clinic_id if provided
        if (userData.clinic_id && userData.role !== 'customer') {
          const { data: clinic } = await supabase
            .from('clinics')
            .select('id')
            .eq('id', userData.clinic_id)
            .single()

          if (!clinic) {
            results.failed.push({
              email: userData.email,
              error: 'Invalid clinic_id'
            })
            continue
          }
        }

        // Create auth user with random password
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          email_confirm: true,
          password: tempPassword,
          user_metadata: {
            name: userData.name || userData.email.split('@')[0],
            role: userData.role,
            clinic_id: userData.clinic_id,
            phone: userData.phone,
          },
        })

        if (authError) {
          results.failed.push({
            email: userData.email,
            error: authError.message
          })
          continue
        }

        // Create user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            role: userData.role,
            clinic_id: userData.role === 'customer' ? null : userData.clinic_id,
            phone: userData.phone,
            status: userData.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (profileError) {
          // Rollback auth user
          await supabase.auth.admin.deleteUser(authUser.user.id)
          results.failed.push({
            email: userData.email,
            error: 'Failed to create user profile'
          })
          continue
        }

        results.success.push({
          email: userData.email,
          id: authUser.user.id
        })

        // Log the action
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'created',
          resource_type: 'user',
          resource_id: authUser.user.id,
          metadata: userData,
        })

      } catch (error) {
        results.failed.push({
          email: userData.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      results,
      summary: {
        total: users.length,
        success: results.success.length,
        failed: results.failed.length
      }
    })
  } catch (error) {
    console.error('Error in bulk create users:', error)
    return NextResponse.json(
      { error: 'Failed to create users' },
      { status: 500 }
    )
  }
}

// PATCH: Bulk update users
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const validation = bulkUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error },
        { status: 400 }
      )
    }

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userIds, updates } = validation.data

    // Update users
    const { data: updatedUsers, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', userIds)
      .select()

    if (error) throw error

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'bulk_updated',
      resource_type: 'user',
      metadata: {
        userIds,
        updates,
      },
    })

    return NextResponse.json({ 
      success: true,
      updatedCount: updatedUsers.length,
      users: updatedUsers
    })
  } catch (error) {
    console.error('Error in bulk update users:', error)
    return NextResponse.json(
      { error: 'Failed to update users' },
      { status: 500 }
    )
  }
}

// DELETE: Bulk delete users
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get('ids')?.split(',')

    if (!userIds || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds parameter is required' },
        { status: 400 }
      )
    }

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent self-deletion
    if (userIds.includes(user.id)) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get user emails for logging
    const { data: usersToDelete } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds)

    // Delete user profiles
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .in('id', userIds)

    if (profileError) throw profileError

    // Delete auth users
    for (const userId of userIds) {
      await supabase.auth.admin.deleteUser(userId)
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'bulk_deleted',
      resource_type: 'user',
      metadata: {
        userIds,
        deletedUsers: usersToDelete,
      },
    })

    return NextResponse.json({ 
      success: true,
      deletedCount: userIds.length
    })
  } catch (error) {
    console.error('Error in bulk delete users:', error)
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    )
  }
}
