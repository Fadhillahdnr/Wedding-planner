import { expect, test } from '@playwright/test';

const email = process.env.E2E_EMAIL ?? 'e2e@contoh.test';
const password = process.env.E2E_PASSWORD ?? 'contoh-kata-sandi';

test('login → onboarding → anggaran → vendor → ubah tanggal → dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name=email]', email);
    await page.fill('input[name=password]', password);
    await page.click('button[type=submit]');

    // Onboarding
    await expect(page).toHaveURL(/onboarding/);
    await page.fill('input[name=partner_one_name]', 'Rani');
    await page.fill('input[name=partner_two_name]', 'Dimas');
    await page.getByRole('button', { name: 'Lanjut' }).click();
    await page.getByRole('button', { name: 'Lanjut' }).click(); // tanggal: perkiraan bawaan
    await page.fill('input[name=city]', 'Bandung');
    await page.fill('input[name=guest_estimate]', '200');
    await page.getByRole('button', { name: 'Lanjut' }).click();
    await page.fill('input[name=total_budget]', '200000000');
    await page.getByRole('button', { name: 'Lanjut' }).click();
    await page.getByRole('button', { name: /Selesai|Mulai|Buat/ }).click();

    // Dashboard terisi
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('bulan lagi')).toBeVisible();

    // Anggaran
    await page.getByRole('link', { name: 'Anggaran' }).first().click();
    await expect(page.getByRole('heading', { name: 'Anggaran', level: 1 })).toBeVisible();
    await expect(page.getByText('Rincian per kategori')).toBeVisible();

    // Vendor: tambah kandidat lalu pilih
    await page.getByRole('link', { name: 'Vendor' }).first().click();
    await page.getByRole('link', { name: /Dokumentasi/ }).first().click();
    await page.getByRole('button', { name: 'Tambah kandidat' }).first().click();
    await page.getByLabel(/Nama vendor/).fill('Studio Uji');
    await page.getByLabel(/Harga penawaran/).fill('15000000');
    await page.getByRole('button', { name: 'Simpan' }).click();
    await expect(page.getByRole('heading', { name: 'Studio Uji' })).toBeVisible();
    await page.getByRole('button', { name: 'Pilih vendor ini' }).first().click();
    const confirm = page.getByRole('button', { name: /Ya, pilih|Pilih/ }).last();
    if (await confirm.isVisible()) await confirm.click();

    // Ubah Hari H lewat pratinjau, lalu konfirmasi
    await page.goto('/pengaturan/pernikahan');
    await page.getByLabel('Tanggal pasti').check();
    await page.fill('input[name=target_date]', '2028-11-11');
    await page.getByRole('button', { name: 'Lihat dampak ke jadwal' }).click();
    await page.getByRole('button', { name: 'Simpan hari H baru' }).click();
    await expect(page.getByText('Hari H berubah').or(page.getByText(/diperbarui|disimpan/i)).first()).toBeVisible();

    // Dashboard tetap konsisten (kesepakatan 15.000.000 tampil)
    await page.getByRole('link', { name: 'Ringkasan' }).first().click();
    await expect(page.getByText('15.000.000').first()).toBeVisible();
});
