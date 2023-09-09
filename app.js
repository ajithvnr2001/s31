import React, { useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import './App.css';

function App() {
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [bucketName, setBucketName] = useState('');
  const [fileUrls, setFileUrls] = useState('');
  const [fileNames, setFileNames] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResult, setUploadResult] = useState({});

  const handleUpload = async () => {
    // Reset upload progress and result
    setUploadProgress({});
    setUploadResult({});

    // Create an S3 client
    const s3Client = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint: endpointUrl,
    });

    // Split file URLs and names by comma
    const urls = fileUrls.split(',').map((url) => url.trim());
    const names = fileNames.split(',').map((name) => name.trim());

    // Upload each file to S3
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const name = names[i];

      try {
        // Fetch the file from the URL
        const response = await fetch(url);
        const fileStream = response.body;

        // Set up parameters for the S3 upload
        const uploadParams = {
          Bucket: bucketName,
          Key: name,
          Body: fileStream,
        };

        // Upload the file to S3
        await s3Client.send(new PutObjectCommand(uploadParams));

        // Update upload progress
        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [url]: 100,
        }));

        // Update upload result
        setUploadResult((prevResult) => ({
          ...prevResult,
          [url]: 'Uploaded successfully',
        }));
      } catch (err) {
        // Update upload result with error message
        setUploadResult((prevResult) => ({
          ...prevResult,
          [url]: `Error: ${err.message}`,
        }));
      }
    }
  };

  return (
    <div className="App">
      <h1>Upload Files to S3</h1>
      <div>
        <label>AWS Access Key ID:</label>
        <input
          type="text"
          value={accessKeyId}
          onChange={(e) => setAccessKeyId(e.target.value)}
        />
      </div>
      <div>
        <label>AWS Secret Access Key:</label>
        <input
          type="password"
          value={secretAccessKey}
          onChange={(e) => setSecretAccessKey(e.target.value)}
        />
      </div>
      <div>
        <label>Endpoint URL:</label>
        <input
          type="text"
          value={endpointUrl}
          onChange={(e) => setEndpointUrl(e.target.value)}
        />
      </div>
      <div>
        <label>Bucket Name:</label>
        <input
          type="text"
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
        />
      </div>
      <div>
        <label>File URLs (separated by comma):</label>
        <textarea
          rows={5}
          value={fileUrls}
          onChange={(e) => setFileUrls(e.target.value)}
        />
      </div>
      <div>
        <label>File Names (separated by comma):</label>
        <textarea
          rows={5}
          value={fileNames}
          onChange={(e) => setFileNames(e.target.value)}
        />
      </div>
      <button onClick={handleUpload}>Upload</button>

      {/* Display upload progress and result */}
      {Object.entries(uploadProgress).map(([url, progress]) => (
        <div key={url}>
          {url}: {progress}%
          {uploadResult[url] && ` - ${uploadResult[url]}`}
        </div>
      ))}
    </div>
  );
}

export default App;
