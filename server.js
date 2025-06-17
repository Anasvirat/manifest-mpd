const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;

// Hardcoded M3U8 links by ID
const CHANNELS = {
    "1": "https://ts-j8bh.onrender.com/box.ts?id=1",
    "2": "https://ts-j8bh.onrender.com/box.ts?id=2",
    "3": "https://ts-j8bh.onrender.com/box.ts?id=3"
    "4": "https://ts-j8bh.onrender.com/box.ts?id=4"
};

app.get('/box.mpd', (req, res) => {
    const id = req.query.id;
    const url = CHANNELS[id];

    if (!url) return res.status(404).send("Invalid ID");

    const outDir = `dash_output_${id}`;
    const mpdPath = `${outDir}/stream.mpd`;

    // Serve already existing mpd if available
    if (fs.existsSync(mpdPath)) {
        return res.sendFile(mpdPath, { root: '.' });
    }

    // Create output directory if not exists
    fs.mkdirSync(outDir, { recursive: true });

    // Convert M3U8 to MPEG-DASH using FFmpeg
    const cmd = `ffmpeg -i "${url}" -map 0 -f dash -seg_duration 4 -use_template 1 -use_timeline 1 "${mpdPath}"`;

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return res.status(500).send("FFmpeg failed");
        }

        res.sendFile(mpdPath, { root: '.' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
