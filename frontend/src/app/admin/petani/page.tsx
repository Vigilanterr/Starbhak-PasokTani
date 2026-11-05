"use client";

import { UserTablePage } from "@/components/admin/UserTablePage";

export default function AdminFarmersPage() {
  return <UserTablePage role="FARMER" title="Manajemen Petani" description="Verifikasi akun, pantau produktivitas, dan kelola status petani." />;
}
