# Database Cleanup and Setup Instructions

## Step 1: Clear Existing Data
1. Open Supabase SQL Editor
2. Copy and paste the contents of `clear_database.sql`
3. Run the script to clear all existing documents and sections
4. Verify that all tables show 0 records

## Step 2: Apply Enhanced Schema (Optional - for Hierarchical Topics Testing)
If you want to test the hierarchical topics feature:
1. After clearing the database, copy and paste the contents of `hierarchical_topics_schema.sql`
2. Run the enhanced schema script
3. This will add the hierarchical topics tables alongside existing structure

## Step 3: Configure Environment
Make sure your `.env.local` is configured for the features you want to test:

### For Basic Testing (Production Features)
```bash
NEXT_PUBLIC_ENABLE_HIERARCHICAL_TOPICS=false
NEXT_PUBLIC_DATABASE_SCHEMA_VERSION=1
```

### For Enhanced Testing (Development Features)
```bash
NEXT_PUBLIC_ENABLE_HIERARCHICAL_TOPICS=true
NEXT_PUBLIC_ENABLE_AUTO_TOPIC_EXTRACTION=true
NEXT_PUBLIC_DATABASE_SCHEMA_VERSION=2
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

## Step 4: Restart Development Server
```bash
npm run dev
```

## Step 5: Test Upload
Upload some overview documents to test:
- Auto-population of business model narratives
- Hierarchical topic extraction (if enabled)
- Business model detection
- Cross-reference generation

## Expected Results
- Documents should auto-populate business model narratives
- If hierarchical topics enabled: Auto-creation of topic trees
- Debug mode (if enabled): Detailed extraction information in console
- Zero existing documents interference

## Rollback Plan
If anything goes wrong:
1. Switch back to master branch: `git checkout master`
2. Restore production environment: Copy `.env.production` to `.env.local`
3. Redeploy: `npx vercel --prod`

Your production app remains safe and unaffected during this testing.
