import { useState } from "react";
import { parseGIF, decompressFrames } from "gifuct-js";

export default function Home() {
  const [links, setLinks] = useState([]);

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || file.type !== "image/gif") return alert("Please drop a GIF!");

    const buffer = await file.arrayBuffer();
    const gif = parseGIF(buffer);
    const frames = decompressFrames(gif, true);

    const uploadedLinks = [];
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const canvas = document.createElement("canvas");
      canvas.width = frame.dims.width;
      canvas.height = frame.dims.height;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(frame.dims.width, frame.dims.height);
      imageData.data.set(frame.patch);
      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      const formData = new FormData();
      formData.append("frame", blob, `frame-${i + 1}.png`);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      uploadedLinks.push(data.url);
    }

    setLinks(uploadedLinks);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(links.join("\n"));
    alert("Copied all frame URLs!");
  };

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{ border: "4px dashed gray", padding: "50px", textAlign: "center", cursor: "pointer" }}
      >
        Drag & Drop GIF Here
      </div>

      {links.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleCopy}>Copy All Links</button>
          <ul>
            {links.map((link, idx) => (
              <li key={idx}>
                {idx + 1}. <a href={link} target="_blank">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
