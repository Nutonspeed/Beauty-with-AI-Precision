#!/usr/bin/env node

// Audit Cleanup Script
const { createClient } = require('@supabase/supabase-js')
const { auditConfig } = require('../config/audit')

class AuditCleanup {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }

  async cleanup(options = {}) {
    console.log('🧹 Starting audit cleanup...')
    
    try {
      const retentionDays = options.days || auditConfig.retention.days
      const dryRun = options.dryRun || false
      
      console.log(`Retention period: ${retentionDays} days`)
      console.log(`Dry run: ${dryRun}`)
      
      // Calculate cutoff date
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
      
      console.log(`Cutoff date: ${cutoffDate.toISOString()}`)
      
      // Count events to be deleted
      const { count, error: countError } = await this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .lt('timestamp', cutoffDate.toISOString())
      
      if (countError) throw countError
      
      console.log(`Events to delete: ${count}`)
      
      if (dryRun) {
        console.log('Dry run completed - no changes made')
        return count
      }
      
      // Delete old events
      const { data, error } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('count')
      
      if (error) throw error
      
      console.log(`✅ Successfully deleted ${data.length} audit events`)
      
      // Log cleanup operation
      await this.logCleanup(data.length, retentionDays)
      
      return data.length
      
    } catch (error) {
      console.error('❌ Audit cleanup failed:', error)
      throw error
    }
  }

  async archive(options = {}) {
    console.log('📦 Starting audit archive...')
    
    try {
      const thresholdDays = options.days || auditConfig.archive.thresholdDays
      const dryRun = options.dryRun || false
      
      console.log(`Archive threshold: ${thresholdDays} days`)
      console.log(`Dry run: ${dryRun}`)
      
      // Calculate cutoff date
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - thresholdDays)
      
      console.log(`Cutoff date: ${cutoffDate.toISOString()}`)
      
      // Get events to archive
      const { data: events, error: fetchError } = await this.supabase
        .from('audit_logs')
        .select('*')
        .lt('timestamp', cutoffDate.toISOString())
        .order('timestamp', { ascending: true })
      
      if (fetchError) throw fetchError
      
      console.log(`Events to archive: ${events.length}`)
      
      if (events.length === 0) {
        console.log('No events to archive')
        return 0
      }
      
      if (dryRun) {
        console.log('Dry run completed - no changes made')
        return events.length
      }
      
      // Create archive file
      const archiveData = JSON.stringify(events, null, 2)
      const archiveFile = `audit_archive_${new Date().toISOString().split('T')[0]}.json`
      
      // Save archive file
      const fs = require('fs')
      const path = require('path')
      const archiveDir = path.join(process.cwd(), 'archives', 'audit')
      
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true })
      }
      
      const archivePath = path.join(archiveDir, archiveFile)
      fs.writeFileSync(archivePath, archiveData)
      
      console.log(`📁 Archive saved to: ${archivePath}`)
      
      // Delete archived events from database
      const { error: deleteError } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
      
      if (deleteError) throw deleteError
      
      console.log(`✅ Successfully archived ${events.length} audit events`)
      
      // Log archive operation
      await this.logArchive(events.length, thresholdDays, archiveFile)
      
      return events.length
      
    } catch (error) {
      console.error('❌ Audit archive failed:', error)
      throw error
    }
  }

  async stats() {
    console.log('📊 Audit statistics:')
    
    try {
      // Total events
      const { count: total, error: totalError } = await this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
      
      if (totalError) throw totalError
      
      console.log(`  Total events: ${total}`)
      
      // Events by category
      const { data: categories, error: catError } = await this.supabase
        .from('audit_logs')
        .select('category')
        .then(({ data, error }) => {
          if (error) throw error
          
          const counts = {}
          data.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1
          })
          
          return { data: counts, error: null }
        })
      
      if (catError) throw catError
      
      console.log('  By category:')
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`    ${category}: ${count}`)
      })
      
      // Events by severity
      const { data: severities, error: sevError } = await this.supabase
        .from('audit_logs')
        .select('severity')
        .then(({ data, error }) => {
          if (error) throw error
          
          const counts = {}
          data.forEach(item => {
            counts[item.severity] = (counts[item.severity] || 0) + 1
          })
          
          return { data: counts, error: null }
        })
      
      if (sevError) throw sevError
      
      console.log('  By severity:')
      Object.entries(severities).forEach(([severity, count]) => {
        console.log(`    ${severity}: ${count}`)
      })
      
      // Oldest and newest events
      const { data: oldest, error: oldestError } = await this.supabase
        .from('audit_logs')
        .select('timestamp')
        .order('timestamp', { ascending: true })
        .limit(1)
        .single()
      
      if (oldestError && oldestError.code !== 'PGRST116') throw oldestError
      
      const { data: newest, error: newestError } = await this.supabase
        .from('audit_logs')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      
      if (newestError && newestError.code !== 'PGRST116') throw newestError
      
      if (oldest?.timestamp) {
        console.log(`  Oldest event: ${oldest.timestamp}`)
      }
      
      if (newest?.timestamp) {
        console.log(`  Newest event: ${newest.timestamp}`)
      }
      
    } catch (error) {
      console.error('❌ Failed to get audit statistics:', error)
      throw error
    }
  }

  async logCleanup(deletedCount, retentionDays) {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          id: `cleanup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          action: 'cleanup',
          resource: 'audit_logs',
          details: {
            deletedCount,
            retentionDays,
            automated: true
          },
          severity: 'low',
          category: 'system',
          result: 'success',
          source: 'audit-cleanup-script'
        })
    } catch (error) {
      console.error('Failed to log cleanup operation:', error)
    }
  }

  async logArchive(archivedCount, thresholdDays, archiveFile) {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          id: `archive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          action: 'archive',
          resource: 'audit_logs',
          details: {
            archivedCount,
            thresholdDays,
            archiveFile,
            automated: true
          },
          severity: 'low',
          category: 'system',
          result: 'success',
          source: 'audit-archive-script'
        })
    } catch (error) {
      console.error('Failed to log archive operation:', error)
    }
  }
}

// CLI interface
const cleanup = new AuditCleanup()
const command = process.argv[2]
const options = {
  days: process.argv.includes('--days') ? parseInt(process.argv[process.argv.indexOf('--days') + 1]) : undefined,
  dryRun: process.argv.includes('--dry-run')
}

switch (command) {
  case 'cleanup':
    cleanup.cleanup(options)
    break
    
  case 'archive':
    cleanup.archive(options)
    break
    
  case 'stats':
    cleanup.stats()
    break
    
  default:
    console.log('Usage: node audit-cleanup.js [cleanup|archive|stats] [options]')
    console.log('Options:')
    console.log('  --days <number>    Set custom days threshold')
    console.log('  --dry-run          Show what would be done without making changes')
    break
}

module.exports = AuditCleanup
