const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

// M3U8 links mapped by ID
const CHANNELS = {
    "1": "https://ts-j8bh.onrender.com/box.ts?id=1",
    "2": "https://ts-j8bh.onrender.com/box.ts?id=2"
    "3": "https://ts-j8bh.onrender.com/box.ts?id=3"
    "4": "https://ts-j8bh.onrender.com/box.ts?id=4"
};

app.get('/box.mpd', (req, res) => {
    const id = req.query.id;
    const url = CHANNELS[id];
    if (!url) return res.status(404).send("Invalid ID");

    const outDir = `/tmp/dash_output_${id}`;
    const mpdPath = `${outDir}/stream.mpd`;

    // Serve cached if exists
    if (fs.existsSync(mpdPath)) {
        return res.sendFile(mpdPath);
    }

    fs.mkdirSync(outDir, { recursive: true });

    const ffmpegCmd = `ffmpeg -i "${url}" -map 0 -f dash -seg_duration 4 -use_template 1 -use_timeline 1 "${mpdPath}"`;

    exec(ffmpegCmd, (error, stdout, stderr) => {
        if (error) {
            console.error(stderr);
            return res.status(500).send("FFmpeg conversion failed");
        }
        res.sendFile(mpdPath);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
