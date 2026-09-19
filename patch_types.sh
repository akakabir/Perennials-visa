sed -i '/adminNote?: string;/a \  archived?: boolean;\n  archivedAt?: string;\n  archivedBy?: string;' src/types.ts
sed -i '/forgotPasswordCode?: string;/a \  defaultFromEmail?: string;' src/types.ts
