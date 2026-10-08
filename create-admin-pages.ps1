# ── Dashboard admin ──
$content = @"
export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d ensemble de MANDE SUGU</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Utilisateurs</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">-</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Vendeurs</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">-</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Produits</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">-</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Commandes</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">-</p>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500">En construction - Les vraies stats arrivent bientot</p>
      </div>
    </div>
  );
}
"@
Set-Content -Path "src\pages\Admin\Dashboard.tsx" -Value $content -Encoding UTF8
Write-Host "OK Dashboard.tsx" -ForegroundColor Green

# ── Users ──
$content = @"
export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Utilisateurs</h1>
        <p className="text-sm text-gray-500 mt-1">Gerer tous les utilisateurs</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 text-center">Page en construction</p>
      </div>
    </div>
  );
}
"@
Set-Content -Path "src\pages\Admin\Users.tsx" -Value $content -Encoding UTF8
Write-Host "OK Users.tsx" -ForegroundColor Green

# ── Products ──
$content = @"
export default function AdminProducts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produits</h1>
        <p className="text-sm text-gray-500 mt-1">Moderer les produits</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 text-center">Page en construction</p>
      </div>
    </div>
  );
}
"@
Set-Content -Path "src\pages\Admin\Products.tsx" -Value $content -Encoding UTF8
Write-Host "OK Products.tsx" -ForegroundColor Green

# ── Orders ──
$content = @"
export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Commandes</h1>
        <p className="text-sm text-gray-500 mt-1">Suivre les commandes</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 text-center">Page en construction</p>
      </div>
    </div>
  );
}
"@
Set-Content -Path "src\pages\Admin\Orders.tsx" -Value $content -Encoding UTF8
Write-Host "OK Orders.tsx" -ForegroundColor Green
