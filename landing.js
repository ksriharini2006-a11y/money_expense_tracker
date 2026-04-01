let transactions = [];

function loadFromLocalStorage() {
    const stored = localStorage.getItem('transactions');
    if (stored) {
        transactions = JSON.parse(stored);
    }
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// ── Canvas Flow Animation ──────────────────────────────────────────
function runFlowCanvas() {
    const canvas = document.getElementById('flowCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 380;

    const W = canvas.width;
    const H = canvas.height;

    const particles = [];
    const nodes = [
        { x: 120,     y: H / 2,      label: '💼 Income',  color: '#48bb78', r: 38 },
        { x: W / 2,   y: H / 2,      label: '💰 Balance', color: '#667eea', r: 48 },
        { x: W - 120, y: H / 2 - 80, label: '🏠 Rent',    color: '#f56565', r: 30 },
        { x: W - 120, y: H / 2 + 10, label: '🍔 Food',    color: '#ed8936', r: 30 },
        { x: W - 120, y: H / 2 + 90, label: '🛍️ Shop',   color: '#a855f7', r: 30 },
    ];

    function spawnParticle() {
        const fromIdx = Math.random() < 0.6 ? 0 : 1;
        const toIdx = fromIdx === 0 ? 1 : (Math.floor(Math.random() * 3) + 2);
        const from = nodes[fromIdx];
        const to   = nodes[toIdx];
        particles.push({
            x: from.x, y: from.y,
            tx: to.x,  ty: to.y,
            color: to.color,
            progress: 0,
            speed: 0.008 + Math.random() * 0.008,
            size: 4 + Math.random() * 3,
        });
    }

    function drawPath(a, b, alpha) {
        const cx = (a.x + b.x) / 2;
        const cy = (a.y + b.y) / 2 - 40;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, b.x, b.y);
        ctx.strokeStyle = 'rgba(255,255,255,' + alpha + ')';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, W, H);

        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#0f0f1a');
        bg.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        drawPath(nodes[0], nodes[1], 0.15);
        drawPath(nodes[1], nodes[2], 0.12);
        drawPath(nodes[1], nodes[3], 0.12);
        drawPath(nodes[1], nodes[4], 0.12);

        nodes.forEach(function(n) {
            var grd = ctx.createRadialGradient(n.x, n.y, n.r * 0.3, n.x, n.y, n.r * 1.8);
            grd.addColorStop(0, n.color + '55');
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * 1.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = n.color + '33';
            ctx.fill();
            ctx.strokeStyle = n.color;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold ' + (n.r > 35 ? 13 : 11) + 'px Segoe UI';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.label, n.x, n.y);
        });

        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.progress += p.speed;

            var cx = (p.x + p.tx) / 2;
            var cy = Math.min(p.y, p.ty) - 40;
            var t = Math.min(p.progress, 1);
            var px = (1-t)*(1-t)*p.x + 2*(1-t)*t*cx + t*t*p.tx;
            var py = (1-t)*(1-t)*p.y + 2*(1-t)*t*cy + t*t*p.ty;

            var g = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2);
            g.addColorStop(0, p.color);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(px, py, p.size * 2, 0, Math.PI * 2);
            ctx.fill();

            if (p.progress >= 1) particles.splice(i, 1);
        }

        frame++;
        if (frame % 18 === 0) spawnParticle();
        requestAnimationFrame(draw);
    }

    draw();
}

// ── Boot ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    runFlowCanvas();
});
