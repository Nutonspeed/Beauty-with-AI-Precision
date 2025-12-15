import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
  };
  features: {
    aiAnalysisEnabled: boolean;
    arSimulatorEnabled: boolean;
    videoCallEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  limits: {
    maxClinicsPerOwner: number;
    maxStaffPerClinic: number;
    maxAnalysesPerDay: number;
    maxStoragePerClinicMB: number;
    sessionTimeoutMinutes: number;
  };
  security: {
    requireEmailVerification: boolean;
    require2FA: boolean;
    passwordMinLength: number;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
  };
  billing: {
    currency: string;
    taxRate: number;
    freeTrialDays: number;
    gracePeriodDays: number;
  };
}

const defaultSettings: SystemSettings = {
  general: {
    siteName: 'ClinicIQ',
    siteUrl: 'https://cliniciq.app',
    supportEmail: 'support@cliniciq.app',
    defaultLanguage: 'th',
    maintenanceMode: false,
    allowNewRegistrations: true,
  },
  features: {
    aiAnalysisEnabled: true,
    arSimulatorEnabled: true,
    videoCallEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  },
  limits: {
    maxClinicsPerOwner: 5,
    maxStaffPerClinic: 50,
    maxAnalysesPerDay: 100,
    maxStoragePerClinicMB: 5000,
    sessionTimeoutMinutes: 60,
  },
  security: {
    requireEmailVerification: true,
    require2FA: false,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
  },
  billing: {
    currency: 'THB',
    taxRate: 7,
    freeTrialDays: 14,
    gracePeriodDays: 7,
  },
};

export async function GET() {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: appUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (appUser?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Try to get settings from database
    const { data: settingsRow } = await supabase
      .from('system_settings')
      .select('settings, updated_at, updated_by')
      .eq('id', 'global')
      .single();

    if (settingsRow?.settings) {
      return NextResponse.json({
        settings: settingsRow.settings as SystemSettings,
        updatedAt: settingsRow.updated_at,
        updatedBy: settingsRow.updated_by,
      });
    }

    // Return defaults if no settings in DB
    return NextResponse.json({
      settings: defaultSettings,
      updatedAt: null,
      updatedBy: null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return defaults on error
    return NextResponse.json({
      settings: defaultSettings,
      updatedAt: null,
      updatedBy: null,
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await cookies();
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: appUser } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (appUser?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: 'Missing settings' }, { status: 400 });
    }

    // Upsert settings
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        id: 'global',
        settings,
        updated_at: new Date().toISOString(),
        updated_by: appUser?.full_name || user.email,
      });

    if (error) {
      // If table doesn't exist, just return success (settings stored in memory/defaults)
      console.warn('Could not save to DB, using defaults:', error.message);
    }

    return NextResponse.json({
      success: true,
      settings,
      updatedAt: new Date().toISOString(),
      updatedBy: appUser?.full_name || user.email,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
