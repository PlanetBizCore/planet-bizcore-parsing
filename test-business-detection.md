# Test Upload Instructions

## Testing Enhanced Business Model Detection

1. **Clear Previous Data**: Run the `clear-data.sql` script in Supabase SQL Editor
2. **Upload Planet bizCORE Doc**: Drag the operational model document to the upload interface
3. **Verify Detection**: Check that all 4 business models are properly tagged:
   - ✅ JMS3 
   - ✅ ai4coaches
   - ✅ Subject Matter Elders  
   - ✅ bizCore360

## Expected Results
The Planet bizCORE operational model should now be detected with:
- **Business Tags**: JMS3, ai4coaches, SubjectMatterElders, bizCore360
- **Full Content**: Complete document with all narrative details preserved
- **Intelligence Categories**: Strategic planning, business process, competition analysis, etc.
- **Section Analysis**: Automatic parsing of document structure

## Fixed Issues
- ❌ Business model detection patterns were too generic
- ✅ Updated with exact terms from Planet bizCORE document
- ❌ Content preview was truncated at 500 characters  
- ✅ Now shows complete document content
- ❌ Missing ai4coaches in detection patterns
- ✅ Added comprehensive ai4coaches patterns
