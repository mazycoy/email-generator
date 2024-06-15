const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

function generateUniqueVariations(baseEmail, count) {
    const [name, domain] = baseEmail.split('@');
    let variations = new Set();

    while (variations.size < count) {
        let chars = name.split('');
        for (let i = 1; i < chars.length; i++) {
            if (Math.random() > 0.5) {
                chars[i] = '.' + chars[i];
            }
        }
        variations.add(chars.join('') + '@' + domain);
        if (variations.size > 2 ** (name.length - 1)) break; // Prevent infinite loop
    }

    return Array.from(variations);
}

app.post('/generate-emails', (req, res) => {
    const { email, count } = req.body;
    const maxCount = Math.min(count, 2 ** (email.split('@')[0].length - 1));
    const variations = generateUniqueVariations(email, maxCount);

    const filename = `emails_${Date.now()}.txt`;
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, variations.join('\n'));

    setTimeout(() => {
        res.download(filePath, (err) => {
            if (err) {
                res.status(500).send('Dosya indirilemedi.');
            }
            fs.unlinkSync(filePath);
        });
    }, 10000); // 10 saniye bekletme
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
