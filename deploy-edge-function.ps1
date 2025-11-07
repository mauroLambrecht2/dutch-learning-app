# Quick deployment script for the edge function
# Run this after setting up environment variables in Supabase Dashboard

Write-Host "🚀 Deploying Dutch Learning App Edge Function..." -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
try {
    $version = supabase --version
    Write-Host "✅ Supabase CLI found: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git" -ForegroundColor Yellow
    Write-Host "   scoop install supabase" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   OR via npm:" -ForegroundColor Yellow
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Pre-deployment checklist:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create database table (run in SQL Editor):" -ForegroundColor Yellow
Write-Host "   CREATE TABLE IF NOT EXISTS kv_store_a784a06a (" -ForegroundColor Gray
Write-Host "     key TEXT PRIMARY KEY," -ForegroundColor Gray
Write-Host "     value JSONB NOT NULL," -ForegroundColor Gray
Write-Host "     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()," -ForegroundColor Gray
Write-Host "     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()" -ForegroundColor Gray
Write-Host "   );" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set environment variables in Dashboard:" -ForegroundColor Yellow
Write-Host "   - SUPABASE_URL" -ForegroundColor Gray
Write-Host "   - SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Have you completed the checklist above? (y/n)"

if ($continue -ne "y") {
    Write-Host ""
    Write-Host "⏸️  Deployment cancelled. Complete the checklist and run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔗 Checking project link..." -ForegroundColor Cyan

# Check if already linked
if (Test-Path ".\.git\config") {
    Write-Host "✅ Git repository detected" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not a git repository" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📤 Deploying function to Supabase..." -ForegroundColor Cyan
Write-Host ""

# Deploy the function
supabase functions deploy make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Test your function:" -ForegroundColor Cyan
    Write-Host "   https://tnlceozwrkspncxwcaqe.supabase.co/functions/v1/make-server-a784a06a/health" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📊 View logs:" -ForegroundColor Cyan
    Write-Host "   supabase functions logs make-server-a784a06a --project-ref tnlceozwrkspncxwcaqe" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the error messages above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Not logged in to Supabase CLI (run: supabase login)" -ForegroundColor Gray
    Write-Host "- Project ref incorrect" -ForegroundColor Gray
    Write-Host "- Network connection issues" -ForegroundColor Gray
    Write-Host ""
}
