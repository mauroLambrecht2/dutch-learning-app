#!/bin/bash

# Deploy the fixed Supabase Edge Function

echo "🚀 Deploying fixed Supabase Edge Function..."
echo ""

# Deploy the function
supabase functions deploy make-server-a784a06a

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Refresh your browser"
echo "2. Check for console errors"
echo "3. Try creating a tag in the notes interface"
echo ""
echo "📊 To view logs:"
echo "   supabase functions logs make-server-a784a06a --follow"
echo ""
