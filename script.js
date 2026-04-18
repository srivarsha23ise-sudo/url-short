let linkDatabase = [];

async function generateAdvancedLinks() {
    const longUrl = document.getElementById('longUrl').value;
    const count = document.getElementById('linkCount').value;
    const expiryMinutes = document.getElementById('expiryTime').value;
    const btn = document.getElementById('generateBtn');

    if (!longUrl) return alert("Please enter a URL");

    btn.innerText = "Generating...";
    
    try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const baseLink = await response.text();

        const expiryDate = new Date(new Date().getTime() + expiryMinutes * 60000);

        for (let i = 0; i < count; i++) {
            const linkObj = {
                id: Math.random().toString(36).substr(2, 5),
                shortUrl: baseLink + (i > 0 ? `?v=${i}` : ""),
                originalUrl: longUrl,
                clicks: 0,
                expiresAt: expiryDate,
                isExpired: false
            };
            linkDatabase.push(linkObj);
        }
        renderTable();
    } catch (e) {
        alert("API Error");
    } finally {
        btn.innerText = "Generate & Track";
    }
}

function renderTable() {
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = "";

    linkDatabase.forEach((item, index) => {
        const now = new Date();
        const expired = now > item.expiresAt;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="link-cell" onclick="handleLinkClick(${index})">${item.shortUrl}</td>
            <td>${item.clicks}</td>
            <td class="${expired ? 'expired' : 'active'}">${expired ? 'Expired' : 'Live'}</td>
            <td><button class="qr-btn" onclick="showQR('${item.shortUrl}')">View QR</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function handleLinkClick(index) {
    const item = linkDatabase[index];
    const now = new Date();

    if (now > item.expiresAt) {
        alert("This link has expired!");
        return;
    }

    // Update Click Count
    item.clicks++;
    renderTable();

    // Redirect in New Tab
    window.open(item.originalUrl, '_blank');
}

function showQR(url) {
    const modal = document.getElementById('qr-modal');
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, { text: url, width: 128, height: 128 });
    modal.style.display = "flex";
}

// Auto-refresh table every 30 seconds to check expiry
setInterval(renderTable, 30000);
