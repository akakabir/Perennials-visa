sed -i 's/import { Globe2/import { Globe2, Mail/g' src/pages/admin/Layout.tsx
sed -i '/{ name: '\''Applications'\'', path: '\''\/admin\/applications'\'', icon: Users },/a \    { name: '\''Email Center'\'', path: '\''\/admin\/emails'\'', icon: Mail },' src/pages/admin/Layout.tsx
