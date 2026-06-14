# RandomChatFace 🎥

Rastgele 1v1 görüntülü sohbet platformu. WebRTC + Socket.io tabanlı, gerçek zamanlı eşleşme.

---

## Klasör Yapısı

```
randomchatface/
├── server.js        ← Node.js + Socket.io sunucu
├── package.json
├── render.yaml      ← Render.com deploy config
└── public/
    └── index.html   ← Frontend (HTML/CSS/JS)
```

---

## 🚀 Ücretsiz Yayına Alma — Render.com (Tavsiye Edilen)

### Adım 1 — GitHub'a yükle
```bash
git init
git add .
git commit -m "RandomChatFace ilk sürüm"
```
GitHub'da yeni bir repo oluştur (örn. `randomchatface`) ve push et:
```bash
git remote add origin https://github.com/KULLANICI_ADIN/randomchatface.git
git push -u origin main
```

### Adım 2 — Render.com'da deploy et
1. https://render.com adresine git → ücretsiz hesap aç
2. **"New Web Service"** tıkla
3. GitHub reposunu seç
4. Şu ayarlar otomatik gelecek (render.yaml sayesinde):
   - **Build:** `npm install`
   - **Start:** `npm start`
5. **"Create Web Service"** → 2-3 dakika bekle
6. Sana bir URL verir: `https://randomchatface.onrender.com`

✅ Site canlı! Herkes bu URL'yi açarak kullanabilir.

---

## 🚀 Alternatif — Railway.app

1. https://railway.app → ücretsiz hesap
2. **"New Project"** → "Deploy from GitHub"
3. Repoyu seç → otomatik deploy
4. Settings → Domain → URL al

---

## 🖥️ Kendi Sunucunda Çalıştırma

```bash
# Gereksinimler: Node.js 18+
npm install
npm start
# http://localhost:3000 adresinde çalışır
```

HTTPS için (kamera zorunlu) Nginx + Let's Encrypt kullan:
```nginx
server {
    listen 443 ssl;
    server_name randomchatface.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## Özellikler

- ✅ Gerçek zamanlı 1v1 görüntülü arama (WebRTC)
- ✅ Rastgele eşleşme kuyruğu
- ✅ Anlık metin sohbeti
- ✅ Mikrofon / Kamera açma-kapatma
- ✅ "Sonraki" ile yeni eşleşme
- ✅ Çevrimiçi kullanıcı sayacı
- ✅ Mobil uyumlu arayüz

---

## Notlar

- **HTTPS zorunlu** — tarayıcılar HTTPS olmadan kamera erişimine izin vermez.
  Render/Railway otomatik HTTPS verir.
- TURN sunucusu eklenmediği için bazı ağlarda (şirket güvenlik duvarı vb.) video bağlanamayabilir.
  Ücretsiz TURN için: https://www.metered.ca/tools/openrelay/
