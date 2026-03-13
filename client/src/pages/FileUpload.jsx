import React, { useState, useEffect } from 'react';

export default function FileUpload() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');

  const loadFiles = () => {
    fetch('/files/list').then(r => r.json()).then(data => setFiles(Array.isArray(data) ? data : []));
  };

  useEffect(() => { loadFiles(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const fileInput = e.target.querySelector('input[type="file"]');
    if (!fileInput.files[0]) return;

    // VULN: V12.1 - Only client-side file type validation
    formData.append('file', fileInput.files[0]);

    const res = await fetch('/files/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`File uploaded: ${data.filename}`);
      loadFiles();
    } else {
      setMessage(data.error);
    }
  };

  const downloadFile = () => {
    window.open(`/files/download?filename=${encodeURIComponent(downloadFilename)}`, '_blank');
  };

  return (
    <div>
      <div className="page-title">File Manager</div>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="two-col">
        <div>
          <div className="card">
            <h2>Upload File</h2>
            <form onSubmit={handleUpload}>
              <div className="file-drop">
                <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>&#128193;</div>
                <p style={{ color: '#888', fontSize: 13 }}>Select a file to upload</p>
                <input type="file" style={{ marginTop: 12 }} />
              </div>
              <button type="submit" className="btn btn-primary btn-block mt-16">Upload</button>
            </form>
          </div>

          <div className="card">
            <h2>Download File</h2>
            <div className="form-group">
              <label>Filename</label>
              <input
                type="text"
                value={downloadFilename}
                onChange={e => setDownloadFilename(e.target.value)}
                placeholder="Enter filename to download"
              />
            </div>
            <button onClick={downloadFile} className="btn btn-primary">Download</button>
          </div>
        </div>

        <div className="card">
          <h2>Uploaded Files</h2>
          {files.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">&#128196;</div>
              <p>No files uploaded yet.</p>
            </div>
          ) : (
            files.map((f, i) => (
              <div key={i} className="file-list-item">
                <span className="file-icon">&#128196;</span>
                <span className="file-name">{f.name}</span>
                <span className="file-size">{f.size} bytes</span>
                <a href={f.url} target="_blank" className="btn btn-sm btn-secondary" style={{ textDecoration: 'none' }}>View</a>
                {f.name.endsWith('.ejs') && (
                  <a href={`/files/render/${f.name}`} target="_blank" className="btn btn-sm btn-outline" style={{ textDecoration: 'none', marginLeft: 4 }}>Render</a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
