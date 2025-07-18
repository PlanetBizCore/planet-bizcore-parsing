// Feature flags for safe development and deployment
// Controls new hierarchical topics functionality

export const FEATURE_FLAGS = {
  // Hierarchical Topics System
  ENABLE_HIERARCHICAL_TOPICS: process.env.NEXT_PUBLIC_ENABLE_HIERARCHICAL_TOPICS === 'true',
  
  // Auto-extraction features
  ENABLE_AUTO_TOPIC_EXTRACTION: process.env.NEXT_PUBLIC_ENABLE_AUTO_TOPIC_EXTRACTION === 'true',
  
  // Enhanced database schema
  ENABLE_ENHANCED_SCHEMA: process.env.NEXT_PUBLIC_ENABLE_ENHANCED_SCHEMA === 'true',
  
  // Development features
  ENABLE_DEBUG_MODE: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
  SHOW_EXTRACTION_DETAILS: process.env.NEXT_PUBLIC_SHOW_EXTRACTION_DETAILS === 'true',
  
  // Database versioning
  DATABASE_SCHEMA_VERSION: process.env.NEXT_PUBLIC_DATABASE_SCHEMA_VERSION || '1',
  
  // Gradual rollout controls
  HIERARCHICAL_TOPICS_PERCENTAGE: parseInt(process.env.NEXT_PUBLIC_HIERARCHICAL_TOPICS_PERCENTAGE || '0'),
  
  // Safety switches
  ENABLE_PRODUCTION_SAFETY: process.env.NODE_ENV === 'production',
  ALLOW_SCHEMA_MIGRATION: process.env.NEXT_PUBLIC_ALLOW_SCHEMA_MIGRATION === 'true'
} as const;

// Feature flag helper functions
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag] === true;
};

export const isHierarchicalTopicsEnabled = (): boolean => {
  return FEATURE_FLAGS.ENABLE_HIERARCHICAL_TOPICS;
};

export const shouldShowEnhancedUI = (): boolean => {
  return isFeatureEnabled('ENABLE_HIERARCHICAL_TOPICS') && 
         isFeatureEnabled('ENABLE_ENHANCED_SCHEMA');
};

export const getDatabaseSchemaVersion = (): string => {
  return FEATURE_FLAGS.DATABASE_SCHEMA_VERSION;
};

// Development helpers
export const isDebugMode = (): boolean => {
  return FEATURE_FLAGS.ENABLE_DEBUG_MODE;
};

export const shouldShowExtractionDetails = (): boolean => {
  return FEATURE_FLAGS.SHOW_EXTRACTION_DETAILS;
};

// Production safety checks
export const canModifySchema = (): boolean => {
  if (FEATURE_FLAGS.ENABLE_PRODUCTION_SAFETY) {
    return FEATURE_FLAGS.ALLOW_SCHEMA_MIGRATION;
  }
  return true; // Development environment
};

// Gradual rollout support
export const shouldEnableForUser = (userId?: string): boolean => {
  if (!isFeatureEnabled('ENABLE_HIERARCHICAL_TOPICS')) {
    return false;
  }
  
  const percentage = FEATURE_FLAGS.HIERARCHICAL_TOPICS_PERCENTAGE;
  if (percentage === 100) return true;
  if (percentage === 0) return false;
  
  // Simple hash-based rollout
  if (userId) {
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 100) < percentage;
  }
  
  return false;
};

// Environment validation
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required environment variables in production
  if (FEATURE_FLAGS.ENABLE_PRODUCTION_SAFETY) {
    if (!process.env.SUPABASE_URL) {
      errors.push('SUPABASE_URL is required in production');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY is required in production');
    }
  }
  
  // Validate schema version
  const schemaVersion = getDatabaseSchemaVersion();
  if (!['1', '2'].includes(schemaVersion)) {
    errors.push(`Invalid database schema version: ${schemaVersion}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Feature flag logging (for debugging)
export const logFeatureFlags = (): void => {
  if (isDebugMode()) {
    console.log('🚩 Feature Flags Status:', {
      hierarchicalTopics: FEATURE_FLAGS.ENABLE_HIERARCHICAL_TOPICS,
      autoExtraction: FEATURE_FLAGS.ENABLE_AUTO_TOPIC_EXTRACTION,
      enhancedSchema: FEATURE_FLAGS.ENABLE_ENHANCED_SCHEMA,
      schemaVersion: FEATURE_FLAGS.DATABASE_SCHEMA_VERSION,
      rolloutPercentage: FEATURE_FLAGS.HIERARCHICAL_TOPICS_PERCENTAGE,
      environment: process.env.NODE_ENV
    });
  }
};

// Export types for TypeScript
export type FeatureFlag = keyof typeof FEATURE_FLAGS;
