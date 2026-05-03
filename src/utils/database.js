import { supabase } from '../supabase.js'

// Materials operations
export const materialsApi = {
  // Get all materials
  async getAll() {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('type', { ascending: true })

    if (error) throw error
    return data
  },

  // Add new material
  async create(material) {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()

    if (error) throw error
    return data[0]
  },

  // Update material
  async update(id, updates) {
    const { data, error } = await supabase
      .from('materials')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  },

  // Delete material
  async delete(id) {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Update material quantity (for inventory management)
  async updateQuantity(id, quantityUsed) {
    const { data, error } = await supabase
      .from('materials')
      .select('quantity_kg')
      .eq('id', id)
      .single()

    if (error) throw error

    const newQuantity = Math.max(0, data.quantity_kg - quantityUsed)

    return this.update(id, { quantity_kg: newQuantity })
  }
}

// Projects operations
export const projectsApi = {
  // Get all projects (admin only - kept for backward compatibility)
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get user's projects (filtered by user_id)
  async getUserProjects(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get project with details
  async getWithDetails(id) {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (projectError) throw projectError

    const { data: details, error: detailsError } = await supabase
      .from('project_details')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: true })

    if (detailsError) throw detailsError

    return { ...project, details }
  },

  // Create new project with user_id
  async create(projectData, userId) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...projectData, user_id: userId }])
      .select()

    if (error) throw error
    return data[0]
  },

  // Update project
  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  },

  // Delete project
  async delete(id) {
    // First delete project details
    const { error: detailsError } = await supabase
      .from('project_details')
      .delete()
      .eq('project_id', id)

    if (detailsError) throw detailsError

    // Then delete project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Save project with details (for saving calculator results)
  async saveWithDetails(projectData, details, userId) {
    // Start transaction-like operation
    const project = await this.create(projectData, userId)

    const detailsWithProjectId = details.map(detail => ({
      ...detail,
      project_id: project.id
    }))

    const { data: savedDetails, error: detailsError } = await supabase
      .from('project_details')
      .insert(detailsWithProjectId)
      .select()

    if (detailsError) throw detailsError

    return { ...project, details: savedDetails }
  },

  // Mark project as paid and deduct materials
  async markAsPaid(id) {
    const project = await this.getWithDetails(id)

    // Deduct materials from inventory
    for (const detail of project.details) {
      const material = await materialsApi.getAll()
        .then(materials => materials.find(m => m.type === detail.material))

      if (material) {
        await materialsApi.updateQuantity(material.id, detail.weight_g / 1000) // Convert g to kg
      }
    }

    // Update project status
    return this.update(id, {
      status: 'paid',
      paid_at: new Date().toISOString()
    })
  }
}

// Utility functions
export const dbUtils = {
  // Calculate total cost for a project
  calculateProjectTotals(details) {
    return details.reduce((totals, detail) => ({
      weight_total_g: totals.weight_total_g + detail.weight_g,
      time_total_hours: totals.time_total_hours + detail.time_hours,
      material_used_g: totals.material_used_g + detail.weight_g,
      total_cost: totals.total_cost + detail.cost
    }), {
      weight_total_g: 0,
      time_total_hours: 0,
      material_used_g: 0,
      total_cost: 0
    })
  },

  // Get material cost per gram
  async getMaterialCostPerGram(materialType) {
    const materials = await materialsApi.getAll()
    const material = materials.find(m => m.type === materialType)

    if (!material) return 0

    return material.cost_per_kg / 1000 // Convert kg to g
  }
}

// Users operations - for access control
export const usersApi = {
  // Check if user is authorized for dashboard access
  async checkDashboardAccess(email) {
    try {
      const lowerEmail = email.toLowerCase()
      
      // Try user_profiles first (primary source)
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('has_dashboard_access')
          .eq('email', lowerEmail)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // Not found in user_profiles, try authorized_users
            console.log('User not in user_profiles, checking authorized_users')
            throw new Error('user_profiles_not_found')
          }
          throw error
        }
        
        console.log('✅ Found in user_profiles, access:', data?.has_dashboard_access)
        return data?.has_dashboard_access || false
      } catch (err) {
        if (err.message === 'user_profiles_not_found') {
          // Fallback to authorized_users
          try {
            const { data, error } = await supabase
              .from('authorized_users')
              .select('has_dashboard_access')
              .eq('email', lowerEmail)
              .single()

            if (error && error.code === 'PGRST116') {
              console.warn('User not found in either table')
              return false
            }
            if (error) throw error
            
            console.log('✅ Found in authorized_users, access:', data?.has_dashboard_access)
            return data?.has_dashboard_access || false
          } catch (fallbackErr) {
            console.warn('Fallback to authorized_users failed:', fallbackErr.message)
            return false
          }
        }
        throw err
      }
    } catch (err) {
      console.error('❌ Error checking dashboard access:', err.message)
      return false
    }
  },

  // Get or create user profile
  async getOrCreateProfile(userData) {
    if (!userData?.id || !userData?.email) {
      throw new Error('User data must include id and email')
    }

    const { data: existing } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userData.id)
      .single()

    if (existing) return existing

    // Determine if user should have dashboard access
    // Super admins always get access
    let hasAccess = false
    
    try {
      const { data: superAdminCheck } = await supabase
        .from('user_profiles')
        .select('is_super_admin')
        .eq('id', userData.id)
        .single()
      
      if (superAdminCheck?.is_super_admin) {
        hasAccess = true
        console.log('✅ User is super admin, granting dashboard access')
      }
    } catch {
      // Profile doesn't exist yet, check authorized tables
      hasAccess = await this.checkDashboardAccess(userData.email)
    }

    // Create new profile
    const { data: profile, error: insertError } = await supabase
      .from('user_profiles')
      .insert([{
        id: userData.id,
        email: userData.email.toLowerCase(),
        full_name: userData.user_metadata?.full_name || userData.email?.split('@')[0],
        has_dashboard_access: hasAccess
      }])
      .select()
      .single()

    if (insertError) throw insertError
    return profile
  },

  // Update user profile
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Add user to authorized list
  async addAuthorizedUser(email, fullName = null) {
    const { data, error } = await supabase
      .from('authorized_users')
      .insert([{
        email: email.toLowerCase(),
        full_name: fullName,
        has_dashboard_access: true
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Check if user is super admin
  async checkIfSuperAdmin(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_super_admin')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data?.is_super_admin || false
  },

  // Get all users (only for super admins)
  async getAllUsers() {
    try {
      const { data, error } = await supabase.rpc('get_all_users')
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting all users:', error)
      return []
    }
  },

  // Update user permissions (only for super admins)
  async updateUserPermissions(email, hasDashboardAccess, isSuperAdmin) {
    try {
      const { error } = await supabase.rpc('update_user_permissions', {
        target_email: email,
        new_dashboard_access: hasDashboardAccess,
        new_super_admin: isSuperAdmin
      })
      if (error) throw error
    } catch (error) {
      console.error('Error updating user permissions:', error)
      throw error
    }
  },

  // Remove user from authorized list
  async removeAuthorizedUser(email) {
    const { error } = await supabase
      .from('authorized_users')
      .delete()
      .eq('email', email.toLowerCase())

    if (error) throw error
  }
}