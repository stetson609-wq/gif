import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "public/frames");
  form.keepExtensions = true;

  fs.mkdirSync(form.uploadDir, { recursive: true });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = files.frame;
    const fileName = `frame-${Date.now()}-${file.originalFilename}`;
    const newPath = path.join(form.uploadDir, fileName);
    fs.renameSync(file.filepath, newPath);

    const url = `/frames/${fileName}`; // permanent URL on Vercel
    res.status(200).json({ url });
  });
}
