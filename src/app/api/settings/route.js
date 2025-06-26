import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    // Get current settings from database
    const agentSettings = await prisma.agentSettings.findFirst();
    
    // Default settings structure
    const defaultSettings = {
      ai: {
        provider: 'claude',
        temperature: 0.7,
        maxTokens: 2000,
        timeout: 30000,
        fallbackEnabled: true,
        languageDetection: true
      },
      
      email: {
        autoReply: true,
        processingDelay: 0,
        maxEmailsPerHour: 100,
        responseTemplate: 'professional',
        signatureEnabled: true,
        signature: 'Dubai Travel Agent\nYour Dream Dubai Experience Awaits!'
      },
      
      notifications: {
        escalationEmail: 'agent@dubaitravel.com',
        emailEnabled: true
      },
      
      languages: {
        supported: ['pl', 'en', 'fr', 'de', 'es', 'it', 'ru'],
        defaultLanguage: 'pl',
        autoDetection: true,
        fallbackLanguage: 'en'
      },
      
      knowledgeBase: {
        autoUpdate: true,
        searchEnabled: true,
        maxResults: 10,
        relevanceThreshold: 0.7,
        categoriesEnabled: true
      },
      
      performance: {
        cacheEnabled: true,
        cacheTTL: 3600,
        rateLimiting: true,
        maxRequestsPerMinute: 60,
        timeoutSeconds: 30
      }
    };

    // Merge with database settings if they exist
    let currentSettings = defaultSettings;
    
    if (agentSettings) {
      // Parse JSON settings from database
      try {
        const dbSettings = JSON.parse(agentSettings.settings || '{}');
        currentSettings = {
          ...defaultSettings,
          ...dbSettings,
          email: {
            ...defaultSettings.email,
            signature: agentSettings.signature || defaultSettings.email.signature,
            autoReply: agentSettings.autoReply !== null ? agentSettings.autoReply : defaultSettings.email.autoReply
          }
        };
      } catch (error) {
        console.error('Error parsing settings from database:', error);
      }
    }

    return NextResponse.json(currentSettings);

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Błąd pobierania ustawień' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const settings = await request.json();
    
    // Validate settings structure
    const requiredSections = ['ai', 'email', 'notifications', 'languages', 'knowledgeBase', 'performance'];
    for (const section of requiredSections) {
      if (!settings[section]) {
        return NextResponse.json(
          { error: `Missing required section: ${section}` },
          { status: 400 }
        );
      }
    }

    // Check if settings record exists
    const existingSettings = await prisma.agentSettings.findFirst();
    
    if (existingSettings) {
      // Update existing settings
      await prisma.agentSettings.update({
        where: { id: existingSettings.id },
        data: {
          signature: settings.email.signature,
          autoReply: settings.email.autoReply,
          settings: JSON.stringify(settings),
          updatedAt: new Date()
        }
      });
    } else {
      // Create new settings record
      await prisma.agentSettings.create({
        data: {
          signature: settings.email.signature,
          autoReply: settings.email.autoReply,
          settings: JSON.stringify(settings),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Update environment variables in memory (for current session)
    // Note: These won't persist across server restarts
    if (settings.notifications.escalationEmail) {
      process.env.HUMAN_AGENT_EMAIL = settings.notifications.escalationEmail;
    }
    
    // Set AI provider
    if (settings.ai.provider) {
      process.env.AI_PROVIDER = settings.ai.provider;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Ustawienia zostały zapisane pomyślnie' 
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Error saving settings', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for specific setting sections
export async function PUT(request) {
  try {
    const { section, key, value } = await request.json();
    
    const existingSettings = await prisma.agentSettings.findFirst();
    let currentSettings = {};
    
    if (existingSettings) {
      try {
        currentSettings = JSON.parse(existingSettings.settings || '{}');
      } catch (error) {
        console.error('Error parsing existing settings:', error);
      }
    }

    // Update specific setting
    if (!currentSettings[section]) {
      currentSettings[section] = {};
    }
    currentSettings[section][key] = value;

    // Save back to database
    if (existingSettings) {
      await prisma.agentSettings.update({
        where: { id: existingSettings.id },
        data: {
          settings: JSON.stringify(currentSettings),
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.agentSettings.create({
        data: {
          settings: JSON.stringify(currentSettings),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Setting ${section}.${key} updated successfully` 
    });

  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Błąd aktualizacji ustawienia' },
      { status: 500 }
    );
  }
} 